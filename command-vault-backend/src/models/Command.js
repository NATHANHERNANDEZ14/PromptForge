const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  executable: { type: String, required: true },
  purpose: { type: String, default: '' }
}, { timestamps: true });

commandSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Command', commandSchema);
