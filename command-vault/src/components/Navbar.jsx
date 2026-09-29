import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TerminalSquare, Users, LogOut, Terminal, Bell, Laptop } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetch('http://localhost:3000/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(console.error);
    }
  }, [currentUser]);

  const navItems = [
    { name: 'Mis flujos', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Comandos', path: '/commands', icon: <TerminalSquare size={18} /> },
    { name: 'Almacen de Laptops', path: '/devices', icon: <Laptop size={18} /> },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ name: 'Administración', path: '/admin', icon: <Users size={18} /> });
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifs = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs && unreadCount > 0) {
      // mark as read
      await fetch('http://localhost:3000/api/notifications/read', { method: 'PUT' });
      setNotifications(notifications.map(n => ({...n, read: true})));
    }
  };

  return (
    <nav className="glass" style={{ padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem', letterSpacing: '0.05em' }}>
          <Terminal size={24} />
          <span>COMMAND VAULT</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                textDecoration: 'none',
                color: location.pathname === item.path ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {currentUser?.role === 'admin' && (
          <div style={{ position: 'relative' }}>
            <button className="btn-ghost" style={{ padding: '0.5rem', position: 'relative', border: 'none', cursor: 'pointer' }} onClick={handleOpenNotifs}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifs && (
              <div className="glass" style={{ position: 'absolute', top: '100%', right: 0, width: '350px', maxHeight: '400px', overflowY: 'auto', borderRadius: '0.5rem', padding: '1rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-lg)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Notificaciones</h3>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay notificaciones.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map(n => (
                      <div key={n._id || n.id} style={{ fontSize: '0.875rem', padding: '0.75rem', borderRadius: '0.5rem', background: n.type === 'alert' ? 'rgba(226, 125, 96, 0.1)' : 'rgba(0,0,0,0.05)', borderLeft: `4px solid ${n.type === 'alert' ? 'var(--danger)' : 'var(--primary)'}` }}>
                        <p style={{ margin: 0, color: 'var(--text-main)' }}>{n.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <span>{currentUser?.name}</span>
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ padding: '0.5rem', border: 'none', cursor: 'pointer' }} title="Cerrar Sesión">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
