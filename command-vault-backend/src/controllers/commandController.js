const commandService = require('../services/commandService');

class CommandController {
  async getAll(req, res) { 
    try {
      res.json(await commandService.getAllCommands());
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener comandos.' });
    }
  }

  async getByFolder(req, res) { 
    try {
      res.json(await commandService.getCommandsByFolderId(req.params.folderId));
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener comandos de la carpeta.' });
    }
  }

  async saveForFolder(req, res) { 
    try {
      const commands = req.body.commands || [];
      const saved = await commandService.saveFolderCommands(req.params.folderId, commands);
      res.json(saved);
    } catch (err) {
      console.error('Save commands error:', err);
      res.status(500).json({ error: 'Error al guardar comandos del flujo.' });
    }
  }

  async recordCopy(req, res) {
    try {
      const updated = await commandService.incrementCopy(req.params.id);
      if (!updated) return res.status(404).json({ error: 'Comando no encontrado.' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Error al registrar copia.' });
    }
  }
}

module.exports = new CommandController();