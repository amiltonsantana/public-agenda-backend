/* eslint-disable no-console */
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');

moment.locale('pt-br');

const botApiKey = require('./credentials/telegram.json').apiKey;

const subscription = require('./src/subscription');

const start = async () => {
  const bot = new TelegramBot(botApiKey);

  console.log('> Buscando a lista de subscriptions');
  const subscriptionList = await subscription.get();

  subscriptionList.forEach(async (userSubscription) => {
    let userMessageSent = false;

    for (let seindex = 0, seLenght = userSubscription.subscriptionEvents.length;
      seindex < seLenght;
      seindex += 1
    ) {
      const event = userSubscription.subscriptionEvents[seindex];
      const startDate = moment(event.startDate);
      const minutesToEvent = startDate.diff(moment(), 'minutes');
      console.log(`> Minutos para o evento: ${minutesToEvent}`);

      let eventMessageSent = false;

      if (minutesToEvent >= 0) {
        eventMessageSent = false;

        for (let index = 0, len = event.reminders.length; index < len; index += 1) {
          const reminder = event.reminders[index];

          if (minutesToEvent <= reminder.minutes && reminder.sent === false) {
            if (!eventMessageSent) {
              if (!userMessageSent) {
                const message = `Olá ${userSubscription.user.first_name}. Conforme sua solicitação, segue a lista dos eventos marcados para alerta:`;
                // eslint-disable-next-line no-await-in-loop
                await bot.sendMessage(userSubscription.user.id, message);

                userMessageSent = true;
              }

              let eventMsg = `${moment(event.startDate).format('LLLL')} até às ${moment(event.endDate).format('LT')} terá o evento '${event.summary}'`;
              eventMsg += `\n<b>Local</b>: ${event.place}`;
              eventMsg += `\n<b>Endereço:</b> ${event.address}`;

              bot.sendMessage(userSubscription.user.id, eventMsg, {
                parse_mode: 'HTML',
              });

              eventMessageSent = true;
            }

            reminder.sent = true;
          }
        }
      } else {
        console.log('> Removendo Evento passado');

        subscription.removeSubscriptionEvent(userSubscription, event);
      }
    }

    if (userMessageSent) {
      console.log('> Atualizando o subscrição do usuário');
      subscription.update(userSubscription);
    }
  });
};

start();
