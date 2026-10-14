const departmentService = require('../services/departmentService');

class DepartmentController {
  async getAll(req, res) {
    try {
      const departments = await departmentService.getAllDepartments();
      res.json(departments);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener los departamentos.' });
    }
  }

  async create(req, res) {
    try {
      const { name, description } = req.body;
      const newDepartment = await departmentService.createDepartment(name, description);
      res.status(201).json(newDepartment);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al crear departamento.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await departmentService.deleteDepartment(id);
      res.json({ message: 'Departamento eliminado correctamente.' });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al eliminar departamento.' });
    }
  }
}

module.exports = new DepartmentController();
