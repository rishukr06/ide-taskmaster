require('dotenv').config();

const config = require('../config');

import { PubSub } from '@google-cloud/pubsub';
import { ClientConfig } from '@google-cloud/pubsub/build/src/pubsub';
import { SubscriptionOptions } from '@google-cloud/pubsub/build/src/subscription';
import { Message } from '@google-cloud/pubsub/build/src/subscriber';

import * as worker from './tasks/run';

import { IJobResult } from './types';

const stackdriver = require('./utils/stackdriver');

const pubsubConfig: ClientConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  grpc: require('grpc')
};

const pubsub = new PubSub(pubsubConfig);

const jobSubscriptionName: string = config.CLOUD_PUBSUB.SUBSCRIPTION_NAME;
const jobSubscriptionOptions: SubscriptionOptions = {
  flowControl: {
    maxMessages: config.WORKER.MAX_CONCURRENT_TASKS
  }
};

const subscription = pubsub.subscription(jobSubscriptionName, jobSubscriptionOptions);

const outputTopicName: string = config.CLOUD_PUBSUB.OUTPUT_TOPIC;

const done = (message: Message, output: IJobResult) => {
  const outputBuffer = Buffer.from(JSON.stringify(output));
  return pubsub
    .topic(outputTopicName)
    .publish(outputBuffer)
    .finally(() => {
      message.ack();
    });
};

subscription.on('message', async (message: Message) => {
  try {
    await worker(message, done);
  } catch (e) {
    stackdriver.reportError(e);
  }
});
