const express = require('express');
const Subscription = require('./subscriptionModel');
const handleError = require('../common/errorHandler');

const subscriptionsRouter = express.Router();

subscriptionsRouter.get('/', async (req, res) => {
  const query = {};
  if (req.query.userId) {
    query.userId = Number(req.query.userId);
  }

  Subscription.find(query, (err, subscriptions) => {
    if (err) {
      const errorContent = handleError(err);
      return res.status(500).json(errorContent);
    }
    if (!subscriptions.length) {
      res.statusCode = 404;
    }
    return res.json(subscriptions);
  });
});

subscriptionsRouter.post('/', async (req, res) => {
  const {
    user,
    userId,
    tags,
    subscriptionEvents,
  } = req.body;

  const post = await Subscription.create({
    user,
    userId,
    tags,
    subscriptionEvents,
  });

  res.json(post);
});

subscriptionsRouter.get('/:subId', async (req, res) => {
  const subscriptionId = req.params.subId;

  Subscription.findById(subscriptionId, (err, subscription) => {
    if (err) {
      const errorContent = handleError(err);
      return res.status(500).json(errorContent);
    }
    return res.json(subscription);
  });
});

subscriptionsRouter.put('/:subId', async (req, res) => {
  const subscriptionId = req.params.subId;

  Subscription.findByIdAndUpdate(subscriptionId, req.body, (err, subscription) => {
    if (err) {
      const errorContent = handleError(err);
      return res.status(500).json(errorContent);
    }
    return res.json(subscription);
  });
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
