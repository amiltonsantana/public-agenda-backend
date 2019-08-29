const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  tag: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Tag', TagSchema);
