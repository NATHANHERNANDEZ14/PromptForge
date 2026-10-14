const Department = require('../models/Department');

class DepartmentRepository {
  async findAll() {
    return await Department.find({ active: { $ne: false } }).sort({ name: 1 });
  }

  async findByName(name) {
    return await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  }

  async findById(id) {
    return await Department.findById(id);
  }

  async create(data) {
    return await Department.create(data);
  }

  async delete(id) {
    return await Department.findByIdAndDelete(id);
  }
}

module.exports = new DepartmentRepository();
