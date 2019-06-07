const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
moment.locale('pt-br')

const botApiKey = require('./credentials/telegram.json').apiKey

const subscription = require('./src/subscription')

const start = async () => {
	const bot = new TelegramBot(botApiKey)

	console.log(`> Buscando a lista de subscriptions`);
	subscriptionList = subscription.get()

	subscriptionList.forEach(async userSubscription => {
		let userMessageSent = false

		for (let seindex = 0, len = userSubscription.subscriptionEvents.length; seindex < len; ++seindex) {
			const subscriptionEvent = userSubscription.subscriptionEvents[seindex]
			const event = subscriptionEvent.event
			const initialDate = moment(event.initialDate)
			const daysToEvent = initialDate.diff(moment(), "days")
			console.log(`> Dias para o evento: ${daysToEvent}`);

			let eventMessageSent = false

			if (daysToEvent >= 0) {
				eventMessageSent = false

				for (let index = 0, len = subscriptionEvent.alerts.length; index < len; ++index) {
					const alert = subscriptionEvent.alerts[index]

					if (daysToEvent <= alert.time && alert.messageSent == false) {
						if (!eventMessageSent) {
							// envia evento para o usuario
							if (!userMessageSent) {
								let message = `Olá ${userSubscription.user.first_name}. Conforme sua solicitação, segue a lista dos eventos marcados para alerta:`
								await bot.sendMessage(userSubscription.user.id, message)

								userMessageSent = true
							}

							let eventMsg = `${moment(event.initialDate).format('LLLL')} até às ${moment(event.endDate).format('LT')} terá o evento '${event.name}'`
							eventMsg += `\n<b>Local</b>: ${event.place}`
							eventMsg += `\n<b>Endereço:</b> ${event.address}`

							await bot.sendMessage(userSubscription.user.id, eventMsg, {
								parse_mode: "HTML",
							})

							eventMessageSent = true
						}

						alert.messageSent = true
					}
				}
			} else {
				console.log(`> Removendo Evento passado`);

				subscription.removeSubscriptionEvent(userSubscription, subscriptionEvent)
			}
		}

		if (userMessageSent) {
			console.log(`> Atualizando o subscrição do usuário`);
			subscription.add(userSubscription)
		}
	})
}

start()