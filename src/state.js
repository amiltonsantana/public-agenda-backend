const moment = require('moment')
moment.locale('pt-br')

const data = require('./data')

const createUserState = (msg) => ({
	user: msg.from,
	chat: msg.chat,
	date: moment(),
	context: {
		subject: msg.text,
		children: []
	},
	importantMessages: []
})

const createImportantMessage = (msg, event) => ({
	message: {message_id, chat, date, text, entities} = msg,
	event
})

const saveUserState = (userState) => {
	if (userState.user.id) {
		return data.saveUserState(userState, userState.user.id, userState.chat.id)
	} else {
		return false
	}
}

const loadUserState = (userId, chatId) => {
	return data.loadUserState(userId, chatId)
}

module.exports = {
	createUserState,
	createImportantMessage,
	saveUserState,
	loadUserState
}
