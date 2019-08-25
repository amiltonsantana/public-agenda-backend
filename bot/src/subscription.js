const axios = require('axios');
const moment = require('moment');

moment.locale('pt-br');

const apiUrl = require('../credentials/api.json').url;

const create = async (user) => {
  const subscription = {
    user,
    userId: user.id,
    tags: [],
    subscriptionEvents: [],
  };

  try {
    const resp = await axios.post(`${apiUrl}/subscriptions`, subscription);
    return resp.data;
  } catch (e) {
    console.log(`> Erro ao criar subscription para o usuário ${user.id}!`);
    console.log(e);
  }
  return false;
};


const createSubscriptionEvent = (event) => {
  const subEvent = event;
  subEvent.reminders = [
    {
      method: 'TELEGRAM',
      minutes: 1 * 60 * 24,
      sent: false,
    },
    {
      method: 'TELEGRAM',
      minutes: 7 * 60 * 24,
      sent: false,
    },
    {
      method: 'TELEGRAM',
      minutes: 30 * 60 * 24,
      sent: false,
    },
  ];
  return subEvent;
};

const get = async () => {
  const resp = await axios.get(`${apiUrl}/subscriptions`);
  return resp.data;
};

const findByUserId = async (userId) => {
  try {
    const resp = await axios.get(`${apiUrl}/subscriptions?userId=${userId}`);
    return resp.data;
  } catch (e) {
    console.log('> Usuário não tem subscription!');
  }

  return [];
};

const update = async (userSubscription) => {
  if (!userSubscription || !userSubscription._id) {
    return false;
  }

  return axios.put(`${apiUrl}/subscriptions/${userSubscription._id}`, userSubscription);
};

const addTag = async (userSubscription, tag) => {
  if (!tag || !userSubscription.tags) {
    return false;
  }

  const userSubs = {};
  userSubs._id = userSubscription._id;
  userSubs.tags = userSubscription.tags;

  userSubs.tags.push(tag);
  userSubs.tags = [...new Set(userSubs.tags)];

  const subscriptionUpdated = await update(userSubs);

  return subscriptionUpdated;
};

const addEvents = async (userSubscription, events) => {
  if (!userSubscription || !events || !events.length) {
    return false;
  }

  const userSubs = {};
  userSubs._id = userSubscription._id;
  userSubs.subscriptionEvents = userSubscription.subscriptionEvents;

  events.forEach((event) => {
    const subscriptionEventIndex = userSubs.subscriptionEvents
      .findIndex(subscriptionEvent => subscriptionEvent._id === event._id);

    if (subscriptionEventIndex === -1) {
      userSubs.subscriptionEvents.push(createSubscriptionEvent(event));
    }
  });

  const subscriptionUpdated = await update(userSubs);

  return subscriptionUpdated;
};

const addEvent = (userSubscription, event) => {
  if (!userSubscription || !event) {
    return false;
  }

  return addEvents(userSubscription, [event]);
};

const removeEvent = async (userSubscription, event) => {
  if (!userSubscription || !event) {
    return false;
  }

  const index = userSubscription.subscriptionEvents.findIndex(se => se.event._id === event._id);

  if (index === -1) {
    return false;
  }
  userSubscription.subscriptionEvents.splice(index, 1);

  await update(userSubscription);

  return true;
};

const removeSubscriptionEvent = (userSubscription, subscriptionEvent) => {
  if (!userSubscription || !subscriptionEvent) {
    return false;
  }

  return removeEvent(userSubscription, subscriptionEvent.event);
};

module.exports = {
  create,
  get,
  findByUserId,
  addTag,
  addEvents,
  addEvent,
  removeSubscriptionEvent,
  update,
};
