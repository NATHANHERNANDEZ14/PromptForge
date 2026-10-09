import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Power, Trash2, Edit2, Mail, Users, ShieldCheck } from 'lucide-react';
import { usersApi } from '../services/api';
import { confirmDialog, showError, showToast } from '../utils/alerts';

// Componentes globales
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import PasswordField from './ui/PasswordField';
import PasswordStrength from './ui/PasswordStrength';
import Badge from './ui/Badge';
import StatusDot from './ui/StatusDot';
import EmptyState from './ui/EmptyState';

// ─────────────────────────────────────────────────────────────────────────────
// Estado inicial del formulario
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  id: '', name: '', username: '', email: '',
  password: '', role: 'user', active: true
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Administration() {
  const { users, setUsers } = useData();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [formData, setFormData]       = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors]   = useState({});

  // ─── Guard: Solo administradores ───────────────────────────────────────────
  if (currentUser?.role !== 'admin') {
    return (
      <div className="glass animate-fade-in" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', marginTop: '2rem' }}>
        <Shield size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Se requieren privilegios de Administrador para ver esta sección.
        </p>
      </div>
    );
  }

  // ─── Helpers del formulario ─────────────────────────────────────────────────
  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim())     errors.name     = 'El nombre completo es requerido.';
    if (!formData.username.trim()) errors.username  = 'El nombre de usuario es requerido.';
    if (!formData.email.trim())    errors.email     = 'El correo electrónico es requerido.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                   errors.email     = 'El correo no tiene un formato válido.';
    if (!isEditing) {
      if (!formData.password)      errors.password  = 'La contraseña es requerida.';
      else if (formData.password.length < 8)
                                   errors.password  = 'La contraseña debe tener al menos 8 caracteres.';
      else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(formData.password))
                                   errors.password  = 'Debe incluir mayúscula, minúscula y un número.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openModal = (user = null) => {
    setFormErrors({});
    if (user) {
      setFormData({
        id: user.id || user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        active: user.active !== false
      });
      setIsEditing(true);
    } else {
      setFormData(INITIAL_FORM);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  // ─── Guardar (crear o editar) ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const payload = {
          name:     formData.name,
          username: formData.username,
          email:    formData.email,
          role:     formData.role
        };
        if (formData.password?.trim()) payload.password = formData.password;

        const updated = await usersApi.update(formData.id, payload);
        setUsers(users.map(u =>
          (u.id === formData.id || u._id === formData.id) ? updated : u
        ));
        showToast('Usuario actualizado correctamente');
      } else {
        const created = await usersApi.create(formData);
        setUsers([created, ...users]);
        showToast(`Usuario "@${formData.username}" creado. Se envió email de bienvenida.`);
      }
      closeModal();
    } catch (err) {
      showError('Error al guardar', err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Activar / Desactivar ───────────────────────────────────────────────────
  const toggleStatus = async (user) => {
    const userId    = user.id || user._id;
    const newStatus = !user.active;

    const confirmed = await confirmDialog({
      title: newStatus ? '¿Reactivar usuario?' : '¿Desactivar usuario?',
      text: newStatus
        ? `Se enviará un correo de reactivación a "${user.name}".`
        : `"${user.name}" ya no podrá iniciar sesión. Se le notificará por correo.`,
      confirmButtonText: newStatus ? 'Sí, reactivar' : 'Sí, desactivar',
      icon: 'warning'
    });

    if (!confirmed) return;

    try {
      const updated = await usersApi.update(userId, { active: newStatus });
      setUsers(users.map(u => (u.id === userId || u._id === userId) ? updated : u));
      showToast(
        newStatus ? 'Usuario reactivado. Notificación enviada.' : 'Usuario desactivado. Notificación enviada.',
        newStatus ? 'success' : 'warning'
      );
    } catch (err) {
      showError('Error', err.message || 'No se pudo cambiar el estado.');
    }
  };

  // ─── Eliminar ───────────────────────────────────────────────────────────────
  const deleteUser = async (user) => {
    const userId = user.id || user._id;

    const confirmed = await confirmDialog({
      title: '¿Eliminar usuario permanentemente?',
      text: `Se eliminará la cuenta de "${user.name}" (@${user.username}). Se enviará una notificación a su correo. Esta acción es irreversible.`,
      confirmButtonText: 'Sí, eliminar',
      icon: 'warning'
    });

    if (!confirmed) return;

    try {
      await usersApi.delete(userId);
      setUsers(users.filter(u => u.id !== userId && u._id !== userId));
      showToast('Usuario eliminado. Notificación enviada por correo.', 'warning');
    } catch (err) {
      showError('Error al eliminar', err.message);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const currentUserId = currentUser?.id || currentUser?._id;

  return (
    <div className="animate-fade-in">

      {/* ── Encabezado ── */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Administración de Usuarios</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestiona accesos, roles y notificaciones del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} id="btn-add-user"> <UserPlus size={16} /> Agregar Usuario</button>
      </div>

      {/* ── Stats rápidas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total usuarios" value={users.length} icon={<Users size={20} />} />
        <StatCard label="Activos"   value={users.filter(u => u.active).length}   color="var(--success)" />
        <StatCard label="Inactivos" value={users.filter(u => !u.active).length}  color="var(--danger)"  />
        <StatCard label="Admins"    value={users.filter(u => u.role === 'admin').length} color="var(--accent)" />
      </div>

      {/* ── Tabla ── */}
      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                {['Nombre', 'Usuario', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState icon={<Users size={24} />} title="No hay usuarios registrados" description="Agrega el primer usuario con el botón superior."/>
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const uId = user.id || user._id;
                  const isSelf = uId === currentUserId;
                  return (
                    <tr key={uId}>
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        {user.name}
                        {isSelf && <Badge variant="accent" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Tú</Badge>}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
                        @{user.username}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <Mail size={14} />
                          {user.email || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin correo</span>}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <Badge variant={user.role === 'admin' ? 'accent' : 'primary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <StatusDot active={user.active} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                          <button
                            id={`btn-edit-${uId}`}
                            className="btn-icon"
                            title="Editar usuario"
                            onClick={() => openModal(user)}
                          >
                            <Edit2 size={14} />
                          </button>

                          {!isSelf && (
                            <button
                              id={`btn-toggle-${uId}`}
                              className={`btn-icon ${user.active ? 'danger' : 'success'}`}
                              title={user.active ? 'Desactivar acceso' : 'Reactivar acceso'}
                              onClick={() => toggleStatus(user)}
                            >
                              <Power size={14} />
                            </button>
                          )}

                          {!isSelf && (
                            <button
                              id={`btn-delete-${uId}`}
                              className="btn-icon danger"
                              title="Eliminar cuenta"
                              onClick={() => deleteUser(user)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de creación / edición ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? `Editar: ${formData.name || 'Usuario'}` : 'Nuevo Usuario'}
        size="md"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem' }}>

            <FormField label="Nombre Completo" id="field-name" required error={formErrors.name}>
              <input id="field-name" type="text" className={`input-field${formErrors.name ? ' input-error' : ''}`} value={formData.name} onChange={e => setField('name', e.target.value)} placeholder="Ej. Juan Pérez" autoFocus/>
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Usuario" id="field-username" required error={formErrors.username} hint="Solo letras, números, puntos y guiones">
                <input id="field-username" type="text" className={`input-field${formErrors.username ? ' input-error' : ''}`} value={formData.username} onChange={e => setField('username', e.target.value.toLowerCase())} placeholder="ej. juan.perez"/>
              </FormField>

              <FormField label="Rol del Sistema" id="field-role">
                <select id="field-role" className="input-field" value={formData.role} onChange={e => setField('role', e.target.value)}>
                  <option value="user"  style={{ background: '#1e293b' }}>Usuario Regular</option>
                  <option value="admin" style={{ background: '#1e293b' }}>Administrador</option>
                </select>
              </FormField>
            </div>

            <FormField label="Correo Electrónico" id="field-email" required error={formErrors.email}
              icon={<Mail size={16} />}>
              <input id="field-email" type="email" className={`input-field${formErrors.email ? ' input-error' : ''}`} style={{ paddingLeft: '2.5rem' }} value={formData.email} onChange={e => setField('email', e.target.value)} placeholder="correo@empresa.com" autoComplete="email"/>
            </FormField>

            <FormField label={isEditing ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'} id="field-password" required={!isEditing} error={formErrors.password}>
              <PasswordField id="field-password" value={formData.password} onChange={e => setField('password', e.target.value)} placeholder={isEditing ? '•••••••• (sin cambios)' : 'Mínimo 8 caracteres'} required={!isEditing} autoComplete={isEditing ? 'new-password' : 'new-password'} minLength={8}/>
              <PasswordStrength password={formData.password} />
            </FormField>

          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="btn-save-user">
              {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes locales
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass" style={{ padding: '1rem 1.25rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {icon && (
        <div style={{ color: color || 'var(--primary)', opacity: 0.8 }}>{icon}</div>
      )}
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color || 'var(--text-main)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ActionBtn ya no se usa — se migraron a btn-icon directo en el JSX
