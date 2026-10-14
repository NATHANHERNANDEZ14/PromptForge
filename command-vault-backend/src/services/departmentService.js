const departmentRepo = require('../repositories/departmentRepository');

class DepartmentService {
  async getAllDepartments() {
    return await departmentRepo.findAll();
  }

  async createDepartment(name, description = '') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('El nombre del departamento es requerido');
    }
    const cleanName = name.trim();
    const existing = await departmentRepo.findByName(cleanName);
    if (existing) {
      return existing; // Idempotente: si ya existe, lo retorna
    }
    return await departmentRepo.create({ name: cleanName, description });
  }

  async deleteDepartment(id) {
    if (!id) {
      throw new Error('ID de departamento es requerido');
    }
    return await departmentRepo.delete(id);
  }
}

module.exports = new DepartmentService();
