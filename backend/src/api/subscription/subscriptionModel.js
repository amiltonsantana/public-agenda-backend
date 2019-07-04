const mongoose = require('mongoose');
const Event = require('../event/eventModel').schema;

const Alert = new mongoose.Schema({
  time: Number,
  messageSent: Boolean,
});

const SubscriptionEvent = new mongoose.Schema({
  event: Event,
  alerts: [Alert],
});

const SubscriptionSchema = new mongoose.Schema({
  user: Object,
  tags: [String],
  subscriptionEvents: [SubscriptionEvent],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
