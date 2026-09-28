const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simple plain text for MVP
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Change _id to id when JSON serialized
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('User', userSchema);
