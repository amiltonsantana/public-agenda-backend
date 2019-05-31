const moment = require('moment')

const data = require('./data')

const getList = () => {
	const eventList = data.getEventList()

	const events = eventList.filter(event => moment(event.endDate).diff(moment()) > 0)

	return events
}

const listEventsTags = (events) => {
	const allTags = []

	events.forEach(event => {
		allTags.push(...event.tags)
	})

	const uniqueTags = [...new Set(allTags)];

	return uniqueTags
}

const findEventsByTag = (tag) => {
	const events = getList()

	const filteredEvents = events.filter((event) => {
		return event.tags.find((eventTag) => eventTag.match(new RegExp(tag)))
	})

	return filteredEvents
}

module.exports = {
	getList,
	listEventsTags,
	findEventsByTag
}
