const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  state: {
    type: Object,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
