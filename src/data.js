const fs = require('fs')
const moment = require('moment')


module.exports = {
	eventList: () => {
		const fileBuffer = fs.readFileSync('./data/events.json', 'utf-8')

		const eventList = JSON.parse(fileBuffer)

		return events
	}
}