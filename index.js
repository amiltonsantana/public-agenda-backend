const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
moment.locale('pt-br')

const botApiKey = require('./credentials/telegram.json').apiKey
const event = require('./src/event')
const state = require('./src/state')

function start() {

	const bot = new TelegramBot(botApiKey, { polling: true })

	bot.on('message', (msg) => {
		console.log(msg.text)

		const userId = msg.from.id
		const chatId = msg.chat.id
		const userName = msg.from.first_name

		if (msg.text.match(/\/eventos/)) {
			console.log('> Buscando a Lista de Eventos.')
			const eventList = event.getList()

			if (eventList) {
				console.log('> Criando um userState para esse usuário.')
				const userState = state.createUserState(msg)

				console.log('> Salvando o userState do usuário.')
				state.saveUserState(userState)

				console.log('> Buscando a lista de tags existentes nos eventos.');
				const eventTags = event.listEventsTags(eventList)

				console.log('> Transformando a lista de tags em opções de resposta.');
				const replyMarkups = tagsToReplyMarkups(eventTags)
				console.log(replyMarkups);

				const message = `Olá ${userName}. Sobre qual tema você quer saber?`
				bot.sendMessage(chatId, message, {
					"reply_markup": {
						"keyboard": replyMarkups
					}
				})
			} else {
				const message = `Olá ${userName}. No momento, não temos eventos cadastrados.`
				bot.sendMessage(chatId, message)
			}
		} else {
			console.log('> Verificando se ja existe um userState para esse usuário.')
			const userState = state.loadUserState(userId, chatId)

			if (userState && userState.context.subject && userState.context.subject == '/eventos') {
				console.log('> Ja existe um userState para esse usuário.')
				// console.log(`> Subject: ${userState.context.subject}`)
				console.log('> Buscando a lista de eventos.');
				const eventList = event.getList()

				if (eventList) {
					console.log('> Buscando a lista de tags existentes nos eventos.');
					const eventTags = event.listEventsTags(eventList)
					console.log(eventTags);

					console.log(`> Verificando se a palavra informada (${msg.text}) é uma tag existente.`);
					if (eventTags.find(tag => tag.match(new RegExp(msg.text)))) {
						console.log(`> Tag ${msg.text} encontrada!`);

						const events = event.findEventsByTag(msg.text)

						const message = `Segue a lista dos eventos do tema #${msg.text}:`
						bot.sendMessage(chatId, message, {
							"reply_markup": {
								"remove_keyboard": true
							}
						})

						events.forEach((event) => {
							let eventMsg = `${moment(event.initialDate).format('LLLL')} até às ${moment(event.endDate).format('LT')} terá o evento '${event.name}'`
							eventMsg += `\n<b>Local</b>: ${event.place}`
							eventMsg += `\n<b>Endereço:</b> ${event.address}`
							bot.sendMessage(chatId, eventMsg, {
								parse_mode: "HTML",
							})
						})

						userState.context.subject = null

						state.saveUserState(userState)

					} else {
						const message = `${userName}. No momento, não temos eventos cadastrados com o tema '#${msg.text}'.`
						bot.sendMessage(chatId, message)
					}
				} else {
					const message = `Olá ${userName}. No momento, não temos eventos cadastrados.`
					bot.sendMessage(chatId, message)
				}
			} else {
				const message = `Não entendi ${userName}. O que você deseja saber?`
				bot.sendMessage(chatId, message)
			}
		}
	})

	const tagsToReplyMarkups = (tags) => {
		const replyMarkups = []
		tags.forEach(tag => replyMarkups.push([tag]))

		return replyMarkups
	}

}

start()
