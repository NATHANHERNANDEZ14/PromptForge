const Device = require('../models/Device');

class DeviceRepository {
  async findAll() { 
    return await Device.find().sort({ createdAt: -1 }); 
  }

  async findById(id) { 
    return await Device.findById(id); 
  }

  async create(data) { 
    const device = new Device(data);
    return await device.save(); 
  }

  async update(id, data) { 
    const device = await Device.findById(id);
    if (!device) return null;

    // Apply updates
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        device[key] = data[key];
      }
    });

    return await device.save(); 
  }

  async delete(id) { 
    return await Device.findByIdAndDelete(id); 
  }
}

module.exports = new DeviceRepository();
