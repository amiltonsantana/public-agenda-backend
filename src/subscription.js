const moment = require('moment')
moment.locale('pt-br')

const data = require('./data')

const create = (user) => ({
	user: user,
	creationDate: moment(),
	tags: [],
	subscriptionEvents: []
})

const createSubscriptionEvent = (event) => ({
	event,
	alerts: [
		{
			time: 1,
			messageSent: false
		},
		{
			time: 7,
			messageSent: false
		},
		{
			time: 30,
			messageSent: false
		}
	]
})

const get = () => {
	let subscriptions = data.loadSubscription()

	if (!subscriptions) {
		return []
	}

	return subscriptions
}

const findByUserId = (userId) => {
	const subscriptions = get()

	return subscriptions.find(userSubscription => userSubscription.user.id == userId)
}

const findIndexByUserId = (userId) => {
	const subscriptions = get()

	return subscriptions.findIndex(userSubscription => userSubscription.user.id == userId)
}

const add = (userSubscription) => {
	if (!userSubscription || !userSubscription.user) {
		return false
	}
	const subscriptions = get()

	const userSubscriptionIndex = subscriptions.findIndex(subscription => subscription.user.id == userSubscription.user.id)

	userSubscription.lastUpdateDate = moment()

	if (userSubscriptionIndex === -1) {
		subscriptions.push(userSubscription)
	} else {
		subscriptions[userSubscriptionIndex] = userSubscription
	}

	data.saveSubscription(subscriptions)
}

const addTag = (userSubscription, tag) => {
	if (!tag) return false

	if (!userSubscription) {
		userSubscription = create(user)
	}

	userSubscription.tags.push(tag)
	userSubscription.tags = [...new Set(userSubscription.tags)]

	add(userSubscription)

	return true
}

const addEvents = (userSubscription, events) => {
	if (!userSubscription || !events || !events.length) {
		return false
	}

	events.forEach(event => {
		const subscriptionEventIndex = userSubscription.subscriptionEvents.findIndex(subscriptionEvent => subscriptionEvent.event.id == event.id)

		if (subscriptionEventIndex === -1) {
			userSubscription.subscriptionEvents.push(createSubscriptionEvent(event))
		}
	})

	add(userSubscription)

	return true
}

const addEvent = (userSubscription, event) => {
	if (!userSubscription || !event) {
		return false
	}

	return addEvents(userSubscription, [event])
}

const removeSubscriptionEvent = (userSubscription, subscriptionEvent) => {
	if (!userSubscription || !subscriptionEvent) {
		return false
	}

	return removeEvent(userSubscription, subscriptionEvent.event)
}

const removeEvent = (userSubscription, event) => {
	if (!userSubscription || !event) {
		return false
	}

	const index = userSubscription.subscriptionEvents.findIndex(se => se.event.id == event.id)

	if (index === -1) {
		return false
	}
	userSubscription.subscriptionEvents.splice(index, 1)

	add(userSubscription)

	return true
}

module.exports = {
	create,
	get,
	add,
	findByUserId,
	addTag,
	addEvents,
	addEvent,
	removeSubscriptionEvent
}
