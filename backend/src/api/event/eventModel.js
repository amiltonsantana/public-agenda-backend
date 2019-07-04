const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,
  description: String,
  place: String,
  address: String,
  initialDate: Date,
  endDate: Date,
  tags: [String],
  link: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', EventSchema);
