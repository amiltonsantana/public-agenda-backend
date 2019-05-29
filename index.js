const TelegramBot = require('node-telegram-bot-api')
const botApiKey = require('./credentials/telegram.json').apiKey

const moment = require('moment')
moment.locale('pt-br')

function start() {

	const bot = new TelegramBot(botApiKey, { polling: true })

	bot.on('message', (msg) => {
		console.log(msg)

		const userId = msg.chat.id
		const userName = msg.from.first_name

		if (msg.text.match(/\/eventos/)) {
			const fs = require('fs')

			const fileBuffer = fs.readFileSync('./data/events.json', 'utf-8')

			const events = JSON.parse(fileBuffer)

			if (events) {
				let message = `Olá ${userName}. Segue a lista dos eventos:`
				bot.sendMessage(userId, message)
					.then()

				// console.log(message);
				
				events.forEach((event) => {
					// console.log('> Evento');
					// console.log(event.name);
					let eventMsg = `${moment(event.date).format('LLLL')} terá o evento '${event.name}'`
					eventMsg += `\n<b>Local</b>: ${event.place}`
					eventMsg += `\n<b>Endereço:</b> ${event.address}`
					bot.sendMessage(userId, eventMsg, { parse_mode: "HTML" })
				})
			} else {
				let message = `Olá ${userName}. No momento, não temos eventos cadastrados.`
				bot.sendMessage(userId, message)
			}
		}
	})
}

start()
