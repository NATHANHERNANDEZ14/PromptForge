const commandRepo = require('../repositories/commandRepository');
const Command = require('../models/Command');

class CommandService {
  async getAllCommands() { return await commandRepo.findAll(); }
  async getCommandsByFolderId(folderId) { return await commandRepo.findByFolderId(folderId); }
  async saveFolderCommands(folderId, commands) {
    await commandRepo.deleteByFolderId(folderId);
    const cleanedCommands = commands.map(c => {
      const { id, _id, ...rest } = c;
      return { ...rest, folderId };
    });
    return await Promise.all(cleanedCommands.map(c => commandRepo.create(c)));
  }
  async incrementCopy(id) {
    return await Command.findByIdAndUpdate(id, { $inc: { copyCount: 1 } }, { new: true });
  }
}
module.exports = new CommandService();