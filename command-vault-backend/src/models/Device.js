const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Nombre del equipo
  ip: { type: String, default: '' },            // Dirección IP
  mac: { type: String, default: '' },            // Dirección MAC
  type: { type: String, enum: ['Laptop', 'Desktop', 'Servidor', 'Celular'], default: 'Laptop' },
  username: { type: String, default: '' },            // Usuario del equipo
  rustdeskId: { type: String, default: '' },            // ID de RustDesk
  password: { type: String, default: '' },            // Contraseña generada/manual
  notes: { type: String, default: '' },            // Notas adicionales
  active: { type: Boolean, default: true }
}, { timestamps: true });

deviceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Device', deviceSchema);
