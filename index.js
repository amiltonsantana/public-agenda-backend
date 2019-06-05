const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
moment.locale('pt-br')

const botApiKey = require('./credentials/telegram.json').apiKey
const event = require('./src/event')
const state = require('./src/state')
const subscription = require('./src/subscription')
const tag = require('./src/tag')

async function start() {

	const bot = new TelegramBot(botApiKey, { polling: true })

	bot.on('text', async (msg) => {
		console.log(msg.text)
		// console.log(JSON.stringify(msg))
		// console.log(msg)

		const userId = msg.from.id
		const chatId = msg.chat.id
		const userName = msg.from.first_name

		if (msg.text.match(/\/eventos/)) {
			askCurrentEventTags(msg, bot)
		} else if (msg.text.match(/\/alertas/)) {
			askSubscriptionTags(msg, bot)
		} else {
			console.log('> Verificando se ja existe um userState para esse usuário.')
			const userState = state.loadUserState(userId, chatId)

			if (userState && userState.context && userState.context.subject == '/eventos') {
				console.log(`> Ja existe um userState para esse usuário. Subject '/eventos'`)

				console.log('> Verificando se o usuário deseja mais detalhes sobre um evento.')
				const reply = userState.context.children.find(child => child.message_id == msg.reply_to_message.message_id)
				if (msg.reply_to_message && reply && msg.text.match(/mais detalhes/)) {
					console.log('> Exibindo mais detalhes sobre o evento desejado.')
					bot.sendMessage(chatId, reply.reply_text)

				} else {
					sendEventListByTag(msg.text, bot, userState)
				}
			} else if (userState && userState.context && userState.context.subject == '/alertas') {
				console.log(`> Ja existe um userState para esse usuário. Subject '/alertas'`)

				console.log('> Verificando se a informação enviada pelo usuário é uma tag válida.')
				const tagList = tag.getList()
				if (tagList.find(tag => tag == msg.text)) {

					const userSubscription = subscription.findByUserId(userState.user.id)

					if (userSubscription && userSubscription.tags.find(tag => tag == msg.text)) {
						const message = `${userState.user.first_name}, você já cadastrou alertas para os eventos do tema #${msg.text}.`
						await bot.sendMessage(userState.chat.id, message, {
							"reply_markup": {
								"remove_keyboard": true
							}
						})
					} else {
						console.log('> Adicionando a tag na userSubscription.')
						subscription.pushTag(userState.user, msg.text)

						const message = `Pronto. Enviarei alertas para os eventos do tema #${msg.text}.`
						await bot.sendMessage(userState.chat.id, message, {
							"reply_markup": {
								"remove_keyboard": true
							}
						})
					}

				} else {
					const message = `${userName}, o tema ${msg.text} não existe.`
					bot.sendMessage(chatId, message)
				}
			} else {
				const message = `Não entendi ${userName}. O que você deseja saber?`
				bot.sendMessage(chatId, message)
			}
		}
	})

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

			console.log('> Atualizando a lista de tags existentes.');
			tag.updateTagList(eventTags)

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

	const askSubscriptionTags = (msg, bot) => {
		console.log('> Criando um userState para esse usuário.')
		const userState = state.createUserState(msg)

		console.log('> Salvando o userState do usuário.')
		state.saveUserState(userState)

		console.log('> Buscando a lista de tags existentes.');
		const tagList = tag.getList()

		console.log('> Transformando a lista de tags em opções de resposta.');
		const replyMarkups = tagsToReplyMarkups(tagList)
		console.log(replyMarkups);

		// Perguntar qual tema o usuário deseja obter alertas
		const message = `Olá ${userState.user.first_name}. Sobre qual tema você gostaria de receber alertas?`
		bot.sendMessage(userState.chat.id, message, {
			"reply_markup": {
				"keyboard": replyMarkups
			}
		})

	}

	const tagsToReplyMarkups = (tagList) => {
		const replyMarkups = []
		tagList.forEach(tag => replyMarkups.push([tag]))

		return replyMarkups
	}

	const sendEventListByTag = async (searchTag, bot, userState) => {
		console.log('> Buscando a lista de eventos.');
		const eventList = event.getList()

		if (eventList) {
			console.log('> Buscando a lista de tags existentes nos eventos.');
			const eventTags = event.listEventsTags(eventList)
			console.log(eventTags);

			console.log(`> Verificando se a palavra informada (${searchTag}) é uma tag existente.`);
			if (eventTags.find(eventTag => eventTag.match(new RegExp(searchTag)))) {
				console.log(`> Tag ${searchTag} encontrada!`);

				const events = event.findEventsByTag(searchTag)

				let message = `Segue a lista dos eventos do tema #${searchTag}:`
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
				const message = `${userState.user.first_name}. No momento, não temos eventos cadastrados com o tema '#${searchTag}'.`
				bot.sendMessage(userState.chat.id, message)
			}
		} else {
			const message = `Olá ${userState.user.first_name}. No momento, não temos eventos cadastrados.`
			bot.sendMessage(userState.chat.id, message)
		}
	}
}

start()
