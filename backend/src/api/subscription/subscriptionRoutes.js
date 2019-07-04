const express = require('express');
const Subscription = require('./subscriptionModel');
const handleError = require('../common/errorHandler');

const subscriptionsRouter = express.Router();

subscriptionsRouter.get('/', async (req, res) => {
  const query = {};
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  const eventList = await Subscription.find(query);
  res.json(eventList);

  res.statusCode = 404;
});

subscriptionsRouter.post('/', async (req, res) => {
  const {
    user,
    tags,
    subscriptionEvents,
  } = req.body;

  const post = await Subscription.create({
    user,
    tags,
    subscriptionEvents,
  });

  res.json(post);
});

subscriptionsRouter.delete('/:subId', async (req, res) => {
  const subscriptionId = req.params.subId;

  Subscription.findByIdAndDelete(subscriptionId, (err, subscription) => {
    if (err) {
      const errorContent = handleError(err);
      return res.status(500).json(errorContent);
    }
    return res.json(subscription);
  });
});

module.exports = subscriptionsRouter;
