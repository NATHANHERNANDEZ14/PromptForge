const folderRepo = require('../repositories/folderRepository');
const commandRepo = require('../repositories/commandRepository');
class FolderService {
  async getAllFolders() { return await folderRepo.findAll(); }
  async getFolderById(id) { return await folderRepo.findById(id); }
  async createFolder(data) { return await folderRepo.create(data); }
  async updateFolder(id, data) { return await folderRepo.update(id, data); }
  async deleteFolder(id) { 
    await commandRepo.deleteByFolderId(id);
    return await folderRepo.delete(id); 
  }
}
module.exports = new FolderService();