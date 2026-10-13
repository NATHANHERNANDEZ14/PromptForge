const areaRepo = require('../repositories/areaRepository');

class AreaService {
  async getAllAreas() {
    return await areaRepo.findAll();
  }

  async createArea(name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('El nombre del área es requerido');
    }
    const cleanName = name.trim();
    const existing = await areaRepo.findByName(cleanName);
    if (existing) {
      return existing; // Idempotent
    }
    return await areaRepo.create({ name: cleanName });
  }
}

module.exports = new AreaService();
