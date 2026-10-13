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

    // Auto-seed company areas if empty
    const Area = require('../models/Area');
    const areaCount = await Area.countDocuments();
    if (areaCount === 0) {
      const defaultAreas = [
        'Contabilidad',
        'Ventas',
        'Capital Humano',
        'Diseño',
        'Metrología-Calidad',
        'Máquinas CNC',
        'STE-PPL'
      ];
      await Area.insertMany(defaultAreas.map(name => ({ name })));
      console.log('Default areas seeded successfully');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
