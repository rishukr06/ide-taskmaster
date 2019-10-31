require('dotenv').config();

const config = require('../config');

import { PubSub } from '@google-cloud/pubsub';
import { ClientConfig } from '@google-cloud/pubsub/build/src/pubsub';
import { SubscriberOptions, Message } from '@google-cloud/pubsub/build/src/subscriber';

import * as worker from './tasks/run';

import { IJobResult } from './types';

const pubsubConfig: ClientConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
};

const pubsub = new PubSub(pubsubConfig);

const jobSubscriptionName: string = config.CLOUD_PUBSUB.SUBSCRIPTION_NAME;
const jobSubscriptionOptions: SubscriberOptions = {
  ackDeadline: 10,
  flowControl: {
    maxMessages: config.WORKER.MAX_CONCURRENT_TASKS
  }
};

const subscription = pubsub.subscription(jobSubscriptionName, jobSubscriptionOptions);

const outputTopicName: string = config.CLOUD_PUBSUB.OUTPUT_TOPIC;

const done = (message: Message, output: IJobResult) => {
  message.ack();

  const outputBuffer = Buffer.from(JSON.stringify(output));
  return pubsub
    .topic(outputTopicName)
    .publish(outputBuffer);
};

subscription.on('message', async (message: Message) => {
  try {
    await worker(message, done);
  } catch (e) {
    // TODO: Report error.
  }
});
