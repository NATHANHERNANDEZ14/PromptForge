const Device = require('../models/Device');

class DeviceRepository {
  async findAll()          { return await Device.find().sort({ createdAt: -1 }); }
  async findById(id)       { return await Device.findById(id); }
  async create(data)       { return await Device.create(data); }
  async update(id, data)   { return await Device.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id)         { return await Device.findByIdAndDelete(id); }
}

module.exports = new DeviceRepository();
