const deviceService = require('../services/deviceService');

class DeviceController {
  async getAll(req, res) {
    try {
      const devices = await deviceService.getAllDevices();
      res.json(devices);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getOne(req, res) {
    try {
      const device = await deviceService.getDeviceById(req.params.id);
      if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
      res.json(device);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const device = await deviceService.createDevice(req.body);
      res.status(201).json(device);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const device = await deviceService.updateDevice(req.params.id, req.body);
      if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
      res.json(device);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await deviceService.deleteDevice(req.params.id);
      res.json({ message: 'Dispositivo eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new DeviceController();
