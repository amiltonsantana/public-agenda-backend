const mongoose = require('mongoose');
const Event = require('../event/eventModel').schema;

const SubscriptionSchema = new mongoose.Schema({
  user: Object,
  userId: Number,
  tags: [String],
  subscriptionEvents: [Event],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
