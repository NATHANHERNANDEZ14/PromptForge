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
  async duplicateFolder(id) {
    const original = await folderRepo.findById(id);
    if (!original) throw new Error('Carpeta no encontrada');

    const duplicateData = {
      name: `${original.name} (Copia)`,
      title: original.title ? `${original.title} (Copia)` : '',
      videoLink: original.videoLink,
      globalDescription: original.globalDescription,
      category: original.category || 'General',
      tags: original.tags ? [...original.tags] : []
    };

    const newFolder = await folderRepo.create(duplicateData);
    const originalCmds = await commandRepo.findByFolderId(id);

    if (originalCmds && originalCmds.length > 0) {
      const clonedCmds = originalCmds.map(c => ({
        folderId: newFolder._id || newFolder.id,
        executable: c.executable,
        purpose: c.purpose,
        category: c.category,
        tags: c.tags ? [...c.tags] : []
      }));
      await Promise.all(clonedCmds.map(c => commandRepo.create(c)));
    }

    return newFolder;
  }
}
module.exports = new FolderService();