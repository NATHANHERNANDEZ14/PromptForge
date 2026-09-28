const commandService = require('../services/commandService');
class CommandController {
  async getAll(req, res) { res.json(await commandService.getAllCommands()); }
  async getByFolder(req, res) { res.json(await commandService.getCommandsByFolderId(req.params.folderId)); }
  async saveForFolder(req, res) { res.json(await commandService.saveFolderCommands(req.params.folderId, req.body.commands)); }
}
module.exports = new CommandController();