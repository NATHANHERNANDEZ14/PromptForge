const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  videoLink: { type: String, default: '' },
  globalDescription: { type: String, default: '' }
}, { timestamps: true });

folderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Folder', folderSchema);
