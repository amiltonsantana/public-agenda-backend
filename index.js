const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
moment.locale('pt-br')

const botApiKey = require('./credentials/telegram.json').apiKey
const event = require('./src/event')
const state = require('./src/state')

async function start() {

	const bot = new TelegramBot(botApiKey, { polling: true })

	bot.on('message', async (msg) => {
		console.log(msg.text)
		// console.log(JSON.stringify(msg))
		// console.log(msg)

		const userId = msg.from.id
		const chatId = msg.chat.id
		const userName = msg.from.first_name

		if (msg.text.match(/\/eventos/)) {
			askCurrentEventTags (msg, bot)
		} else {
			console.log('> Verificando se ja existe um userState para esse usuário.')
			const userState = state.loadUserState(userId, chatId)

			if (userState && userState.context.subject && userState.context.subject == '/eventos') {
				console.log(`> Ja existe um userState para esse usuário. Subject '/eventos'`)

				console.log('> Verificando se o usuário deseja mais detalhes sobre um evento.')
				const reply = userState.context.children.find(child => child.message_id == msg.reply_to_message.message_id)

				if (msg.reply_to_message && reply && msg.text.match(/mais detalhes/)) {
					console.log('> Exibindo mais detalhes sobre o evento desejado.')
					bot.sendMessage(chatId, reply.reply_text)

				} else {
					sendEventListByTag(msg.text, bot, userState)
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

	const askCurrentEventTags = (msg, bot) => {
		console.log('> Criando um userState para esse usuário.')
		const userState = state.createUserState(msg)

		console.log('> Buscando a Lista de Eventos.')
		const eventList = event.getList()

		if (eventList) {

			console.log('> Salvando o userState do usuário.')
			state.saveUserState(userState)

			console.log('> Buscando a lista de tags existentes nos eventos.');
			const eventTags = event.listEventsTags(eventList)

			console.log('> Transformando a lista de tags em opções de resposta.');
			const replyMarkups = tagsToReplyMarkups(eventTags)
			console.log(replyMarkups);

			const message = `Olá ${userState.user.first_name}. Sobre qual tema você quer saber?`
			bot.sendMessage(userState.chat.id, message, {
				"reply_markup": {
					"keyboard": replyMarkups
				}
			})
		} else {
			const message = `Olá ${userState.chat.id}. No momento, não temos eventos cadastrados.`
			bot.sendMessage(userState.chat.id, message)
		}
	}

	const sendEventListByTag = async (eventTag, bot, userState) => {
		console.log('> Buscando a lista de eventos.');
		const eventList = event.getList()

		if (eventList) {
			console.log('> Buscando a lista de tags existentes nos eventos.');
			const eventTags = event.listEventsTags(eventList)
			console.log(eventTags);

			console.log(`> Verificando se a palavra informada (${eventTag}) é uma tag existente.`);
			if (eventTags.find(tag => tag.match(new RegExp(eventTag)))) {
				console.log(`> Tag ${eventTag} encontrada!`);

				const events = event.findEventsByTag(eventTag)

				let message = `Segue a lista dos eventos do tema #${eventTag}:`
				await bot.sendMessage(userState.chat.id, message, {
					"reply_markup": {
						"remove_keyboard": true
					}
				})

				events.forEach((event) => {
					let eventMsg = `${moment(event.initialDate).format('LLLL')} até às ${moment(event.endDate).format('LT')} terá o evento '${event.name}'`
					eventMsg += `\n<b>Local</b>: ${event.place}`
					eventMsg += `\n<b>Endereço:</b> ${event.address}`

					bot.sendMessage(userState.chat.id, eventMsg, {
						parse_mode: "HTML",
					}).then(res => {
						const child = {
							message_id: res.message_id,
							reply_text: event.description
						}
						userState.context.children.push(child)

						state.saveUserState(userState)
					})
				})

				message = `Se quiser saber mais detalhes de algum evento, basta responder o evento desejado com o mensagem 'mais detalhes'.`
				bot.sendMessage(userState.chat.id, message)

			} else {
				const message = `${userState.user.first_name}. No momento, não temos eventos cadastrados com o tema '#${eventTag}'.`
				bot.sendMessage(userState.chat.id, message)
			}
		} else {
			const message = `Olá ${userState.user.first_name}. No momento, não temos eventos cadastrados.`
			bot.sendMessage(userState.chat.id, message)
		}
	}
}

start()
