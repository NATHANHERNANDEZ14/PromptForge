import { useState, useEffect } from 'react';
import {
  Monitor, Plus, Search, Eye, EyeOff, Copy, Edit2,
  Trash2, RefreshCw, Wifi, Shield, Laptop, Server, Cpu, X, Save
} from 'lucide-react';

const API_URL = 'http://localhost:3000/api';
const DEVICE_TYPES = ['Laptop', 'Desktop', 'Servidor', 'Celular'];

const TYPE_COLORS = {
  Laptop:   { bg: 'rgba(59,130,246,0.15)',  color: 'var(--primary)' },
  Desktop:  { bg: 'rgba(139,92,246,0.15)',  color: 'var(--accent)' },
  Servidor: { bg: 'rgba(16,185,129,0.15)',  color: 'var(--success)' },
  Celular:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
};

function TypeIcon({ type, size = 18 }) {
  if (type === 'Laptop')   return <Laptop size={size} />;
  if (type === 'Desktop')  return <Monitor size={size} />;
  if (type === 'Servidor') return <Server size={size} />;
  if (type === 'Celular')  return <span style={{ fontSize: size * 0.85 + 'px' }}>&#128241;</span>;
  return <Cpu size={size} />;
}

// ── Generador de contrasena: 6 digitos numericos aleatorios (nunca repetidos entre si) ──
function generatePassword() {
  // Baraja todos los digitos del 0 al 9 y toma los primeros 6 sin repeticion
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  // Asegura que no empiece en 0
  if (digits[0] === 0) {
    const swapIdx = digits.findIndex((d, i) => i > 0 && d !== 0);
    [digits[0], digits[swapIdx]] = [digits[swapIdx], digits[0]];
  }
  return digits.slice(0, 6).join('');
}

// ── Estilos comunes ──────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
};

const EMPTY_FORM = {
  name: '', ip: '', mac: '', type: 'Laptop',
  username: '', rustdeskId: '', password: '', notes: '',
};

// ── Modal Formulario ─────────────────────────────────────────────────────────
function DeviceModal({ device, onClose, onSave }) {
  const [form, setForm]         = useState(device ? { ...device } : { ...EMPTY_FORM });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving]     = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleGenPass = () => set('password', generatePassword());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass"
        style={{ width: '620px', maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {device ? 'Editar dispositivo' : 'Registrar nuevo equipo'}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost"
            style={{ border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nombre del equipo *</label>
              <input className="input-field" value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ej. LAPTOP-JUAN-01" required />
            </div>

            <div>
              <label style={labelStyle}>Tipo</label>
              <select className="input-field" value={form.type}
                onChange={e => set('type', e.target.value)}>
                {DEVICE_TYPES.map(t => (
                  <option key={t} value={t} style={{ color: 'black' }}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Usuario del equipo</label>
              <input className="input-field" value={form.username}
                onChange={e => set('username', e.target.value)}
                placeholder="Ej. jperez" />
            </div>

            <div>
              <label style={labelStyle}>Direccion IP</label>
              <input className="input-field" value={form.ip}
                onChange={e => set('ip', e.target.value)}
                placeholder="Ej. 192.168.1.50" />
            </div>

            <div>
              <label style={labelStyle}>Direccion MAC</label>
              <input className="input-field" value={form.mac}
                onChange={e => set('mac', e.target.value)}
                placeholder="Ej. AA:BB:CC:DD:EE:FF" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>ID de RustDesk</label>
              <input className="input-field" value={form.rustdeskId}
                onChange={e => set('rustdeskId', e.target.value)}
                placeholder="Ej. 123 456 789" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Contrasena de RustDesk</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    className="input-field code-font"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Contrasena"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="btn-ghost"
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleGenPass}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0, gap: '0.4rem' }}
                  title="Generar contrasena segura automaticamente">
                  <RefreshCw size={16} /> Generar
                </button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas adicionales</label>
              <textarea className="input-field" rows={3} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Observaciones, ubicacion, departamento, etc." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Guardando...' : device ? 'Guardar cambios' : 'Registrar equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Fila de campo en la tarjeta ───────────────────────────────────────────────
function FieldRow({ icon, label, value, onCopy, copied }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', fontWeight: 600, width: '76px', flexShrink: 0 }}>{label}</span>
      <span className="code-font" style={{
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: value ? 'var(--text-main)' : 'var(--text-muted)',
        fontStyle: value ? 'normal' : 'italic',
        fontSize: value ? '0.8rem' : '0.75rem',
      }}>
        {value || 'No registrado'}
      </span>
      {onCopy && value && (
        <button className="btn-ghost" onClick={onCopy} title="Copiar"
          style={{ padding: '0.2rem', border: 'none', cursor: 'pointer', borderRadius: '0.25rem',
            color: copied ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }}>
          <Copy size={12} />
        </button>
      )}
    </div>
  );
}

// ── Tarjeta de dispositivo ────────────────────────────────────────────────────
function DeviceCard({ device, onEdit, onDelete }) {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied]     = useState(null);

  const typeStyle = TYPE_COLORS[device.type] || TYPE_COLORS['Otro'];

  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div
      className="glass"
      style={{
        borderRadius: '1rem', padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.9rem',
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Acento superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: typeStyle.color, borderRadius: '1rem 1rem 0 0', opacity: 0.8,
      }} />

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '0.6rem',
            background: typeStyle.bg, color: typeStyle.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <TypeIcon type={device.type} size={20} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, marginBottom: '0.2rem' }}>
              {device.name}
            </h3>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.6rem',
              borderRadius: '1rem', background: typeStyle.bg, color: typeStyle.color,
            }}>
              {device.type}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-ghost" onClick={() => onEdit(device)} title="Editar"
            style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', borderRadius: '0.4rem' }}>
            <Edit2 size={16} />
          </button>
          <button className="btn-ghost" onClick={() => onDelete(device.id)} title="Eliminar"
            style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', borderRadius: '0.4rem', color: 'var(--danger)' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Campos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <FieldRow icon={<Wifi size={14} />} label="IP"
          value={device.ip} onCopy={() => copy(device.ip, 'IP')} copied={copied === 'IP'} />
        <FieldRow icon={<Shield size={14} />} label="MAC"
          value={device.mac} onCopy={() => copy(device.mac, 'MAC')} copied={copied === 'MAC'} />
        <FieldRow icon={<Monitor size={14} />} label="Usuario" value={device.username} />
        <FieldRow
          icon={<span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>RD</span>}
          label="RustDesk ID"
          value={device.rustdeskId}
          onCopy={() => copy(device.rustdeskId, 'RD')}
          copied={copied === 'RD'}
        />
      </div>

      {/* Contrasena */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem', border: '1px solid var(--card-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Contrasena
          </span>
          <span className={showPass ? 'code-font' : ''} style={{
            fontSize: showPass ? '0.85rem' : '1rem',
            letterSpacing: showPass ? 0 : '0.15em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {device.password
              ? (showPass ? device.password : '••••••••')
              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>Sin contrasena</span>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {device.password && (
            <>
              <button className="btn-ghost" onClick={() => setShowPass(s => !s)}
                title={showPass ? 'Ocultar' : 'Mostrar'}
                style={{ padding: '0.3rem', border: 'none', cursor: 'pointer', borderRadius: '0.3rem' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="btn-ghost" onClick={() => copy(device.password, 'pass')}
                title="Copiar contrasena"
                style={{ padding: '0.3rem', border: 'none', cursor: 'pointer', borderRadius: '0.3rem',
                  color: copied === 'pass' ? 'var(--success)' : undefined }}>
                <Copy size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notas */}
      {device.notes && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          {device.notes}
        </p>
      )}

      {/* Estado */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.72rem', color: device.active ? 'var(--success)' : 'var(--danger)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
        {device.active ? 'Activo' : 'Inactivo'}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function DeviceVault() {
  const [devices, setDevices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearch]   = useState('');
  const [filterType, setFilter]   = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editDevice, setEdit]     = useState(null);

  useEffect(() => { loadDevices(); }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/devices`);
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    if (editDevice) {
      const res     = await fetch(`${API_URL}/devices/${editDevice.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const updated = await res.json();
      setDevices(prev => prev.map(d => d.id === editDevice.id ? updated : d));
    } else {
      const res     = await fetch(`${API_URL}/devices`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const created = await res.json();
      setDevices(prev => [created, ...prev]);
    }
    setShowModal(false);
    setEdit(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Estas seguro de eliminar este equipo?')) return;
    await fetch(`${API_URL}/devices/${id}`, { method: 'DELETE' });
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const filtered = devices.filter(d => {
    const matchType   = filterType === 'Todos' || d.type === filterType;
    const q           = searchTerm.toLowerCase();
    const matchSearch = !q || [d.name, d.ip, d.mac, d.username, d.rustdeskId, d.notes]
      .some(v => v && v.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  const stats = [
    { label: 'Total', count: devices.length, color: 'var(--primary)', icon: <Monitor size={20} /> },
    ...DEVICE_TYPES.map(t => ({
      label: t, count: devices.filter(d => d.type === t).length,
      color: TYPE_COLORS[t]?.color,
      icon: <TypeIcon type={t} size={18} />,
    })),
  ];

  return (
    <div className="animate-fade-in">

      {/* Encabezado */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.4rem',
          background: 'var(--primary)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', display: 'inline-block',
        }}>
          Almacen de Laptops
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Gestiona los equipos de la empresa: IPs, MACs y acceso remoto via RustDesk
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} className="glass" style={{
            padding: '1rem 1.25rem', borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="glass" style={{
        padding: '1.25rem', borderRadius: '1rem', marginBottom: '2rem',
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <Search className="search-icon" size={18} />
          <input
            className="input-field"
            placeholder="Buscar por nombre, IP, MAC, usuario, RustDesk..."
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Todos', ...DEVICE_TYPES].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '0.4rem 1rem', borderRadius: '2rem', border: 'none',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
              background: filterType === t ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
              color: filterType === t ? 'white' : 'var(--text-muted)',
            }}>
              {t}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => { setEdit(null); setShowModal(true); }}
          style={{ whiteSpace: 'nowrap' }}>
          <Plus size={18} /> Registrar equipo
        </button>
      </div>

      {/* Grid de dispositivos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Cargando dispositivos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-muted)' }}>
          <Monitor size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {devices.length === 0 ? 'No hay equipos registrados aun' : 'Sin resultados para tu busqueda'}
          </p>
          {devices.length === 0 && (
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}
              onClick={() => { setEdit(null); setShowModal(true); }}>
              <Plus size={18} /> Registrar primer equipo
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onEdit={d => { setEdit(d); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DeviceModal
          device={editDevice}
          onClose={() => { setShowModal(false); setEdit(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
