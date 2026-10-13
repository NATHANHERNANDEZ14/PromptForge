const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Schema — Registro de personal de la empresa
// Independiente del sistema de autenticación (User)
// ─────────────────────────────────────────────────────────────────────────────
const employeeSchema = new mongoose.Schema({
  noNomina: {
    type: String,
    required: [true, 'El número de nómina es requerido.'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [30, 'El número de nómina no puede exceder 30 caracteres.']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido.'],
    trim: true,
    maxlength: [60, 'El nombre no puede exceder 60 caracteres.']
  },
  apellidoPaterno: {
    type: String,
    required: [true, 'El apellido paterno es requerido.'],
    trim: true,
    maxlength: [60, 'El apellido paterno no puede exceder 60 caracteres.']
  },
  apellidoMaterno: {
    type: String,
    default: '',
    trim: true,
    maxlength: [60, 'El apellido materno no puede exceder 60 caracteres.']
  },
  departamento: {
    type: String,
    required: [true, 'El departamento es requerido.'],
    trim: true,
    maxlength: [80, 'El departamento no puede exceder 80 caracteres.']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// ── Virtual: nombre completo ─────────────────────────────────────────────────
employeeSchema.virtual('nombreCompleto').get(function () {
  return [this.nombre, this.apellidoPaterno, this.apellidoMaterno]
    .filter(Boolean)
    .join(' ');
});

employeeSchema.set('toJSON', { virtuals: true, versionKey: false });

module.exports = mongoose.model('Employee', employeeSchema);
