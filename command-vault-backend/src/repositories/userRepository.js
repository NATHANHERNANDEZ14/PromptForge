const User = require('../models/User');

class UserRepository {

  // Listar todos los usuarios (nunca exponer password ni tokens sensibles)
  async findAll() {
    return User.find()
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return User.findById(id).select('-password -emailVerificationToken -passwordResetToken');
  }

  async findByUsername(username) {
    return User.findOne({ username: username.toLowerCase().trim() });
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async create(data) {
    const user = new User({
      ...data,
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim()
    });
    return user.save();
  }

  async update(id, data) {
    const user = await User.findById(id);
    if (!user) return null;

    // Actualizar solo campos permitidos explícitamente
    const allowedFields = ['name', 'username', 'email', 'role', 'active', 'password', 'lastLogin'];
    for (const field of allowedFields) {
      if (data[field] === undefined) continue;

      if (field === 'username') {
        user.username = data.username.toLowerCase().trim();
      } else if (field === 'email') {
        user.email = data.email.toLowerCase().trim();
      } else if (field === 'password') {
        if (data.password && data.password.trim() !== '') {
          user.password = data.password; // pre-save hook aplicará bcrypt
        }
      } else {
        user[field] = data[field];
      }
    }

    return user.save();
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();