const Employee = require('../models/Employee');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Service — lógica de negocio para personal de la empresa
// ─────────────────────────────────────────────────────────────────────────────

async function getAllEmployees(filters = {}) {
  const query = {};

  if (filters.departamento) {
    query.departamento = { $regex: new RegExp(filters.departamento, 'i') };
  }

  if (filters.activo !== undefined) {
    query.activo = filters.activo === 'true' || filters.activo === true;
  }

  return Employee.find(query).sort({ apellidoPaterno: 1, nombre: 1 });
}

async function getEmployeeById(id) {
  return Employee.findById(id);
}

async function createEmployee(data) {
  const employee = new Employee({
    noNomina:       data.noNomina,
    nombre:         data.nombre,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno || '',
    departamento:   data.departamento,
    activo:         data.activo !== undefined ? data.activo : true,
  });

  return employee.save();
}

async function updateEmployee(id, data) {
  return Employee.findByIdAndUpdate(
    id,
    {
      noNomina:        data.noNomina,
      nombre:          data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno || '',
      departamento:    data.departamento,
      activo:          data.activo,
    },
    { new: true, runValidators: true }
  );
}

async function deleteEmployee(id) {
  return Employee.findByIdAndDelete(id);
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
