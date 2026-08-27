const mongoose = require('mongoose');

// Simple admin-created announcements/events shown in the Activity -> Events tab.
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    active: { type: Boolean, default: true },
    createdBy: { type: String, default: 'owner' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
