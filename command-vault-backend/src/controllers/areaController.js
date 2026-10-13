const areaService = require('../services/areaService');

class AreaController {
  async getAll(req, res) {
    try {
      const areas = await areaService.getAllAreas();
      res.json(areas);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener las áreas de la empresa.' });
    }
  }

  async create(req, res) {
    try {
      const { name } = req.body;
      const newArea = await areaService.createArea(name);
      res.status(201).json(newArea);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al crear área.' });
    }
  }
}

module.exports = new AreaController();
