const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'info', 'warning'], default: 'info' },
  read: { type: Boolean, default: false },
  metadata: { type: Object }
}, { timestamps: true });

notificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
