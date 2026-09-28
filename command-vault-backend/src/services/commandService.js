const commandRepo = require('../repositories/commandRepository');
class CommandService {
  async getAllCommands() { return await commandRepo.findAll(); }
  async getCommandsByFolderId(folderId) { return await commandRepo.findByFolderId(folderId); }
  async saveFolderCommands(folderId, commands) {
    await commandRepo.deleteByFolderId(folderId);
    const newCommands = commands.map(c => ({ ...c, folderId }));
    return await Promise.all(newCommands.map(c => commandRepo.create(c)));
  }
}
module.exports = new CommandService();