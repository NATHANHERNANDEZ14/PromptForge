const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/cryptoUtil');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Laptop', 'Desktop', 'Servidor', 'Celular', 'Teléfono-IP'], 
    default: 'Laptop' 
  },
  status: { 
    type: String, 
    enum: ['Operativo', 'Disponible', 'En Mantenimiento', 'De Baja'], 
    default: 'Operativo' 
  },
  username: { type: String, default: '' },       // Usuario del equipo
  noNomina: { type: String, default: '' },       // No. Nómina
  area: { type: String, default: 'General' },    // Área de la empresa
  department: { type: String, default: 'General' }, // Alias compatible
  ipWifi: { type: String, default: '' },         // IP Wi-Fi
  ipEth: { type: String, default: '' },          // IP Ethernet
  macWifi: { type: String, default: '' },        // MAC Wi-Fi
  macEth: { type: String, default: '' },         // MAC Ethernet
  ip: { type: String, default: '' },             // IP Principal / Resumen
  mac: { type: String, default: '' },            // MAC Principal / Resumen
  serialNumber: { type: String, default: '' },   // Número de serie
  rustdeskId: { type: String, default: '' },     // ID de RustDesk
  password: { type: String, default: '' },       // Contraseña de Laptop (Encriptada en BD)
  notes: { type: String, default: '' },          // Notas adicionales
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save: Encriptar contraseña en BD y sincronizar area/department
deviceSchema.pre('save', function () {
  if (this.password && !this.password.startsWith('enc:')) {
    this.password = encrypt(this.password);
  }
  if (this.area && (!this.department || this.department === 'General')) {
    this.department = this.area;
  }
  if (this.department && (!this.area || this.area === 'General')) {
    this.area = this.department;
  }
  // Sincronizar ip y mac primarias si no se pasaron pero sí se pasaron las específicas
  if (!this.ip) this.ip = this.ipEth || this.ipWifi || '';
  if (!this.mac) this.mac = this.macEth || this.macWifi || '';
});

deviceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    if (ret.password) {
      const isEncrypted = ret.password.startsWith('enc:');
      ret.encryptedPassword = isEncrypted ? ret.password : encrypt(ret.password);
      ret.password = decrypt(ret.password);
    } else {
      ret.encryptedPassword = '';
    }
  }
});

module.exports = mongoose.model('Device', deviceSchema);
