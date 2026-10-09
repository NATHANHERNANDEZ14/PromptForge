import { useState, useEffect, useCallback } from 'react';
import {
  Monitor, Plus, Search, Eye, EyeOff, Copy, Edit2,
  Trash2, RefreshCw, Wifi, Shield, Laptop, Server, Cpu, X, Save,
  Check, Phone, FileSpreadsheet, FileText, Lock, PlusCircle,
  Hash, UserCheck, HardDrive, Smartphone, CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';

import { devicesApi, areasApi } from '../services/api';
import { confirmDialog, showToast, showError } from '../utils/alerts';
import { exportDevicesToExcel, exportDevicesToPDF } from '../utils/deviceExport';

const DEVICE_TYPES = ['Laptop', 'Desktop', 'Servidor', 'Celular', 'Teléfono-IP'];
const DEVICE_STATUSES = ['Operativo', 'Disponible', 'En Mantenimiento', 'De Baja'];

const DEFAULT_AREAS = [
  'Contabilidad',
  'Ventas',
  'Capital Humano',
  'Diseño',
  'Metrología-Calidad',
  'Máquinas CNC',
  'STE-PPL'
];

const TYPE_COLORS = {
  Laptop:        { bg: 'rgba(59,130,246,0.15)',  color: 'var(--primary)' },
  Desktop:       { bg: 'rgba(139,92,246,0.15)',  color: 'var(--accent)' },
  Servidor:      { bg: 'rgba(16,185,129,0.15)',  color: 'var(--success)' },
  Celular:       { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  'Teléfono-IP': { bg: 'rgba(6,182,212,0.15)',   color: '#06b6d4' },
};

const STATUS_COLORS = {
  'Operativo':        { bg: 'rgba(16,185,129,0.12)', color: 'var(--success)' },
  'Disponible':       { bg: 'rgba(59,130,246,0.12)', color: 'var(--primary)' },
  'En Mantenimiento': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'De Baja':          { bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)' },
};

function TypeIcon({ type, size = 18 }) {
  if (type === 'Laptop')        return <Laptop size={size} />;
  if (type === 'Desktop')       return <Monitor size={size} />;
  if (type === 'Servidor')      return <Server size={size} />;
  if (type === 'Celular')       return <Smartphone size={size} />;
  if (type === 'Teléfono-IP')   return <Phone size={size} />;
  return <Cpu size={size} />;
}

// Generador de contraseña: 6 dígitos numéricos aleatorios (sin repetición)
function generatePassword() {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  if (digits[0] === 0) {
    const swapIdx = digits.findIndex((d, i) => i > 0 && d !== 0);
    [digits[0], digits[swapIdx]] = [digits[swapIdx], digits[0]];
  }
  return digits.slice(0, 6).join('');
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
};

const EMPTY_FORM = {
  name: '', type: 'Laptop',
  username: '', noNomina: '', area: 'Contabilidad',
  ipWifi: '', ipEth: '', macWifi: '', macEth: '',
  serialNumber: '', password: '', notes: ''
};

// Modal de Formulario de Registro / Edición
function DeviceModal({ device, areas, onClose, onSave, onAddNewArea }) {
  const [form, setForm]         = useState(device ? { ...EMPTY_FORM, ...device, area: device.area || device.department || 'Contabilidad' } : { ...EMPTY_FORM });
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
        style={{ width: '680px', maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {device ? 'Editar Dispositivo' : 'Registrar Nuevo Equipo'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
              Los datos técnicos y contraseñas se almacenan con cifrado de seguridad
            </p>
          </div>
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
                placeholder="Ej. LAPTOP-JUAN-01 / PC-CONTABILIDAD-02" required autoFocus />
            </div>

            <div>
              <label style={labelStyle}>Tipo de Equipo</label>
              <select className="input-field" value={form.type}
                onChange={e => set('type', e.target.value)}>
                {DEVICE_TYPES.map(t => (
                  <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Área de la Empresa *</label>
                <button 
                  type="button" 
                  onClick={onAddNewArea}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <PlusCircle size={12} /> + Nueva Área
                </button>
              </div>
              <select className="input-field" value={form.area}
                onChange={e => set('area', e.target.value)} required>
                {areas.map(a => (
                  <option key={a} value={a} style={{ background: '#1e293b' }}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Usuario Asignado</label>
              <input className="input-field" value={form.username}
                onChange={e => set('username', e.target.value)}
                placeholder="Ej. Juan Pérez (jperez)" />
            </div>

            <div>
              <label style={labelStyle}>No. Nómina</label>
              <input className="input-field" value={form.noNomina}
                onChange={e => set('noNomina', e.target.value)}
                placeholder="Ej. NOM-8492" />
            </div>

            <div>
              <label style={labelStyle}>Número de Serie / Service Tag</label>
              <input className="input-field" value={form.serialNumber}
                onChange={e => set('serialNumber', e.target.value)}
                placeholder="Ej. CNU1234567 / S/N" />
            </div>

            {/* Bloque IPs */}
            <div>
              <label style={labelStyle}>IP Wi-Fi</label>
              <input className="input-field code-font" value={form.ipWifi}
                onChange={e => set('ipWifi', e.target.value)}
                placeholder="Ej. 192.168.1.45" />
            </div>

            <div>
              <label style={labelStyle}>IP Ethernet (ETH)</label>
              <input className="input-field code-font" value={form.ipEth}
                onChange={e => set('ipEth', e.target.value)}
                placeholder="Ej. 192.168.1.120" />
            </div>

            {/* Bloque MACs */}
            <div>
              <label style={labelStyle}>Dirección MAC Wi-Fi</label>
              <input className="input-field code-font" value={form.macWifi}
                onChange={e => set('macWifi', e.target.value)}
                placeholder="Ej. AA:BB:CC:11:22:33" />
            </div>

            <div>
              <label style={labelStyle}>Dirección MAC Ethernet (ETH)</label>
              <input className="input-field code-font" value={form.macEth}
                onChange={e => set('macEth', e.target.value)}
                placeholder="Ej. DD:EE:FF:44:55:66" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña de Laptop</label>
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Lock size={11} /> Cifrado AES-256
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    className="input-field code-font"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Contraseña del equipo"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="btn-ghost"
                    style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleGenPass}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0, gap: '0.3rem', display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                  title="Generar contraseña numérica segura">
                  <RefreshCw size={14} /> Generar
                </button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas adicionales</label>
              <textarea className="input-field" rows={2} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Ubicación física, cargador, accesorios o especificaciones..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Guardando...' : device ? 'Guardar Cambios' : 'Registrar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Fila de campo en la tarjeta
function FieldRow({ icon, label, value, onCopy, copied, isCode = false }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', fontWeight: 600, width: '85px', flexShrink: 0 }}>{label}</span>
      <span className={isCode ? 'code-font' : ''} style={{
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: 'var(--text-main)', fontSize: isCode ? '0.78rem' : '0.82rem',
      }}>
        {value}
      </span>
      {onCopy && (
        <button className="btn-ghost" onClick={onCopy} title="Copiar"
          style={{ padding: '0.2rem', border: 'none', cursor: 'pointer', borderRadius: '0.25rem',
            color: copied ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );
}

// Tarjeta de Dispositivo
function DeviceCard({ device, onEdit, onDelete }) {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied]     = useState(null);

  const typeStyle   = TYPE_COLORS[device.type] || TYPE_COLORS['Laptop'];
  const statusStyle = STATUS_COLORS[device.status] || STATUS_COLORS['Operativo'];

  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`${label} copiado`);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyRustDeskBundle = async () => {
    const bundle = `ID RustDesk: ${device.rustdeskId || '-'}\nContraseña Laptop: ${device.password || '-'}`;
    await navigator.clipboard.writeText(bundle);
    setCopied('bundle');
    showToast('Credenciales completas copiadas');
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div
      className="glass"
      style={{
        borderRadius: '1rem', padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
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
      {/* Acento superior de color */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: typeStyle.color, borderRadius: '1rem 1rem 0 0', opacity: 0.9,
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
            <h3 style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, marginBottom: '0.25rem' }}>
              {device.name}
            </h3>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                borderRadius: '1rem', background: typeStyle.bg, color: typeStyle.color,
              }}>
                {device.type}
              </span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                borderRadius: '1rem', background: statusStyle.bg, color: statusStyle.color,
              }}>
                {device.status || 'Operativo'}
              </span>
              {(device.area || device.department) && (
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                  borderRadius: '1rem', background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)',
                }}>
                  {device.area || device.department}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-ghost" onClick={() => onEdit(device)} title="Editar"
            style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', borderRadius: '0.4rem' }}>
            <Edit2 size={16} />
          </button>
          <button className="btn-ghost" onClick={() => onDelete(device)} title="Eliminar"
            style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', borderRadius: '0.4rem', color: 'var(--danger)' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Campos técnicos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <FieldRow icon={<UserCheck size={14} />} label="Usuario" value={device.username} />
        <FieldRow icon={<Hash size={14} />} label="No. Nómina" value={device.noNomina} />
        <FieldRow icon={<HardDrive size={14} />} label="No. Serie" value={device.serialNumber} isCode />
        <FieldRow icon={<Wifi size={14} />} label="IP Wi-Fi" value={device.ipWifi} onCopy={() => copy(device.ipWifi, 'IP Wi-Fi')} copied={copied === 'IP Wi-Fi'} isCode />
        <FieldRow icon={<Wifi size={14} />} label="IP ETH" value={device.ipEth} onCopy={() => copy(device.ipEth, 'IP ETH')} copied={copied === 'IP ETH'} isCode />
        <FieldRow icon={<Shield size={14} />} label="MAC Wi-Fi" value={device.macWifi} onCopy={() => copy(device.macWifi, 'MAC Wi-Fi')} copied={copied === 'MAC Wi-Fi'} isCode />
        <FieldRow icon={<Shield size={14} />} label="MAC ETH" value={device.macEth} onCopy={() => copy(device.macEth, 'MAC ETH')} copied={copied === 'MAC ETH'} isCode />
        {device.rustdeskId && (
          <FieldRow
            icon={<span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>RD</span>}
            label="RustDesk ID"
            value={device.rustdeskId}
            onCopy={() => copy(device.rustdeskId, 'RustDesk ID')}
            copied={copied === 'RustDesk ID'}
            isCode
          />
        )}
      </div>

      {/* Contraseña de Laptop (Encriptada en BD) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.25)', borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem', border: '1px solid var(--card-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, overflow: 'hidden' }}>
          <Lock size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Contraseña Laptop:
          </span>
          <span className={showPass ? 'code-font' : ''} style={{
            fontSize: showPass ? '0.85rem' : '1.1rem',
            letterSpacing: showPass ? 0 : '0.18em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontWeight: showPass ? 700 : 'normal'
          }}>
            {device.password
              ? (showPass ? device.password : '••••••')
              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>Sin contraseña</span>}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {device.password && (
            <>
              <button className="btn-ghost" onClick={() => setShowPass(s => !s)}
                title={showPass ? 'Ocultar contraseña' : 'Ver contraseña real'}
                style={{ padding: '0.3rem', border: 'none', cursor: 'pointer', borderRadius: '0.3rem' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="btn-ghost" onClick={() => copy(device.password, 'Contraseña')}
                title="Copiar contraseña de laptop"
                style={{ padding: '0.3rem', border: 'none', cursor: 'pointer', borderRadius: '0.3rem',
                  color: copied === 'Contraseña' ? 'var(--success)' : undefined }}>
                <Copy size={14} />
              </button>
            </>
          )}
          {device.rustdeskId && (
            <button className="btn-ghost" onClick={copyRustDeskBundle}
              title="Copiar ID RustDesk y Contraseña juntos"
              style={{ padding: '0.3rem 0.5rem', border: 'none', cursor: 'pointer', borderRadius: '0.3rem',
                color: copied === 'bundle' ? 'var(--success)' : 'var(--primary)', fontWeight: 700, fontSize: '0.7rem' }}>
              RD Pack
            </button>
          )}
        </div>
      </div>

      {/* Notas */}
      {device.notes && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
          {device.notes}
        </p>
      )}

      {/* Pie de tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.72rem', fontWeight: 700,
          padding: '0.2rem 0.6rem', borderRadius: '1rem',
          background: device.username ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)',
          color: device.username ? 'var(--primary)' : 'var(--success)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
          {device.username ? 'Asignado' : 'Disponible'}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : 'Registrado'}
        </div>
      </div>
    </div>
  );
}

// Componente Principal
export default function DeviceVault() {
  const [devices, setDevices]     = useState([]);
  const [areas, setAreas]         = useState(DEFAULT_AREAS);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearch]   = useState('');
  const [filterType, setFilter]   = useState('Todos');
  const [filterArea, setFilterArea] = useState('Todos');
  const [filterStatus, setStatus] = useState('Todos');
  const [viewMode, setViewMode]   = useState('todos');   // 'todos' | 'asignados' | 'libres'
  const [showModal, setShowModal] = useState(false);
  const [editDevice, setEdit]     = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [devicesData, areasData] = await Promise.all([
        devicesApi.getAll().catch(() => []),
        areasApi.getAll().catch(() => [])
      ]);

      setDevices(Array.isArray(devicesData) ? devicesData : []);

      if (Array.isArray(areasData) && areasData.length > 0) {
        const areaNames = areasData.map(a => a.name).filter(Boolean);
        // Mezclar las áreas por defecto con las que vengan de la BD
        const combined = Array.from(new Set([...DEFAULT_AREAS, ...areaNames]));
        setAreas(combined);
      }
    } catch (err) {
      console.error('Error cargando almacén de dispositivos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const handleAddNewArea = async () => {
    const { value: newAreaName } = await Swal.fire({
      title: 'Agregar Nueva Área',
      input: 'text',
      inputLabel: 'Nombre del área o departamento de la empresa',
      inputPlaceholder: 'Ej. Almacén Central, Producción, Logística...',
      showCancelButton: true,
      confirmButtonText: 'Crear Área',
      cancelButtonText: 'Cancelar',
      background: '#161e2e',
      color: '#f8fafc',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#475569',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡Debes ingresar un nombre para el área!';
        }
      }
    });

    if (newAreaName && newAreaName.trim()) {
      const cleanName = newAreaName.trim();
      try {
        await areasApi.create(cleanName);
        setAreas(prev => Array.from(new Set([...prev, cleanName])));
        showToast(`Área "${cleanName}" creada con éxito`);
      } catch (err) {
        showError('Error al crear área', err.message);
      }
    }
  };

  const handleSave = async (form) => {
    try {
      if (editDevice) {
        const dId = editDevice.id || editDevice._id;
        const updated = await devicesApi.update(dId, form);
        setDevices(prev => prev.map(d => (d.id === dId || d._id === dId) ? updated : d));
        showToast('Equipo actualizado con éxito');
      } else {
        const created = await devicesApi.create(form);
        setDevices(prev => [created, ...prev]);
        showToast('Equipo registrado correctamente (contraseña cifrada)');
      }
      setShowModal(false);
      setEdit(null);
    } catch (err) {
      showError('Error al guardar', err.message);
    }
  };

  const handleDelete = async (device) => {
    const dId = device.id || device._id;
    const confirmed = await confirmDialog({
      title: '¿Eliminar dispositivo?',
      text: `Se borrará el registro técnico de "${device.name}".`,
      confirmButtonText: 'Sí, eliminar',
      icon: 'warning'
    });

    if (confirmed) {
      try {
        await devicesApi.delete(dId);
        setDevices(prev => prev.filter(d => d.id !== dId && d._id !== dId));
        showToast('Dispositivo eliminado');
      } catch (err) {
        showError('Error al eliminar', err.message);
      }
    }
  };

  const handleExportExcel = async () => {
    if (filtered.length === 0) {
      showToast('No hay equipos para exportar', 'info');
      return;
    }
    
    const { value: selectedType } = await Swal.fire({
      title: 'Exportar Inventario a Excel',
      input: 'select',
      inputOptions: {
        'Todos': 'Todos los equipos',
        'Laptop': 'Solo Laptops',
        'Desktop': 'Solo Desktop',
        'Servidor': 'Solo Servidores',
        'Celular': 'Solo Celulares',
        'Teléfono-IP': 'Solo Teléfonos-IP',
      },
      inputPlaceholder: 'Selecciona el tipo de equipo...',
      showCancelButton: true,
      background: '#161e2e',
      color: '#f8fafc',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!selectedType) return; // Cancelado
    
    const exportDevices = selectedType === 'Todos' 
      ? filtered 
      : filtered.filter(d => d.type === selectedType);
    
    if (exportDevices.length === 0) {
      showToast('No hay equipos de ese tipo para exportar', 'info');
      return;
    }

    try {
      exportDevicesToExcel(exportDevices, selectedType);
      showToast('Inventario exportado a Excel (.xlsx)');
    } catch (err) {
      showError('Error al exportar a Excel', err.message);
    }
  };

  const handleExportPDF = async () => {
    if (filtered.length === 0) {
      showToast('No hay equipos para exportar', 'info');
      return;
    }
    setExportingPdf(true);
    try {
      await exportDevicesToPDF(filtered);
      showToast('Ficha técnica PDF generada con éxito');
    } catch (err) {
      showError('Error al generar PDF', err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  const filtered = devices.filter(d => {
    const matchType   = filterType === 'Todos' || d.type === filterType;
    const deviceArea  = d.area || d.department || 'General';
    const matchArea   = filterArea === 'Todos' || deviceArea.toLowerCase() === filterArea.toLowerCase();
    const matchStatusFilter = filterStatus === 'Todos' || (d.status || 'Operativo') === filterStatus;
    const matchStatus =
      viewMode === 'todos'     ? true :
      viewMode === 'asignados' ? (d.username && d.username.trim() !== '') :
                                 (!d.username || d.username.trim() === '');
    const q           = searchTerm.toLowerCase();
    const matchSearch = !q || [
      d.name, d.ipWifi, d.ipEth, d.ip, d.macWifi, d.macEth, d.mac,
      d.username, d.noNomina, d.rustdeskId, d.notes, d.area, d.department, d.serialNumber
    ].some(v => v && String(v).toLowerCase().includes(q));

    return matchType && matchArea && matchStatusFilter && matchStatus && matchSearch;
  });

  const ocupados = devices.filter(d => d.username && d.username.trim() !== '').length;
  const libres   = devices.filter(d => !d.username || d.username.trim() === '').length;

  const stats = [
    { label: 'Total',        count: devices.length, color: 'var(--primary)', icon: <Monitor size={20} /> },
    { label: 'Asignados',    count: ocupados,        color: 'var(--primary)', icon: <UserCheck size={18} /> },
    { label: 'Disponibles',  count: libres,          color: 'var(--success)', icon: <CheckCircle2 size={18} /> },
    ...DEVICE_TYPES.map(t => ({
      label: t, count: devices.filter(d => d.type === t).length,
      color: TYPE_COLORS[t]?.color,
      icon: <TypeIcon type={t} size={18} />,
    })),
  ];

  return (
    <div className="animate-fade-in">

      {/* Encabezado con botones de exportar idénticos a los requerimientos */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{
            fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.4rem',
            background: 'var(--primary)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', display: 'inline-block',
          }}>
            Almacén de Laptops y Equipos
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Inventario corporativo: IP Wi-Fi/ETH, MACs, soporte RustDesk y contraseñas de equipos con cifrado AES-256
          </p>
        </div>

        {/* Botones de Exportar en PDF o Excel según Imagen 3 */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-ghost"
            onClick={handleExportExcel}
            style={{ border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            title="Exportar tabla estructurada por áreas en formato Excel (.xlsx)"
          >
            <FileSpreadsheet size={16} style={{ color: '#10b981' }} /> Exportar Excel
          </button>
          <button 
            className="btn btn-ghost"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            style={{ border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            title="Exportar formato oficial de tabla con áreas en verde y columnas en azul (PDF)"
          >
            <FileText size={16} style={{ color: '#3b82f6' }} /> 
            {exportingPdf ? 'Generando PDF...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Estadísticas de equipos */}
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

      {/* Tabs de vista: General / Asignados / Libres */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.3rem', width: 'fit-content' }}>
        {[
          { key: 'todos',     label: 'Todos',      count: devices.length },
          { key: 'asignados', label: 'Asignados',  count: ocupados },
          { key: 'libres',    label: 'Disponibles', count: libres },
        ].map(tab => (
          <button key={tab.key} onClick={() => setViewMode(tab.key)} style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
            transition: 'all 0.2s',
            background: viewMode === tab.key ? 'var(--primary)' : 'transparent',
            color:      viewMode === tab.key ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {tab.label}
            <span style={{
              fontSize: '0.7rem', fontWeight: 800,
              background: viewMode === tab.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
              color:      viewMode === tab.key ? 'white' : 'var(--text-muted)',
              borderRadius: '1rem', padding: '0.1rem 0.5rem',
              minWidth: 20, textAlign: 'center',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="glass" style={{
        padding: '1.25rem', borderRadius: '1rem', marginBottom: '2rem',
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
          <Search className="search-icon" size={18} />
          <input
            className="input-field"
            placeholder="Buscar por equipo, IP, MAC, usuario, nómina, serie, área..."
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filtros por Área y Estado */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}
            value={filterArea}
            onChange={e => setFilterArea(e.target.value)}
          >
            <option value="Todos" style={{ background: '#1e293b' }}>Área: Todas</option>
            {areas.map(a => (
              <option key={a} value={a} style={{ background: '#1e293b' }}>{a}</option>
            ))}
          </select>

          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}
            value={filterStatus}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="Todos" style={{ background: '#1e293b' }}>Estado: Todos</option>
            {DEVICE_STATUSES.map(s => (
              <option key={s} value={s} style={{ background: '#1e293b' }}>Estado: {s}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['Todos', ...DEVICE_TYPES].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '0.4rem 0.85rem', borderRadius: '2rem', border: 'none',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                background: filterType === t ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                color: filterType === t ? 'white' : 'var(--text-muted)',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => { setEdit(null); setShowModal(true); }}
          style={{ whiteSpace: 'nowrap' }}>
          <Plus size={18} /> Registrar Equipo
        </button>
      </div>

      {/* Grid de Dispositivos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Cargando inventario de equipos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-muted)' }}>
          <Monitor size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {devices.length === 0 ? 'No hay equipos registrados aún' : 'Sin resultados para los filtros seleccionados'}
          </p>
          {devices.length === 0 && (
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}
              onClick={() => { setEdit(null); setShowModal(true); }}>
              <Plus size={18} /> Registrar Primer Equipo
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(device => {
            const dId = device.id || device._id;
            return (
              <DeviceCard
                key={dId}
                device={device}
                onEdit={d => { setEdit(d); setShowModal(true); }}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DeviceModal
          device={editDevice}
          areas={areas}
          onClose={() => { setShowModal(false); setEdit(null); }}
          onSave={handleSave}
          onAddNewArea={handleAddNewArea}
        />
      )}
    </div>
  );
}
