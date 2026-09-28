const Folder = require('../models/Folder');
class FolderRepository {
  async findAll() { return await Folder.find(); }
  async findById(id) { return await Folder.findById(id); }
  async create(data) { return await Folder.create(data); }
  async update(id, data) { return await Folder.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Folder.findByIdAndDelete(id); }
}
module.exports = new FolderRepository();