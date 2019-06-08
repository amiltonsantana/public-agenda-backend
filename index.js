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
		const userName = msg.from.first_name

		if (msg.text.match(/\/eventos/)) {
			askCurrentEventTags(msg)
		} else if (msg.text.match(/\/alertas/)) {
			askSubscriptionTags(msg)
		} else {
			console.log('> Verificando se ja existe um userState para esse usuário.')
			const userState = state.getUserState(userId, msg.chat.id)

			if (userState) {
				console.log(`> Ja existe um userState para esse usuário.`)
				let replyMsg
				if (msg.reply_to_message) {
					replyMsg = userState.importantMessages.find(iMsg => iMsg.message.message_id == msg.reply_to_message.message_id)
				}

				if (replyMsg && msg.text.match(/mais detalhes/)) {
					sendEventDetail(replyMsg.event, userState)
				} else if (userState.context.subject == '/eventos') {
					sendEventListByTag(msg.text, userState)
				} else if (userState.context.subject == '/alertas') {
					handleSubscriptionTag(msg.text, userState)
				} else {
					const message = `Não entendi ${userName}. O que você deseja saber?`
					bot.sendMessage(msg.chat.id, message)
				}
			} else {
				const message = `Olá ${userName}. O que você deseja saber?`
				bot.sendMessage(msg.chat.id, message)
			}
		}
	})

	const sendErrorMessage = (chatId) => {
		const message = `Puts. Tive um probleminha. Poderia tentar mais tarde?.`
		bot.sendMessage(chatId, message, {
			"reply_markup": {
				"remove_keyboard": true
			}
		})
	}

	const askCurrentEventTags = (msg) => {
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

	const askSubscriptionTags = (msg) => {
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

	const sendEventListByTag = async (searchTag, userState) => {
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
						const importantMessage = state.createImportantMessage(res, event)

						userState.importantMessages.push(importantMessage)

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

	const handleSubscriptionTag = (subscriptionTag, userState) => {

		console.log('> Verificando se a informação enviada pelo usuário é uma tag válida.')
		const tagList = tag.getList()
		if (tagList.find(tag => tag == subscriptionTag)) {

			let userSubscription = subscription.findByUserId(userState.user.id)

			if (userSubscription && userSubscription.tags.find(tag => tag == subscriptionTag)) {
				const message = `${userState.user.first_name}, você já cadastrou alertas para os eventos do tema #${subscriptionTag}.`
				bot.sendMessage(userState.chat.id, message, {
					"reply_markup": {
						"remove_keyboard": true
					}
				})
			} else {
				if (!userSubscription) {
					userSubscription = subscription.create(userState.user)
				}
				console.log('> Adicionando a tag na userSubscription.')
				if (subscription.addTag(userSubscription, subscriptionTag)) {
					console.log(`> Adicionando os eventos da tag '${subscriptionTag}' na userSubscription.`)
					const events = event.findEventsByTag(subscriptionTag)
					console.log(`> Eventos: '${events}'`);


					if (subscription.addEvents(userSubscription, events)) {
						const message = `Pronto. Enviarei alertas para os eventos do tema #${subscriptionTag}.`
						bot.sendMessage(userState.chat.id, message, {
							"reply_markup": {
								"remove_keyboard": true
							}
						})
					} else {
						sendErrorMessage(bot, userState.chat.id)
					}

				} else {
					sendErrorMessage(bot, userState.chat.id)
				}
			}

		} else {
			const message = `${userName}, o tema ${subscriptionTag} não existe.`
			bot.sendMessage(userState.chat.id, message)
		}
	}

	const sendEventDetail = (event, userState) => {
		console.log('> Exibindo mais detalhes sobre o evento desejado.')
		bot.sendMessage(userState.chat.id, event.description)

	}

}

start()
