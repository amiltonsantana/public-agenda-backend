const moment = require('moment')
moment.locale('pt-br')

const data = require('./data')

const create = (user) => ({
	user: user,
	creationDate: moment(),
	tags: []
})

const get = () => {
	return data.loadSubscription()
}

const findByUserId = (userId) => {
	const subscriptions = get()

	return subscriptions.find(userSubscription => userSubscription.user.id == userId)
}

const findIndexByUserId = (userId) => {
	const subscriptions = get()

	return subscriptions.findIndex(userSubscription => userSubscription.user.id == userId)
}

const insert = (userSubscription) => {
	const subscriptions = get()

	const userSubscriptionIndex =  subscriptions.findIndex(subscription => subscription.user.id == userSubscription.user.id)

	if (userSubscriptionIndex == -1) {
		subscriptions.push(userSubscription)
	} else {
		subscriptions[userSubscriptionIndex] = userSubscription
	}

	data.saveSubscription(subscriptions)
}

const pushTag = (user, tag) => {
	let userSubscription = find(user.id)
	if (!userSubscription) {
		userSubscription = create(user)
	}

	console.log(userSubscription.tags);

	userSubscription.tags.push(tag)
	userSubscription.tags = [...new Set(userSubscription.tags)]
	userSubscription.lastUpdateDate = moment()

	console.log(userSubscription.tags);

	insert(userSubscription)
}

module.exports = {
	create,
	findByUserId,
	pushTag
}
