const folderService = require('../services/folderService');
class FolderController {
  async getAll(req, res) { res.json(await folderService.getAllFolders()); }
  async getOne(req, res) { res.json(await folderService.getFolderById(req.params.id)); }
  async create(req, res) { res.json(await folderService.createFolder(req.body)); }
  async update(req, res) { res.json(await folderService.updateFolder(req.params.id, req.body)); }
  async delete(req, res) { res.json(await folderService.deleteFolder(req.params.id)); }
}
module.exports = new FolderController();