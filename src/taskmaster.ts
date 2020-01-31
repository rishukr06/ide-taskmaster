require('dotenv').config();

const config = require('../config');

import { PubSub } from '@google-cloud/pubsub';
import { ClientConfig } from '@google-cloud/pubsub/build/src/pubsub';
import { SubscriptionOptions } from '@google-cloud/pubsub/build/src/subscription';
import { Message } from '@google-cloud/pubsub/build/src/subscriber';

import * as worker from './tasks/run';

import { IJobResult } from './types';

const stackdriver = require('./utils/stackdriver');

const pubsubConfig = (options => {
  Object.keys(options)
    .forEach(key =>
      (!options[key] && options[key] === undefined) &&
      delete options[key]
    );

  return options
})(<ClientConfig>{
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  grpc: require('grpc')
});

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
  const messageData = JSON.parse(Buffer.from(message.data).toString());

  try {
    const result = await worker(messageData)
      .then(async result => {
        await done(message, result.output);
        return result;
      })
      .catch(async err => {
        await done(message, <IJobResult>{
          job: messageData,
          stderr: 'Internal server error. Please try again!',
          stdout: ''
        });

        throw err;
      });

    if (result.shellOutput.code !== 0) {
      const error = new Error(result.shellOutput.stderr);
      // @ts-ignore
      error.code = result.shellOutput.code;
      throw error;
    }
  } catch (err) {
    stackdriver.reportError(err, {}, messageData);
  }
});

subscription.on('error', err => {
  stackdriver.reportError(err);
  process.exit(1);
});

import * as express from 'express';
const router = express.Router();
const app = express();
import * as http from 'http';

router.all('/_/healthcheck', async (req, res, next) => {
  return res.status(200).send('OK');
});

app.use(router);

const server = http.createServer(app);
server.listen(3001);

server.on('listening', () => { });
server.on('error', err => {
  stackdriver.reportError(err, {}, 'Failed to start server.');
  process.exit(1) });
