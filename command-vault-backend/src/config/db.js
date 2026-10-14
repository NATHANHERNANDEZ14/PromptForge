const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default admin if database is empty
    const User = require('../models/User');
    const crypto = require('crypto');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Generar una contraseña segura aleatoria para el primer arranque
      const tempPassword = crypto.randomBytes(8).toString('hex').toUpperCase().slice(0, 4) +
                           crypto.randomBytes(8).toString('hex').toLowerCase().slice(0, 4) +
                           '@1!';

      await User.create({
        name: 'Administrador Principal',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@commandvault.local',
        password: tempPassword,
        role: 'admin',
        active: true
      });
      console.log('\n⚡ Admin por defecto creado:');
      console.log(`   Usuario:     admin`);
      console.log(`   Contraseña:  ${tempPassword}`);
      console.log(`   Email:       ${process.env.ADMIN_EMAIL || 'admin@commandvault.local'}`);
      console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE.\n');
    }

    // Auto-seed company departments if empty
    const Department = require('../models/Department');
    const defaultDepartments = [
      'Contabilidad',
      'Ventas',
      'Capital Humano',
      'Diseño',
      'Metrología-Calidad',
      'Máquinas CNC',
      'STE-PPL',
      'Sistemas',
      'Logística',
      'Producción',
      'Dirección'
    ];

    for (const name of defaultDepartments) {
      const exists = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
      if (!exists) {
        await Department.create({ name });
      }
    }
    console.log('✅ Departments verified and seeded in "departments" collection');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
