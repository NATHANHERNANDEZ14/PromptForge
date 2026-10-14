const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del departamento es requerido.'],
    unique: true,
    trim: true,
    maxlength: [80, 'El nombre no puede exceder 80 caracteres.']
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

departmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

// Explicitly bind to 'departments' collection in MongoDB
module.exports = mongoose.model('Department', departmentSchema, 'departments');
