const express = require('express');
const Event = require('./eventModel');

const eventsRouter = express.Router();

eventsRouter.get('/', async (req, res) => {
  const query = {};
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  const eventList = await Event.find(query);
  res.json(eventList);

  res.statusCode = 404;
});

eventsRouter.post('/', async (req, res) => {
  const {
    name,
    description,
    place,
    address,
    initialDate,
    endDate,
    tags,
    link,
  } = req.body;

  const post = await Event.create({
    name,
    description,
    place,
    address,
    initialDate,
    endDate,
    tags,
    link,
  });

  res.json(post);
});

module.exports = eventsRouter;
