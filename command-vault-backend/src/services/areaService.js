const departmentRepo = require('../repositories/departmentRepository');

class AreaService {
  async getAllAreas() {
    return await departmentRepo.findAll();
  }

  async createArea(name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('El nombre del área o departamento es requerido');
    }
    const cleanName = name.trim();
    const existing = await departmentRepo.findByName(cleanName);
    if (existing) {
      return existing; // Idempotent
    }
    return await departmentRepo.create({ name: cleanName });
  }
}

module.exports = new AreaService();
