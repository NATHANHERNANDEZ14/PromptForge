import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Edit2, Trash2, Search, Building2,
  Hash, User, ChevronDown, X, Save, Loader2,
  ShieldAlert, BadgeCheck, RefreshCw, PlusCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { employeesApi, departmentsApi } from '../services/api';
import { confirmDialog, showToast, showError } from '../utils/alerts';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import EmptyState from './ui/EmptyState';
import Badge from './ui/Badge';
import { EmployeesStyles } from '../styles/employeesStyles';

const EMPTY_FORM = {
  noNomina: '', nombre: '', apellidoPaterno: '',
  apellidoMaterno: '', departamento: '', activo: true
};

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeModal — Crear / Editar
// ─────────────────────────────────────────────────────────────────────────────
function EmployeeModal({ employee, departments = [], onAddNewDepartment, onClose, onSave }) {
  const isEditing = Boolean(employee?._id || employee?.id);
  const [form, setForm]           = useState(isEditing ? { ...EMPTY_FORM, ...employee } : { ...EMPTY_FORM, departamento: departments[0]?.name || '' });
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (!isEditing && !form.departamento && departments.length > 0) {
      setForm(prev => ({ ...prev, departamento: departments[0].name }));
    }
  }, [departments, isEditing, form.departamento]);

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.noNomina.trim())       e.noNomina       = 'El número de nómina es requerido.';
    if (!form.nombre.trim())          e.nombre          = 'El nombre es requerido.';
    if (!form.apellidoPaterno.trim()) e.apellidoPaterno = 'El apellido paterno es requerido.';
    if (!form.departamento)           e.departamento    = 'El departamento es requerido.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const id = employee?._id || employee?.id;
      const saved = id
        ? await employeesApi.update(id, form)
        : await employeesApi.create(form);
      onSave(saved, isEditing);
    } catch (err) {
      showError('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? `Editar: ${employee.nombre} ${employee.apellidoPaterno}` : 'Registrar Empleado'}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={EmployeesStyles.modalFormBody}>

          {/* No. Nómina */}
          <FormField label="No. Nómina" id="emp-nomina" required error={errors.noNomina}
            icon={<Hash size={15} />}>
            <input
              id="emp-nomina"
              className={`input-field${errors.noNomina ? ' input-error' : ''}`}
              style={EmployeesStyles.deptFilterSelect}
              value={form.noNomina}
              onChange={e => set('noNomina', e.target.value.toUpperCase())}
              placeholder="Ej. NOM-8492"
              autoFocus
            />
          </FormField>

          {/* Nombre */}
          <FormField label="Nombre(s)" id="emp-nombre" required error={errors.nombre}
            icon={<User size={15} />}>
            <input
              id="emp-nombre"
              className={`input-field${errors.nombre ? ' input-error' : ''}`}
              style={EmployeesStyles.deptFilterSelect}
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej. Juan Carlos"
            />
          </FormField>

          {/* Apellidos en grid */}
          <div style={EmployeesStyles.modalFormGrid}>
            <FormField label="Apellido Paterno" id="emp-ap" required error={errors.apellidoPaterno}>
              <input
                id="emp-ap"
                className={`input-field${errors.apellidoPaterno ? ' input-error' : ''}`}
                value={form.apellidoPaterno}
                onChange={e => set('apellidoPaterno', e.target.value)}
                placeholder="Ej. García"
              />
            </FormField>

            <FormField label="Apellido Materno" id="emp-am">
              <input
                id="emp-am"
                className="input-field"
                value={form.apellidoMaterno}
                onChange={e => set('apellidoMaterno', e.target.value)}
                placeholder="Ej. López"
              />
            </FormField>
          </div>

          {/* Departamento */}
          <div>
            <div style={EmployeesStyles.deptHeaderRow}>
              <label style={EmployeesStyles.deptLabel}>
                <Building2 size={13} /> Departamento *
              </label>
              {onAddNewDepartment && (
                <button
                  type="button"
                  onClick={async () => {
                    const newName = await onAddNewDepartment();
                    if (newName) set('departamento', newName);
                  }}
                  style={EmployeesStyles.newDeptBtn}
                >
                  <PlusCircle size={12} /> + Nuevo
                </button>
              )}
            </div>
            <select
              id="emp-dept"
              className={`input-field${errors.departamento ? ' input-error' : ''}`}
              value={form.departamento}
              onChange={e => set('departamento', e.target.value)}
            >
              {departments.length === 0 && <option value="">Cargando departamentos...</option>}
              {departments.map(d => {
                const name = typeof d === 'string' ? d : d.name;
                return (
                  <option key={d.id || name} value={name} style={EmployeesStyles.selectOption}>{name}</option>
                );
              })}
            </select>
            {errors.departamento && <div style={EmployeesStyles.fieldError}>{errors.departamento}</div>}
          </div>

          {/* Estado activo (solo en edición) */}
          {isEditing && (
            <div style={EmployeesStyles.activeRow}>
              <label style={EmployeesStyles.activeLabel}>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => set('activo', e.target.checked)}
                  style={EmployeesStyles.activeCheckbox}
                />
                <span style={EmployeesStyles.activeStatusText(form.activo)}>
                  {form.activo ? 'Empleado activo' : 'Empleado inactivo'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={EmployeesStyles.modalFooter}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            <X size={15} /> Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
              : <><Save size={15} /> {isEditing ? 'Guardar cambios' : 'Registrar empleado'}</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'var(--primary)' }) {
  return (
    <div className="glass" style={EmployeesStyles.statCard}>
      <div style={EmployeesStyles.statIconBox(color)}>
        {icon}
      </div>
      <div>
        <div style={EmployeesStyles.statValue}>{value}</div>
        <div style={EmployeesStyles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employees — Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Employees() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [employees, setEmployees]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [deptFilter, setDeptFilter]   = useState('');
  const [modal, setModal]             = useState(null); // null | 'create' | employee obj

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeesApi.getAll();
      setEmployees(data || []);
    } catch (err) {
      showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentsApi.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando departamentos:', err);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  const handleAddNewDepartment = async () => {
    const { value: newDeptName } = await Swal.fire({
      title: 'Nuevo Departamento',
      input: 'text',
      inputLabel: 'Nombre del departamento de la empresa',
      inputPlaceholder: 'Ej. Logística, Producción, Sistemas...',
      showCancelButton: true,
      confirmButtonText: 'Crear Departamento',
      cancelButtonText: 'Cancelar',
      background: '#161e2e',
      color: '#f8fafc',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#475569',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡Debes ingresar un nombre para el departamento!';
        }
      }
    });

    if (newDeptName && newDeptName.trim()) {
      const cleanName = newDeptName.trim();
      try {
        const created = await departmentsApi.create(cleanName);
        const deptObj = created && created.name ? created : { name: cleanName };
        setDepartments(prev => {
          const exists = prev.some(d => (d.name || d).toLowerCase() === cleanName.toLowerCase());
          return exists ? prev : [...prev, deptObj];
        });
        showToast(`Departamento "${cleanName}" creado con éxito.`);
        return cleanName;
      } catch (err) {
        showError('Error al crear departamento', err.message);
      }
    }
    return null;
  };

  // ── Filtros locales ───────────────────────────────────────────────────────
  const filtered = employees.filter(emp => {
    const full = `${emp.nombre} ${emp.apellidoPaterno} ${emp.apellidoMaterno} ${emp.noNomina}`.toLowerCase();
    const matchSearch = !search || full.includes(search.toLowerCase());
    const matchDept   = !deptFilter || emp.departamento === deptFilter;
    return matchSearch && matchDept;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activos    = employees.filter(e => e.activo).length;
  const inactivos  = employees.filter(e => !e.activo).length;
  const deptsCount = departments.length || [...new Set(employees.map(e => e.departamento))].length;

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSaved = (saved, wasEditing) => {
    setEmployees(prev =>
      wasEditing
        ? prev.map(e => (e._id === saved._id || e.id === saved.id) ? saved : e)
        : [saved, ...prev]
    );
    setModal(null);
    showToast(wasEditing ? 'Empleado actualizado correctamente.' : 'Empleado registrado correctamente.', wasEditing ? 'info' : 'success');
  };

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async (emp) => {
    const ok = await confirmDialog({
      title: `¿Eliminar a ${emp.nombre} ${emp.apellidoPaterno}?`,
      text: 'Esta acción eliminará el registro permanentemente.',
      confirmButtonText: 'Sí, eliminar',
      icon: 'warning'
    });
    if (!ok) return;
    try {
      await employeesApi.delete(emp._id || emp.id);
      setEmployees(prev => prev.filter(e => e._id !== emp._id && e.id !== emp.id));
      showToast('Empleado eliminado.', 'success');
    } catch (err) {
      showError('Error', err.message);
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="glass animate-fade" style={EmployeesStyles.restrictedCard}>
        <ShieldAlert size={48} style={EmployeesStyles.restrictedIcon} />
        <h2 style={EmployeesStyles.restrictedTitle}>Acceso Restringido</h2>
        <p style={EmployeesStyles.restrictedText}>Se requieren privilegios de Administrador.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div style={EmployeesStyles.header}>
        <div>
          <h1 style={EmployeesStyles.title}>Empleados</h1>
          <p style={EmployeesStyles.subtitle}>Directorio de personal de la empresa</p>
        </div>
        <div style={EmployeesStyles.headerActions}>
          <button className="btn btn-ghost" onClick={fetchEmployees} title="Actualizar" style={EmployeesStyles.refreshButton}>
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={() => setModal('create')} id="btn-add-employee">
            <UserPlus size={16} /> Registrar Empleado
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={EmployeesStyles.statsGrid}>
        <StatCard label="Total empleados" value={employees.length} icon={<Users size={20} />} color="var(--primary)" />
        <StatCard label="Activos"          value={activos}          icon={<BadgeCheck size={20} />} color="var(--success)" />
        <StatCard label="Inactivos"        value={inactivos}        icon={<ShieldAlert size={20} />} color="var(--danger)" />
        <StatCard label="Departamentos"    value={deptsCount}       icon={<Building2 size={20} />} color="var(--accent)" />
      </div>

      {/* ── Filtros / búsqueda ─────────────────────────────────────────────── */}
      <div style={EmployeesStyles.filterBar}>
        <div className="search-input-wrapper" style={EmployeesStyles.searchWrapper}>
          <Search size={15} className="search-icon" />
          <input
            className="input-field"
            style={EmployeesStyles.searchInput}
            placeholder="Buscar por nombre, apellido o nómina..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={EmployeesStyles.deptFilterWrapper}>
          <Building2 size={14} style={EmployeesStyles.deptFilterIcon} />
          <select
            className="input-field"
            style={EmployeesStyles.deptFilterSelect}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="">Todos los departamentos</option>
            {departments.map(d => {
              const name = typeof d === 'string' ? d : d.name;
              return (
                <option key={d.id || name} value={name} style={EmployeesStyles.selectOption}>{name}</option>
              );
            })}
          </select>
          <ChevronDown size={13} style={EmployeesStyles.deptFilterChevron} />
        </div>
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div className="glass" style={EmployeesStyles.tableCard}>
        <div style={EmployeesStyles.tableScroll}>
          <table className="data-table" style={EmployeesStyles.table}>
            <thead>
              <tr>
                {['No. Nómina', 'Nombre completo', 'Departamento', 'Estado', 'Acciones'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={EmployeesStyles.loadingCell}>
                    <Loader2 size={24} style={EmployeesStyles.loadingSpinner} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={<Users size={28} />}
                      title={search || deptFilter ? 'Sin resultados' : 'No hay empleados registrados'}
                      description={search || deptFilter ? 'Prueba con otros filtros de búsqueda.' : 'Registra el primer empleado con el botón superior.'}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(emp => {
                  const empId = emp._id || emp.id;
                  return (
                    <tr key={empId}>
                      {/* No. Nómina */}
                      <td>
                        <span style={EmployeesStyles.nominaBadge}>
                          {emp.noNomina}
                        </span>
                      </td>

                      {/* Nombre completo */}
                      <td>
                        <div style={EmployeesStyles.employeeRowInfo}>
                          <div style={EmployeesStyles.employeeAvatar}>
                            {emp.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={EmployeesStyles.employeeName}>
                              {emp.nombre} {emp.apellidoPaterno} {emp.apellidoMaterno}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Departamento */}
                      <td>
                        <Badge variant="muted">
                          <Building2 size={11} /> {emp.departamento}
                        </Badge>
                      </td>

                      {/* Estado */}
                      <td>
                        <span className={`status-dot ${emp.activo ? '' : 'inactive'}`} style={EmployeesStyles.statusText(emp.activo)}>
                          {emp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td>
                        <div style={EmployeesStyles.actionsGroup}>
                          <button
                            id={`btn-edit-emp-${empId}`}
                            className="btn-icon"
                            title="Editar empleado"
                            onClick={() => setModal(emp)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            id={`btn-del-emp-${empId}`}
                            className="btn-icon danger"
                            title="Eliminar empleado"
                            onClick={() => handleDelete(emp)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={EmployeesStyles.tableFooter}>
            Mostrando {filtered.length} de {employees.length} empleados
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {modal && (
        <EmployeeModal
          employee={modal === 'create' ? null : modal}
          departments={departments}
          onAddNewDepartment={handleAddNewDepartment}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}
