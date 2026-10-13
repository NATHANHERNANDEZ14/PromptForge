const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido.'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres.']
  },
  username: {
    type: String,
    required: [true, 'El usuario es requerido.'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'El usuario debe tener al menos 3 caracteres.'],
    maxlength: [50, 'El usuario no puede exceder 50 caracteres.'],
    match: [/^[a-z0-9_.-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos.']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es requerido.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo electrónico no tiene un formato válido.']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida.'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres.']
  },
  role: {
    type: String,
    enum: { values: ['user', 'admin'], message: 'El rol debe ser "user" o "admin".' },
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  // Verificación de email
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Reset de contraseña
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Auditoría
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE: Hash de contraseña con bcrypt
// ─────────────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODO: Verificar contraseña (solo bcrypt — sin fallback plaintext)
// ─────────────────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODO: Verificar si la cuenta está bloqueada por intentos fallidos
// ─────────────────────────────────────────────────────────────────────────────
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ─────────────────────────────────────────────────────────────────────────────
// SERIALIZACIÓN JSON — Nunca exponer password ni tokens
// ─────────────────────────────────────────────────────────────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.loginAttempts;
    delete ret.lockUntil;
  }
});

module.exports = mongoose.model('User', userSchema);
