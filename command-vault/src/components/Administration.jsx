import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Power, Trash2, Edit2, Key } from 'lucide-react';

export default function Administration() {
  const { users, setUsers } = useData();
  const { currentUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', username: '', password: '', name: '', role: 'user', active: true });

  if (currentUser?.role !== 'admin') {
    return <div style={{ padding: '2rem' }}>Acceso denegado</div>;
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({ ...user, password: '' }); // Don't show password on edit, but allow setting new
      setIsEditing(true);
    } else {
      setFormData({ id: '', username: '', password: '', name: '', role: 'user', active: true });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      const res = await fetch(`http://localhost:3000/api/users/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, username: formData.username, role: formData.role, password: formData.password })
      });
      const updated = await res.json();
      setUsers(users.map(u => u.id === formData.id ? updated : u));
    } else {
      const res = await fetch(`http://localhost:3000/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const created = await res.json();
      setUsers([...users, created]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const res = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !user.active })
    });
    const updated = await res.json();
    setUsers(users.map(u => u.id === id ? updated : u));
  };

  const deleteUser = async (id) => {
    if(confirm('¿Estás seguro de eliminar este usuario?')) {
      await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Administración de Usuarios</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona los accesos y roles del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} /> Agregar Usuario
        </button>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nombre</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Usuario</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Rol</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>{user.name}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{user.username}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: user.role === 'admin' ? 'var(--accent)' : 'var(--primary)'
                  }}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    color: user.active ? 'var(--success)' : 'var(--danger)',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }} onClick={() => handleOpenModal(user)} title="Editar y cambiar contraseña">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', color: user.active ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(user.id)} title={user.active ? 'Desactivar' : 'Activar'}>
                      <Power size={18} />
                    </button>
                    {user.id !== currentUser.id && (
                      <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => deleteUser(user.id)} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
                  <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Usuario</label>
                  <input type="text" className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{isEditing ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}</label>
                  <input type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEditing} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Rol</label>
                  <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="user" style={{ color: 'black' }}>Usuario</option>
                    <option value="admin" style={{ color: 'black' }}>Administrador</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
