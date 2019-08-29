const express = require('express');

const eventsRouter = require('../api/event/eventRoutes');
const subscriptionsRouter = require('../api/subscription/subscriptionRoutes');
const tagsRouter = require('../api/tag/tagRoutes');

const routes = (server) => {
  const apiRouter = express.Router();

  // Events Routes
  apiRouter.use('/events', eventsRouter);

  // Subscriptions Routes
  apiRouter.use('/subscriptions', subscriptionsRouter);

  // Tags Routes
  apiRouter.use('/tags', tagsRouter);

  // API Routes
  server.use('/api', apiRouter);
};

module.exports = routes;
