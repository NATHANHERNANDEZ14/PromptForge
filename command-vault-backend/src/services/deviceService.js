const deviceRepo = require('../repositories/deviceRepository');

class DeviceService {
  async getAllDevices()        { return await deviceRepo.findAll(); }
  async getDeviceById(id)     { return await deviceRepo.findById(id); }
  async createDevice(data)    { return await deviceRepo.create(data); }
  async updateDevice(id, data){ return await deviceRepo.update(id, data); }
  async deleteDevice(id)      { return await deviceRepo.delete(id); }
}

module.exports = new DeviceService();
