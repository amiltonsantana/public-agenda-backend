const fs = require('fs')

const dataPath = './data'

const saveJsonObject = (content, filePath) => {
	const contentString = JSON.stringify(content)
	return fs.writeFileSync(filePath, contentString)
}

const loadJsonObject = (filePath) => {
	if (fs.existsSync(filePath)) {
		const fileBuffer = fs.readFileSync(filePath, 'utf-8')
		return JSON.parse(fileBuffer)
	}
	return false
}

const getEventList = () => {
	return loadJsonObject(`${dataPath}/events.json`)
}

const saveUserState = (userState, userId, charId) => {
	return saveJsonObject(userState, `${dataPath}/${userId}-${charId}-state.json`)
}

const loadUserState = (userId, chatId) => {
	return loadJsonObject(`${dataPath}/${userId}-${chatId}-state.json`)
}


module.exports = {
	getEventList,
	saveUserState,
	loadUserState
}
