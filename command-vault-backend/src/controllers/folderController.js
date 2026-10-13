const folderService = require('../services/folderService');

class FolderController {
  async getAll(req, res) { 
    try {
      res.json(await folderService.getAllFolders());
    } catch (err) {
      res.status(500).json({ error: 'Error al listar carpetas.' });
    }
  }

  async getOne(req, res) { 
    try {
      const folder = await folderService.getFolderById(req.params.id);
      if (!folder) return res.status(404).json({ error: 'Carpeta no encontrada.' });
      res.json(folder);
    } catch (err) {
      res.status(500).json({ error: 'Error al buscar carpeta.' });
    }
  }

  async create(req, res) { 
    try {
      res.status(201).json(await folderService.createFolder(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al crear carpeta.' });
    }
  }

  async update(req, res) { 
    try {
      const updated = await folderService.updateFolder(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Carpeta no encontrada.' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al actualizar carpeta.' });
    }
  }

  async delete(req, res) { 
    try {
      await folderService.deleteFolder(req.params.id);
      res.json({ message: 'Carpeta y comandos eliminados correctamente.' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar carpeta.' });
    }
  }

  async duplicate(req, res) {
    try {
      const newFolder = await folderService.duplicateFolder(req.params.id);
      res.status(201).json(newFolder);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al duplicar flujo.' });
    }
  }
}

module.exports = new FolderController();