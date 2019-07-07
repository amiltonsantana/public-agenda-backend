/* eslint-disable no-console */
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const moment = require('moment');

moment.locale('pt-br');

const botApiKey = require('./credentials/telegram.json').apiKey;
const apiUrl = require('./credentials/api.json').url;

const eventDao = require('./src/event');
const state = require('./src/state');
const subscription = require('./src/subscription');
const tagDao = require('./src/tag');

async function start() {
  const bot = new TelegramBot(botApiKey, { polling: true });

  const sendErrorMessage = (chatId) => {
    const message = 'Puts. Tive um probleminha. Poderia tentar mais tarde?.';
    bot.sendMessage(chatId, message, {
      reply_markup: {
        remove_keyboard: true,
      },
    });
  };

  const tagsToReplyMarkups = (tagList) => {
    const replyMarkups = [];
    tagList.forEach(tagItem => replyMarkups.push([tagItem]));

    return replyMarkups;
  };

  const askCurrentEventTags = async (msg) => {
    console.log('> Verificando se ja existe um userState para esse usuário.');
    let userState = state.getUserState(msg.from.id, msg.chat.id);

    if (!userState) {
      console.log('> Criando um userState para esse usuário.');
      userState = state.createUserState(msg);
    } else {
      console.log('> Limpando o context do userState desse usuário.');
      userState.context.subject = msg.text;
      userState.context.children = [];
    }

    console.log('> Buscando a Lista de Eventos.');
    const resp = await axios.get(`${apiUrl}/events`);
    const eventList = resp.data;

    // const eventList = event.getList();

    if (eventList && eventList.length) {
      console.log('> Salvando o userState do usuário.');
      state.saveUserState(userState);

      console.log('> Buscando a lista de tags existentes nos eventos.');
      const eventTags = eventDao.listEventsTags(eventList);

      console.log('> Atualizando a lista de tags existentes.');
      tagDao.updateTagList(eventTags);

      console.log('> Transformando a lista de tags em opções de resposta.');
      const replyMarkups = tagsToReplyMarkups(eventTags);
      console.log(replyMarkups);

      const message = `Olá ${userState.user.first_name}. Sobre qual tema você quer saber?`;
      bot.sendMessage(userState.chat.id, message, {
        reply_markup: {
          keyboard: replyMarkups,
        },
      });
    } else {
      const message = `Olá ${userState.chat.id}. No momento, não temos eventos cadastrados.`;
      bot.sendMessage(userState.chat.id, message);
    }
  };

  const askSubscriptionTags = (msg) => {
    console.log('> Verificando se ja existe um userState para esse usuário.');
    let userState = state.getUserState(msg.from.id, msg.chat.id);

    if (!userState) {
      console.log('> Criando um userState para esse usuário.');
      userState = state.createUserState(msg);
    } else {
      console.log('> Limpando o context do userState desse usuário.');
      userState.context.subject = msg.text;
      userState.context.children = [];
    }

    console.log('> Salvando o userState do usuário.');
    state.saveUserState(userState);

    console.log('> Buscando a lista de tags existentes.');
    const tagList = tagDao.getList();

    console.log('> Transformando a lista de tags em opções de resposta.');
    const replyMarkups = tagsToReplyMarkups(tagList);
    console.log(replyMarkups);

    // Perguntar qual tema o usuário deseja obter alertas
    const message = `Olá ${userState.user.first_name}. Sobre qual tema você gostaria de receber alertas?`;
    bot.sendMessage(userState.chat.id, message, {
      reply_markup: {
        keyboard: replyMarkups,
      },
    });
  };

  const sendEventListByTag = async (searchTag, userState) => {
    console.log(`> Buscando a lista de eventos com a tag ${searchTag}.`);

    const resp = await axios.get(`${apiUrl}/events?tag=${searchTag}`);
    const events = resp.data;

    if (events && events.length) {
      console.log(`> Tag ${searchTag} encontrada!`);

      let message = `Segue a lista dos eventos do tema #${searchTag}:`;
      await bot.sendMessage(userState.chat.id, message, {
        reply_markup: {
          remove_keyboard: true,
        },
      });

      events.forEach((event) => {
        let eventMsg = `${moment(event.initialDate).format('LLLL')} até às ${moment(event.endDate).format('LT')} `;
        eventMsg += `terá o evento '${event.name}' `;
        eventMsg += `(<b>${moment(event.initialDate).fromNow()}</b>)`;
        eventMsg += `\n<b>Local</b>: ${event.place}`;
        eventMsg += `\n<b>Endereço:</b> ${event.address}`;

        bot.sendMessage(userState.chat.id, eventMsg, {
          parse_mode: 'HTML',
        }).then((res) => {
          const importantMessage = state.createImportantMessage(res, event);

          userState.importantMessages.push(importantMessage);

          state.saveUserState(userState);
        });
      });

      message = 'Se quiser saber mais detalhes de algum evento, basta responder o evento desejado com o mensagem \'mais detalhes\'.';
      bot.sendMessage(userState.chat.id, message);

      message = 'Se quiser receber alertas de algum evento, basta responder o evento desejado com o mensagem \'receber alertas\'.';
      bot.sendMessage(userState.chat.id, message);
    } else {
      const message = `${userState.user.first_name}. No momento, não temos eventos cadastrados com o tema '#${searchTag}'.`;
      bot.sendMessage(userState.chat.id, message);
    }
  };

  const handleSubscriptionTag = async (subscriptionTag, userState) => {
    console.log('> Verificando se a informação enviada pelo usuário é uma tag válida.');
    const tagList = tagDao.getList();
    if (tagList.find(tag => tag === subscriptionTag)) {
      let [userSubscription] = await subscription.findByUserId(userState.user.id);

      if (userSubscription && userSubscription.tags.find(tag => tag === subscriptionTag)) {
        const message = `${userState.user.first_name}, você já cadastrou alertas para os eventos do tema #${subscriptionTag}.`;
        bot.sendMessage(userState.chat.id, message, {
          reply_markup: {
            remove_keyboard: true,
          },
        });
      } else {
        if (!userSubscription) {
          userSubscription = await subscription.create(userState.user);
        }
        console.log('> Adicionando a tag na userSubscription.');
        if (subscription.addTag(userSubscription, subscriptionTag)) {
          console.log(`> Adicionando os eventos da tag '${subscriptionTag}' na userSubscription.`);
          const resp = await axios.get(`${apiUrl}/events?tag=${subscriptionTag}`);
          const events = resp.data;

          if (events && events.length) {
            subscription.addEvents(userSubscription, events);
          }

          const message = `Pronto. Enviarei alertas para os eventos do tema #${subscriptionTag}.`;
          bot.sendMessage(userState.chat.id, message, {
            reply_markup: {
              remove_keyboard: true,
            },
          });
        } else {
          sendErrorMessage(bot, userState.chat.id);
        }
      }
    } else {
      const message = `${userState.user.first_name}, o tema ${subscriptionTag} não existe.`;
      bot.sendMessage(userState.chat.id, message);
    }
  };

  const sendEventDetail = (event, userState) => {
    console.log('> Exibindo mais detalhes sobre o evento desejado.');
    bot.sendMessage(userState.chat.id, event.description);
  };

  const handleSubscriptionEvent = async (event, userState) => {
    console.log('> Cadastrando o evento no subscription do usuário.');

    let [userSubscription] = await subscription.findByUserId(userState.user.id);

    if (!userSubscription) {
      console.log('> Criando um userSubscription');
      userSubscription = await subscription.create(userState.user);
    }

    if (userSubscription && userSubscription.subscriptionEvents.length
      && userSubscription.subscriptionEvents
        .find(subEvent => subEvent.event._id === event._id)) {
      const message = `${userState.user.first_name}, você já cadastrou alertas para o evento '${event.name}'.`;
      bot.sendMessage(userState.chat.id, message);
    } else if (userSubscription && subscription.addEvent(userSubscription, event)) {
      const message = `Pronto. Enviarei alertas para o evento '${event.name}'.`;
      bot.sendMessage(userState.chat.id, message);
    } else {
      sendErrorMessage(bot, userState.chat.id);
    }
  };

  bot.on('text', async (msg) => {
    console.log(msg.text);
    // console.log(JSON.stringify(msg))
    // console.log(msg)

    const userId = msg.from.id;
    const userName = msg.from.first_name;
    const chatId = msg.chat.id;

    if (msg.text.match(/\/eventos/)) {
      askCurrentEventTags(msg);
    } else if (msg.text.match(/\/alertas/)) {
      askSubscriptionTags(msg);
    } else {
      console.log('> Verificando se ja existe um userState para esse usuário.');
      const userState = state.getUserState(userId, chatId);

      if (userState) {
        console.log('> Ja existe um userState para esse usuário.');
        let replyMsg;
        if (msg.reply_to_message) {
          replyMsg = userState.importantMessages
            .find(iMsg => iMsg.message.message_id === msg.reply_to_message.message_id);
        }

        if (replyMsg && msg.text.match(/mais detalhes/)) {
          sendEventDetail(replyMsg.event, userState);
        } else if (replyMsg && msg.text.match(/receber alertas/)) {
          handleSubscriptionEvent(replyMsg.event, userState);
        } else if (userState.context.subject === '/eventos') {
          sendEventListByTag(msg.text, userState);
        } else if (userState.context.subject === '/alertas') {
          handleSubscriptionTag(msg.text, userState);
        } else {
          const message = `Não entendi ${userName}. O que você deseja saber?`;
          bot.sendMessage(chatId, message);
        }
      } else {
        const message = `Olá ${userName}. O que você deseja saber?`;
        bot.sendMessage(chatId, message);
      }
    }
  });
}

start();
