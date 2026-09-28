const Command = require('../models/Command');
class CommandRepository {
  async findAll() { return await Command.find(); }
  async findByFolderId(folderId) { return await Command.find({ folderId }); }
  async create(data) { return await Command.create(data); }
  async update(id, data) { return await Command.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Command.findByIdAndDelete(id); }
  async deleteByFolderId(folderId) { return await Command.deleteMany({ folderId }); }
}
module.exports = new CommandRepository();