const express = require('express')

module.exports = function (server) {

	const apiRouter = express.Router()

	// Events Routes
	const eventsRouter = require('../api/event/eventRoutes')
	apiRouter.use('/events', eventsRouter)

	// // Subscriptions Routes
	// const subscriptionsRouter = require('../api/subscription/subscriptionRoutes')
	// apiRouter.use('/subscriptions', subscriptionsRouter)

	// API Routes
	server.use('/api', apiRouter)
}