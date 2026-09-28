const User = require('../models/User');
class UserRepository {
  async findAll() { return await User.find(); }
  async findById(id) { return await User.findById(id); }
  async findByUsername(username) { return await User.findOne({ username }); }
  async create(data) { return await User.create(data); }
  async update(id, data) { return await User.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await User.findByIdAndDelete(id); }
}
module.exports = new UserRepository();