import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  TerminalSquare,
  Users,
  LogOut,
  Terminal,
  Bell,
  Laptop,
  ShieldAlert,
  CheckCircle2,
  Info,
  AlertTriangle,
  BellOff,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { notificationsApi } from '../services/api';

// ── Notification type config ────────────────────────────────────────────────
const NOTIF_CONFIG = {
  alert:   { Icon: ShieldAlert,    cls: 'type-alert' },
  success: { Icon: CheckCircle2,   cls: 'type-success' },
  info:    { Icon: Info,           cls: 'type-info' },
  warning: { Icon: AlertTriangle,  cls: 'type-warning' },
};

function getNotifConfig(type) {
  return NOTIF_CONFIG[type] || NOTIF_CONFIG.info;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs} h`;
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

// ── NotificationPanel ────────────────────────────────────────────────────────
function NotificationPanel({ notifications, onClose }) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-panel" role="dialog" aria-label="Panel de notificaciones">
      <div className="notif-panel-header">
        <span className="notif-panel-title">
          <Bell size={15} />
          Notificaciones
          {unread > 0 && (
            <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
              {unread} nuevas
            </span>
          )}
        </span>
        <button
          className="btn-icon"
          onClick={onClose}
          title="Cerrar"
          style={{ width: 28, height: 28, border: 'none', color: 'var(--text-muted)' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="notif-panel-body">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <BellOff size={28} strokeWidth={1.5} />
            <p>Sin notificaciones recientes</p>
          </div>
        ) : (
          notifications.map(n => {
            const { Icon, cls } = getNotifConfig(n.type);
            return (
              <div key={n._id || n.id} className={`notif-item ${cls}`}>
                <div className={`notif-icon ${cls}`}>
                  <Icon size={15} strokeWidth={2} />
                </div>
                <div className="notif-text">
                  <p>{n.message}</p>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const panelRef = useRef(null);

  const navItems = [
    { name: 'Mis flujos',  path: '/',        Icon: LayoutDashboard },
    { name: 'Comandos',    path: '/commands', Icon: TerminalSquare },
    { name: 'Dispositivos',path: '/devices',  Icon: Laptop },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ name: 'Administración', path: '/admin', Icon: Users });
  }

  // Fetch notificaciones
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    notificationsApi.getAll()
      .then(data => setNotifications(data || []))
      .catch(console.error);
  }, [currentUser]);

  // Cerrar panel al hacer clic afuera
  useEffect(() => {
    if (!showNotifs) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleNotifs = async () => {
    const next = !showNotifs;
    setShowNotifs(next);
    if (next && unreadCount > 0) {
      try {
        await notificationsApi.markAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('[Notifs] Error al marcar como leídas:', err);
      }
    }
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav style={{
      height: 'var(--nav-height)',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid var(--card-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      gap: '1.5rem',
    }}>

      {/* ── Brand ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: '0 0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            color: 'var(--primary)', fontWeight: 800, fontSize: '1.05rem',
            letterSpacing: '0.06em', textDecoration: 'none',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-dim)',
            border: '1px solid rgba(58,134,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Terminal size={17} strokeWidth={2.5} />
          </div>
          COMMAND VAULT
        </Link>

        {/* ── Nav links ───────────────────────── */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {navItems.map(({ name, path, Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '0.845rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text-main)' : 'var(--text-muted)',
                  background: active ? 'rgba(58,134,255,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(58,134,255,0.25)' : 'transparent'}`,
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Right actions ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>

        {/* Notificaciones (solo admin) */}
        {currentUser?.role === 'admin' && (
          <div ref={panelRef} style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={handleToggleNotifs}
              title="Notificaciones"
              style={{
                width: 38, height: 38,
                border: '1px solid var(--card-border)',
                color: showNotifs ? 'var(--primary)' : 'var(--text-muted)',
                background: showNotifs ? 'var(--primary-dim)' : 'transparent',
                position: 'relative',
              }}
            >
              <Bell size={17} strokeWidth={showNotifs ? 2.5 : 2} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  background: 'var(--danger)',
                  width: 7, height: 7,
                  borderRadius: '50%',
                  border: '1.5px solid var(--bg-color)',
                }} />
              )}
            </button>

            {showNotifs && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>
        )}

        {/* Separador */}
        <div style={{ width: 1, height: 22, background: 'var(--card-border)' }} />

        {/* Avatar + nombre */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--card-border)',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.8rem',
            flexShrink: 0,
          }}>
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '0.845rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {currentUser?.name}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="btn-icon"
          title="Cerrar sesión"
          style={{ width: 38, height: 38, border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.background = 'var(--danger-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
