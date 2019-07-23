require('dotenv').config();

import { PubSub } from '@google-cloud/pubsub';
const config = require('../config');

const pubsub = new PubSub();

const subscriptionName = config.CLOUD_PUBSUB.SUBSCRIPTION_NAME;

const subscription = pubsub.subscription(subscriptionName);

const runTask = message => {
  console.log(message);
};

subscription.on('message', runTask);
