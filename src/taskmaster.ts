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

const successTopicName: string = config.CLOUD_PUBSUB.SUCCESS_TOPIC;

const done = (message: Message, output: IJobResult) => {
  const outputBuffer = Buffer.from(JSON.stringify(output));
  pubsub
    .topic(successTopicName)
    .publish(outputBuffer)
    .catch(reason => {
      console.error(reason);
    });

  message.ack();
};

subscription.on('message', (message: Message) => {
  try {
    worker(message, done);
  } catch (e) {
    // TODO: Report error.
  }
});
