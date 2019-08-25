const mongoose = require('mongoose');

const Reminder = new mongoose.Schema({
  method: String,
  minutes: Number,
  sent: Boolean,
});

const People = new mongoose.Schema({
  email: String,
  name: String,
});

const Attachment = new mongoose.Schema({
  fileUrl: String,
  title: String,
  mimeType: String,
  iconLink: String,
  fileId: String,
});

const Location = new mongoose.Schema({
  lat: Number,
  lng: Number,
});

const EventSchema = new mongoose.Schema({
  status: String, //  [TENTATIVE|CONFIRMED|CANCELLED]
  htmlLink: String,
  summary: String, // Nome do Evento
  description: String,
  place: String,
  address: String,
  location: Location,
  creator: People,
  organizer: People,
  startDate: Date,
  endDate: Date,
  originalStartDate: Date,
  recurrence: [String],
  recurringEventId: String,
  tags: [String],
  visibility: String, // [DEFAULT|PUBLIC|PRIVATE]
  locked: Boolean,
  attachments: [Attachment],
  reminders: [Reminder],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', EventSchema);
