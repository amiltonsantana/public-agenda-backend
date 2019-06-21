const moment = require('moment');

moment.locale('pt-br');

const data = require('./data');

const createUserState = msg => ({
  user: msg.from,
  chat: msg.chat,
  date: moment(),
  context: {
    subject: msg.text,
    children: [],
  },
  importantMessages: [],
});

const createImportantMessage = (msg, event) => {
  const {
    message_id, chat, date, text, entities,
  } = msg;
  const message = {
    message_id,
    chat,
    date,
    text,
    entities,
  };

  return {
    message,
    event,
  };
};

const saveUserState = (userState) => {
  if (userState.user && userState.user.id && userState.chat && userState.chat.id) {
    return data.saveUserState(userState, userState.user.id, userState.chat.id);
  }
  return false;
};

const getUserState = (userId, chatId) => data.loadUserState(userId, chatId);

module.exports = {
  createUserState,
  createImportantMessage,
  saveUserState,
  getUserState,
};
