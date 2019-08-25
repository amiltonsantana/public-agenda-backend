const axios = require('axios');

const apiUrl = require('../credentials/api.json').url;

const listEventsTags = (events) => {
  const allTags = [];

  events.forEach((event) => {
    allTags.push(...event.tags);
  });

  const uniqueTags = [...new Set(allTags)];

  return uniqueTags;
};

const listEvents = async () => {
  try {
    const resp = await axios.get(`${apiUrl}/events`);
    return resp.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('> Não existe eventos cadastrados!');
  }

  return [];
};

const findByTag = async (tag) => {
  try {
    const resp = await axios.get(`${apiUrl}/events?tag=${tag}`);
    return resp.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`> Não existe evento com a tag '${tag}'!`);
  }

  return [];
};

module.exports = {
  listEventsTags,
  listEvents,
  findByTag,
};
