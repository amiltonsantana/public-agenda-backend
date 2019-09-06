const express = require('express');
const Tag = require('./tagModel');

const tagsRouter = express.Router();

tagsRouter.get('/', async (req, res) => {
  const query = {};
  if (req.query.tag) {
    query.tag = req.query.tag.split(',');
  }
  const tagList = await Tag.find(query);
  res.json(tagList);

  res.statusCode = 404;
});

tagsRouter.post('/', async (req, res) => {
  const tag = req.body;

  const post = await Tag.updateOne(tag, tag, { upsert: true });

  if (post.nModified === 1 || post.upserted) {
    return res.status(200).send();
  }
  return res.status(500).json(post);
});

module.exports = tagsRouter;
