const express = require('express');
const Tag = require('./tagModel');

const tagsRouter = express.Router();

tagsRouter.get('/', async (req, res) => {
  const query = {};
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  const tagList = await Tag.find(query);
  res.json(tagList);

  res.statusCode = 404;
});

tagsRouter.post('/', async (req, res) => {
  const post = await Tag.create(req.body);

  res.json(post);
});

module.exports = tagsRouter;
