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

// Estilos
import AdministrationStyles from '../styles/administrationStyles';

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

  const S = AdministrationStyles;

  // ─── Guard: Solo administradores ───────────────────────────────────────────
  if (currentUser?.role !== 'admin') {
    return (
      <div className="glass animate-fade-in" style={S.restrictedCard}>
        <Shield size={48} style={S.restrictedIcon} />
        <h2 style={S.restrictedTitle}>Acceso Restringido</h2>
        <p style={S.restrictedText}>
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
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Administración de Usuarios</h1>
          <p style={S.pageSubtitle}>Gestiona accesos, roles y notificaciones del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} id="btn-add-user">
          <UserPlus size={16} /> Agregar Usuario
        </button>
      </div>

      {/* ── Stats rápidas ── */}
      <div style={S.statsGrid}>
        <StatCard label="Total usuarios" value={users.length} icon={<Users size={20} />} />
        <StatCard label="Activos"   value={users.filter(u => u.active).length}   color="var(--success)" />
        <StatCard label="Inactivos" value={users.filter(u => !u.active).length}  color="var(--danger)"  />
        <StatCard label="Admins"    value={users.filter(u => u.role === 'admin').length} color="var(--accent)" />
      </div>

      {/* ── Tabla ── */}
      <div className="glass" style={S.tableCard}>
        <div style={S.tableScroll}>
          <table className="data-table" style={S.table}>
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
                      <td style={S.tdName}>
                        {user.name}
                        {isSelf && <Badge variant="accent" style={S.selfBadge}>Tú</Badge>}
                      </td>
                      <td style={S.tdUsername}>
                        @{user.username}
                      </td>
                      <td style={S.tdEmail}>
                        <span style={S.emailCell}>
                          <Mail size={14} />
                          {user.email || <span style={S.noEmailText}>Sin correo</span>}
                        </span>
                      </td>
                      <td style={S.tdBadge}>
                        <Badge variant={user.role === 'admin' ? 'accent' : 'primary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </td>
                      <td style={S.tdStatus}>
                        <StatusDot active={user.active} />
                      </td>
                      <td>
                        <div style={S.tdActions}>
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
          <div style={S.modalFormBody}>

            <FormField label="Nombre Completo" id="field-name" required error={formErrors.name}>
              <input id="field-name" type="text" className={`input-field${formErrors.name ? ' input-error' : ''}`} value={formData.name} onChange={e => setField('name', e.target.value)} placeholder="Ej. Juan Pérez" autoFocus/>
            </FormField>

            <div style={S.twoColumnGrid}>
              <FormField label="Usuario" id="field-username" required error={formErrors.username} hint="Solo letras, números, puntos y guiones">
                <input id="field-username" type="text" className={`input-field${formErrors.username ? ' input-error' : ''}`} value={formData.username} onChange={e => setField('username', e.target.value.toLowerCase())} placeholder="ej. juan.perez"/>
              </FormField>

              <FormField label="Rol del Sistema" id="field-role">
                <select id="field-role" className="input-field" value={formData.role} onChange={e => setField('role', e.target.value)}>
                  <option value="user"  style={S.selectOption}>Usuario Regular</option>
                  <option value="admin" style={S.selectOption}>Administrador</option>
                </select>
              </FormField>
            </div>

            <FormField label="Correo Electrónico" id="field-email" required error={formErrors.email}
              icon={<Mail size={16} />}>
              <input id="field-email" type="email" className={`input-field${formErrors.email ? ' input-error' : ''}`} style={S.emailInput} value={formData.email} onChange={e => setField('email', e.target.value)} placeholder="correo@empresa.com" autoComplete="email"/>
            </FormField>

            <FormField label={isEditing ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'} id="field-password" required={!isEditing} error={formErrors.password}>
              <PasswordField id="field-password" value={formData.password} onChange={e => setField('password', e.target.value)} placeholder={isEditing ? '•••••••• (sin cambios)' : 'Mínimo 8 caracteres'} required={!isEditing} autoComplete={isEditing ? 'new-password' : 'new-password'} minLength={8}/>
              <PasswordStrength password={formData.password} />
            </FormField>

          </div>

          {/* Acciones */}
          <div style={S.modalFooter}>
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
  const S = AdministrationStyles;
  return (
    <div className="glass" style={S.statCard}>
      {icon && (
        <div style={S.statIcon(color)}>{icon}</div>
      )}
      <div>
        <div style={S.statValue(color)}>
          {value}
        </div>
        <div style={S.statLabel}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ActionBtn ya no se usa — se migraron a btn-icon directo en el JSX
