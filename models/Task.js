const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: '' },
  reward: { type: Number, required: true },
  type: {
    type: String,
    enum: ['channel', 'link', 'bot'],
    default: 'link'
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
