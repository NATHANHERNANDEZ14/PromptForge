const employeeService = require('../services/employeeService');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Controller — HTTP handlers para el módulo de empleados
// ─────────────────────────────────────────────────────────────────────────────
class EmployeeController {

  // GET /employees?departamento=Ventas&activo=true
  async getAll(req, res) {
    try {
      const employees = await employeeService.getAllEmployees(req.query);
      res.json(employees);
    } catch (err) {
      console.error('[Employee] getAll:', err.message);
      res.status(500).json({ error: 'Error al obtener empleados.' });
    }
  }

  // GET /employees/:id
  async getOne(req, res) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      if (!employee) return res.status(404).json({ error: 'Empleado no encontrado.' });
      res.json(employee);
    } catch (err) {
      console.error('[Employee] getOne:', err.message);
      res.status(500).json({ error: 'Error al obtener el empleado.' });
    }
  }

  // POST /employees
  async create(req, res) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (err) {
      console.error('[Employee] create:', err.message);
      const isValidation = err.name === 'ValidationError' || err.code === 11000;
      const message = err.code === 11000
        ? `Ya existe un empleado con el número de nómina "${req.body.noNomina}".`
        : (err.message || 'Error al crear el empleado.');
      res.status(isValidation ? 400 : 500).json({ error: message });
    }
  }

  // PUT /employees/:id
  async update(req, res) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      if (!employee) return res.status(404).json({ error: 'Empleado no encontrado.' });
      res.json(employee);
    } catch (err) {
      console.error('[Employee] update:', err.message);
      const isValidation = err.name === 'ValidationError' || err.code === 11000;
      const message = err.code === 11000
        ? `Ya existe un empleado con ese número de nómina.`
        : (err.message || 'Error al actualizar el empleado.');
      res.status(isValidation ? 400 : 500).json({ error: message });
    }
  }

  // DELETE /employees/:id
  async delete(req, res) {
    try {
      const employee = await employeeService.deleteEmployee(req.params.id);
      if (!employee) return res.status(404).json({ error: 'Empleado no encontrado.' });
      res.json({ message: 'Empleado eliminado correctamente.' });
    } catch (err) {
      console.error('[Employee] delete:', err.message);
      res.status(500).json({ error: 'Error al eliminar el empleado.' });
    }
  }
}

module.exports = new EmployeeController();
