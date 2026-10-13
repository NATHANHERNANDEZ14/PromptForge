const Area = require('../models/Area');

class AreaRepository {
  async findAll() {
    return await Area.find().sort({ name: 1 });
  }

  async findByName(name) {
    return await Area.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  }

  async create(data) {
    return await Area.create(data);
  }
}

module.exports = new AreaRepository();
