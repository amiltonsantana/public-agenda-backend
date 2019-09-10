const express = require('express');
const Event = require('./eventModel');

const eventsRouter = express.Router();

eventsRouter.get('/', async (req, res) => {
  const query = {};
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  if (req.query.currentEvents) {
    query.startDate = { $gte: new Date() };
  }
  const eventList = await Event.find(query);
  res.json(eventList);

  res.statusCode = 404;
});

eventsRouter.post('/', async (req, res) => {
  const post = await Event.create(req.body);

  res.json(post);
});

module.exports = eventsRouter;
