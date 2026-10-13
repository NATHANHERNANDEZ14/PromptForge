import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Edit2, Trash2, Search, Building2,
  Hash, User, ChevronDown, X, Save, Loader2,
  ShieldAlert, BadgeCheck, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeesApi } from '../services/api';
import { confirmDialog, showToast, showError } from '../utils/alerts';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import EmptyState from './ui/EmptyState';
import Badge from './ui/Badge';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const DEPARTAMENTOS = [
  'Contabilidad', 'Ventas', 'Capital Humano', 'Diseño',
  'Metrología-Calidad', 'Máquinas CNC', 'STE-PPL',
  'Sistemas', 'Logística', 'Producción', 'Dirección'
];

const EMPTY_FORM = {
  noNomina: '', nombre: '', apellidoPaterno: '',
  apellidoMaterno: '', departamento: DEPARTAMENTOS[0], activo: true
};

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeModal — Crear / Editar
// ─────────────────────────────────────────────────────────────────────────────
function EmployeeModal({ employee, onClose, onSave }) {
  const isEditing = Boolean(employee?._id || employee?.id);
  const [form, setForm]           = useState(isEditing ? { ...EMPTY_FORM, ...employee } : { ...EMPTY_FORM });
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* No. Nómina */}
          <FormField label="No. Nómina" id="emp-nomina" required error={errors.noNomina}
            icon={<Hash size={15} />}>
            <input
              id="emp-nomina"
              className={`input-field${errors.noNomina ? ' input-error' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
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
              style={{ paddingLeft: '2.5rem' }}
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej. Juan Carlos"
            />
          </FormField>

          {/* Apellidos en grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
          <FormField label="Departamento" id="emp-dept" required error={errors.departamento}
            icon={<Building2 size={15} />}>
            <select
              id="emp-dept"
              className={`input-field${errors.departamento ? ' input-error' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
              value={form.departamento}
              onChange={e => set('departamento', e.target.value)}
            >
              {DEPARTAMENTOS.map(d => (
                <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>
              ))}
            </select>
          </FormField>

          {/* Estado activo (solo en edición) */}
          {isEditing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => set('activo', e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--success)', cursor: 'pointer' }}
                />
                <span style={{ color: form.activo ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {form.activo ? 'Empleado activo' : 'Empleado inactivo'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
    <div className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-main)' }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>{label}</div>
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

  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal]           = useState(null); // null | 'create' | employee obj

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

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

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
  const depts = [...new Set(employees.map(e => e.departamento))].length;

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
      <div className="glass animate-fade" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', marginTop: '2rem' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Se requieren privilegios de Administrador.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>Empleados</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Directorio de personal de la empresa</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={fetchEmployees} title="Actualizar" style={{ padding: '0.6rem' }}>
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={() => setModal('create')} id="btn-add-employee">
            <UserPlus size={16} /> Registrar Empleado
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total empleados" value={employees.length} icon={<Users size={20} />} color="var(--primary)" />
        <StatCard label="Activos"          value={activos}          icon={<BadgeCheck size={20} />} color="var(--success)" />
        <StatCard label="Inactivos"        value={inactivos}        icon={<ShieldAlert size={20} />} color="var(--danger)" />
        <StatCard label="Departamentos"    value={depts}            icon={<Building2 size={20} />} color="var(--accent)" />
      </div>

      {/* ── Filtros / búsqueda ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: '1 1 240px' }}>
          <Search size={15} className="search-icon" />
          <input
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Buscar por nombre, apellido o nómina..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', minWidth: 180 }}>
          <Building2 size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select
            className="input-field"
            style={{ paddingLeft: '2.5rem', paddingRight: '2rem', appearance: 'none' }}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="">Todos los departamentos</option>
            {[...new Set(employees.map(e => e.departamento))].sort().map(d => (
              <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 640 }}>
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
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', display: 'inline-block' }} />
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
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-dim)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-xs)' }}>
                          {emp.noNomina}
                        </span>
                      </td>

                      {/* Nombre completo */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {emp.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
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
                        <span className={`status-dot ${emp.activo ? '' : 'inactive'}`} style={{ color: emp.activo ? 'var(--success)' : 'var(--text-muted)' }}>
                          {emp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
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
          <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--card-border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Mostrando {filtered.length} de {employees.length} empleados
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {modal && (
        <EmployeeModal
          employee={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}
