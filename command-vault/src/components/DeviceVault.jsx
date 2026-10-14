import { useState, useEffect, useCallback } from 'react';
import {
  Monitor, Plus, Search, Eye, EyeOff, Copy, Edit2,
  Trash2, RefreshCw, Wifi, Shield, Laptop, Server, Cpu, X, Save,
  Check, Phone, FileSpreadsheet, FileText, Lock, PlusCircle,
  Hash, UserCheck, HardDrive, Smartphone, CheckCircle2, ChevronDown, User
} from 'lucide-react';
import Swal from 'sweetalert2';

import { devicesApi, areasApi, departmentsApi, employeesApi } from '../services/api';
import { confirmDialog, showToast, showError } from '../utils/alerts';
import { exportDevicesToExcel, exportDevicesToPDF } from '../utils/deviceExport';

// Estilos
import DeviceVaultStyles from '../styles/deviceVaultStyles';

const S = DeviceVaultStyles;

const DEVICE_TYPES = ['Laptop', 'Desktop', 'Servidor', 'Celular', 'Teléfono-IP'];
const DEVICE_STATUSES = ['Operativo', 'Disponible', 'En Mantenimiento', 'De Baja'];

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

const EMPTY_FORM = {
  name: '', type: 'Laptop',
  username: '', noNomina: '', area: '',
  ipWifi: '', ipEth: '', macWifi: '', macEth: '',
  serialNumber: '', password: '', notes: ''
};

// Modal de Formulario de Registro / Edición
function DeviceModal({ device, areas = [], onClose, onSave, onAddNewArea }) {
  const [form, setForm]         = useState(device ? { ...EMPTY_FORM, ...device, area: device.area || device.department || (areas[0] || '') } : { ...EMPTY_FORM, area: areas[0] || '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!device && !form.area && areas.length > 0) {
      setForm(prev => ({ ...prev, area: areas[0] }));
    }
  }, [areas, device, form.area]);

  // ── Employee picker ─────────────────────────────────────────────────────
  const [employees, setEmployees]         = useState([]);
  const [empSearch, setEmpSearch]         = useState('');
  const [empOpen, setEmpOpen]             = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Cargar empleados filtrados por área cuando cambia el área
  useEffect(() => {
    if (!form.area) return;
    employeesApi.getAll({ departamento: form.area, activo: true })
      .then(data => setEmployees(data || []))
      .catch(() => setEmployees([]));
  }, [form.area]);

  // Si estamos editando y hay username+noNomina, inicializar label del picker
  useEffect(() => {
    if (device?.username) {
      setSelectedEmployee({ display: device.username, noNomina: device.noNomina || '' });
    }
  }, []);

  const empFiltered = employees.filter(e => {
    const q = empSearch.toLowerCase();
    return !q ||
      `${e.nombre} ${e.apellidoPaterno} ${e.apellidoMaterno}`.toLowerCase().includes(q) ||
      e.noNomina.toLowerCase().includes(q);
  });

  const selectEmployee = (emp) => {
    const display = `${emp.nombre} ${emp.apellidoPaterno} ${emp.apellidoMaterno || ''}`.trim();
    setSelectedEmployee({ display, noNomina: emp.noNomina });
    setForm(prev => ({ ...prev, username: display, noNomina: emp.noNomina }));
    setEmpOpen(false);
    setEmpSearch('');
  };

  const clearEmployee = () => {
    setSelectedEmployee(null);
    setForm(prev => ({ ...prev, username: '', noNomina: '' }));
  };
  // ───────────────────────────────────────────────────────────────────────

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
      <div className="modal-content glass" style={S.modalContent} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <div>
            <h2 style={S.modalTitle}>
              {device ? 'Editar Dispositivo' : 'Registrar Nuevo Equipo'}
            </h2>
            <p style={S.modalSubtitle}>
              Los datos técnicos y contraseñas se almacenan con cifrado de seguridad
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={S.modalCloseButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={S.formGrid}>

            <div style={S.fullSpan}>
              <label style={S.fieldLabel}>Nombre del equipo *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. LAPTOP-JUAN-01 / PC-CONTABILIDAD-02" required autoFocus />
            </div>

            <div>
              <label style={S.fieldLabel}>Tipo de Equipo</label>
              <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                {DEVICE_TYPES.map(t => (
                  <option key={t} value={t} style={S.selectOption}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={S.areaHeaderRow}>
                <label style={{ ...S.fieldLabel, marginBottom: 0 }}>Área / Departamento *</label>
                <button type="button" onClick={async () => {const newName = await onAddNewArea(); if (newName) set('area', newName);}} style={S.newAreaButton}>
                  <PlusCircle size={12} /> + Nueva Área
                </button>
              </div>
              <select className="input-field" value={form.area} onChange={e => set('area', e.target.value)} required>
                {areas.length === 0 && <option value="">Cargando departamentos...</option>}
                {areas.map(a => (
                  <option key={a} value={a} style={S.selectOption}>{a}</option>
                ))}
              </select>
            </div>

            {/* ── Usuario Asignado (Employee Picker) ── */}
            <div style={S.empPickerWrapper}>
              <label style={S.fieldLabel}>
                <User size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />Usuario Asignado
              </label>
              {selectedEmployee ? (
                <div style={S.empSelectedBox}>
                  <UserCheck size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <div style={S.empSelectedText}>
                    <div style={S.empSelectedName}>{selectedEmployee.display}</div>
                    {selectedEmployee.noNomina && <div style={S.empSelectedNomina}>{selectedEmployee.noNomina}</div>}
                  </div>
                  <button type="button" className="btn-icon danger" style={S.empClearButton} onClick={clearEmployee} title="Quitar asignación"> <X size={12} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setEmpOpen(o => !o)} style={S.empTriggerButton}>
                  <User size={14} />
                  <span style={S.empTriggerFlex}>Seleccionar empleado del área...</span>
                  <ChevronDown size={13} style={{ flexShrink: 0 }} />
                </button>
              )}

              {/* Dropdown picker */}
              {empOpen && (
                <div style={S.empDropdown}>
                  <div style={S.empSearchWrapper}>
                    <input className="input-field" style={S.empSearchInput} placeholder="Buscar nombre o nómina..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} autoFocus/>
                  </div>
                  <div style={S.empListScroll}>
                    {empFiltered.length === 0 ? (
                      <div style={S.empEmpty}>
                        {employees.length === 0 ? 'No hay empleados en esta área.' : 'Sin resultados.'}
                      </div>
                    ) : (
                      empFiltered.map(emp => (
                        <button key={emp._id || emp.id} type="button" onClick={() => selectEmployee(emp)} style={S.empRow} onMouseEnter={e => e.currentTarget.style.background = 'rgba(58,134,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={S.empAvatar}>
                            {emp.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div style={S.empInfo}>
                            <div style={S.empName}>
                              {emp.nombre} {emp.apellidoPaterno} {emp.apellidoMaterno || ''}
                            </div>
                            <div style={S.empNomina}>{emp.noNomina}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* No. Nómina (solo lectura cuando viene del picker) */}
            <div>
              <label style={S.fieldLabel}>
                <Hash size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                No. Nómina
              </label>
              <input className="input-field" value={form.noNomina} onChange={e => set('noNomina', e.target.value)} placeholder={selectedEmployee ? selectedEmployee.noNomina || '' : 'Ej. NOM-8492'} readOnly={Boolean(selectedEmployee)} style={S.nominaInput(Boolean(selectedEmployee))}/>
            </div>

            <div>
              <label style={S.fieldLabel}>Número de Serie / Service Tag</label>
              <input className="input-field" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} placeholder="Ej. CNU1234567 / S/N" />
            </div>

            {/* Bloque IPs */}
            <div>
              <label style={S.fieldLabel}>IP Wi-Fi</label>
              <input className="input-field code-font" value={form.ipWifi} onChange={e => set('ipWifi', e.target.value)} placeholder="Ej. 192.168.1.45" />
            </div>

            <div>
              <label style={S.fieldLabel}>IP Ethernet (ETH)</label>
              <input className="input-field code-font" value={form.ipEth} onChange={e => set('ipEth', e.target.value)} placeholder="Ej. 192.168.1.120" />
            </div>

            {/* Bloque MACs */}
            <div>
              <label style={S.fieldLabel}>Dirección MAC Wi-Fi</label>
              <input className="input-field code-font" value={form.macWifi} onChange={e => set('macWifi', e.target.value)} placeholder="Ej. AA:BB:CC:11:22:33" />
            </div>

            <div> 
              <label style={S.fieldLabel}>Dirección MAC Ethernet (ETH)</label>
              <input className="input-field code-font" value={form.macEth}
                onChange={e => set('macEth', e.target.value)}
                placeholder="Ej. DD:EE:FF:44:55:66" />
            </div>

            <div>
              <div style={S.passwordFieldHeader}>
                <label style={{ ...S.fieldLabel, marginBottom: 0 }}>Contraseña de Laptop</label>
                <span style={S.encryptedLabel}>
                  <Lock size={11} /> Cifrado AES-256
                </span>
              </div>
              <div style={S.passwordInputRow}>
                <div style={S.passwordInputWrapper}>
                  <input className="input-field code-font" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Contraseña del equipo" style={S.passwordInput}/>
                  <button type="button" onClick={() => setShowPass(s => !s)} className="btn-ghost" style={S.passwordToggle}> {showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleGenPass} style={S.generateButton} title="Generar contraseña numérica segura">
                  <RefreshCw size={14} /> Generar
                </button>
              </div>
            </div>

            <div style={S.fullSpan}>
              <label style={S.fieldLabel}>Notas adicionales</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Ubicación física, cargador, accesorios o especificaciones..." />
            </div>
          </div>

          <div style={S.formFooter}>
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
    <div style={S.fieldRow}>
      <span style={S.fieldIcon}>{icon}</span>
      <span style={S.fieldLabel}>{label}</span>
      <span className={isCode ? 'code-font' : ''} style={S.fieldValue(isCode)}> {value} </span>
      {onCopy && (
        <button className="btn-ghost" onClick={onCopy} title="Copiar" style={S.copyButton(copied)}> {copied ? <Check size={13} /> : <Copy size={13} />} </button>
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
    <div className="glass" style={S.deviceCard} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';}}
      onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Acento superior de color */}
      <div style={S.deviceCardAccent(typeStyle.color)} />

      {/* Cabecera */}
      <div style={S.deviceCardHeader}>
        <div style={S.deviceCardTitleGroup}>
          <div style={S.deviceTypeIcon(typeStyle.bg, typeStyle.color)}>
            <TypeIcon type={device.type} size={20} />
          </div>
          <div>
            <h3 style={S.deviceName}>
              {device.name}
            </h3>
            <div style={S.badgesRow}>
              <span style={S.badge(typeStyle.bg, typeStyle.color)}>
                {device.type}
              </span>
              <span style={S.badge(statusStyle.bg, statusStyle.color)}>
                {device.status || 'Operativo'}
              </span>
              {(device.area || device.department) && (
                <span style={S.areaBadge}>
                  {device.area || device.department}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={S.deviceActions}>
          <button className="btn-ghost" onClick={() => onEdit(device)} title="Editar"
            style={S.iconButton}>
            <Edit2 size={16} />
          </button>
          <button className="btn-ghost" onClick={() => onDelete(device)} title="Eliminar"
            style={S.dangerIconButton}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Campos técnicos */}
      <div style={S.fieldsColumn}>
        <FieldRow icon={<UserCheck size={14} />} label="Usuario" value={device.username} />
        <FieldRow icon={<Hash size={14} />} label="No. Nómina" value={device.noNomina} />
        <FieldRow icon={<HardDrive size={14} />} label="No. Serie" value={device.serialNumber} isCode />
        <FieldRow icon={<Wifi size={14} />} label="IP Wi-Fi" value={device.ipWifi} onCopy={() => copy(device.ipWifi, 'IP Wi-Fi')} copied={copied === 'IP Wi-Fi'} isCode />
        <FieldRow icon={<Wifi size={14} />} label="IP ETH" value={device.ipEth} onCopy={() => copy(device.ipEth, 'IP ETH')} copied={copied === 'IP ETH'} isCode />
        <FieldRow icon={<Shield size={14} />} label="MAC Wi-Fi" value={device.macWifi} onCopy={() => copy(device.macWifi, 'MAC Wi-Fi')} copied={copied === 'MAC Wi-Fi'} isCode />
        <FieldRow icon={<Shield size={14} />} label="MAC ETH" value={device.macEth} onCopy={() => copy(device.macEth, 'MAC ETH')} copied={copied === 'MAC ETH'} isCode />
        {device.rustdeskId && (
          <FieldRow
            icon={<span style={S.rustDeskBadge}>RD</span>}
            label="RustDesk ID"
            value={device.rustdeskId}
            onCopy={() => copy(device.rustdeskId, 'RustDesk ID')}
            copied={copied === 'RustDesk ID'}
            isCode
          />
        )}
      </div>

      {/* Contraseña de Laptop (Encriptada en BD) */}
      <div style={S.passwordRow}>
        <div style={S.passwordLeft}>
          <Lock size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={S.passwordLabel}>
            Contraseña Laptop:
          </span>
          <span className={showPass ? 'code-font' : ''} style={S.passwordValue(showPass)}>
            {device.password
              ? (showPass ? device.password : '••••••')
              : <span style={S.noPasswordText}>Sin contraseña</span>}
          </span>
        </div>

        <div style={S.passwordActions}>
          {device.password && (
            <>
              <button className="btn-ghost" onClick={() => setShowPass(s => !s)} title={showPass ? 'Ocultar contraseña' : 'Ver contraseña real'} style={S.passwordActionBtn}> {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="btn-ghost" onClick={() => copy(device.password, 'Contraseña')} title="Copiar contraseña de laptop" style={{ ...S.passwordActionBtn, color: copied === 'Contraseña' ? 'var(--success)' : undefined }}>
                <Copy size={14} />
              </button>
            </>
          )}
          {device.rustdeskId && (
            <button className="btn-ghost" onClick={copyRustDeskBundle} title="Copiar ID RustDesk y Contraseña juntos" style={S.rdPackButton(copied === 'bundle')}> RD Pack </button>
          )}
        </div>
      </div>

      {/* Notas */}
      {device.notes && (
        <p style={S.notesText}>
          {device.notes}
        </p>
      )}

      {/* Pie de tarjeta */}
      <div style={S.cardFooter}>
        <div style={S.assignedBadge(!!device.username)}>
          <span style={S.assignedDot} />
          {device.username ? 'Asignado' : 'Disponible'}
        </div>
        <div style={S.dateText}>
          {device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : 'Registrado'}
        </div>
      </div>
    </div>
  );
}

// Componente Principal
export default function DeviceVault() {
  const [devices, setDevices]     = useState([]);
  const [areas, setAreas]         = useState([]);
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
      const [devicesData, deptsData] = await Promise.all([
        devicesApi.getAll().catch(() => []),
        departmentsApi.getAll().catch(() => [])
      ]);

      setDevices(Array.isArray(devicesData) ? devicesData : []);

      if (Array.isArray(deptsData)) {
        const deptNames = deptsData.map(d => (typeof d === 'string' ? d : d.name)).filter(Boolean);
        setAreas(deptNames);
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
      title: 'Agregar Nueva Área / Departamento',
      input: 'text',
      inputLabel: 'Nombre del área o departamento de la empresa',
      inputPlaceholder: 'Ej. Almacén Central, Producción, Logística...',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      background: '#161e2e',
      color: '#f8fafc',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#475569',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡Debes ingresar un nombre para el área o departamento!';
        }
      }
    });

    if (newAreaName && newAreaName.trim()) {
      const cleanName = newAreaName.trim();
      try {
        await departmentsApi.create(cleanName);
        setAreas(prev => Array.from(new Set([...prev, cleanName])));
        showToast(`Departamento "${cleanName}" creado con éxito`);
        return cleanName;
      } catch (err) {
        showError('Error al crear área', err.message);
      }
    }
    return null;
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

      {/* Encabezado con botones de exportar */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}> Almacén de Laptops y Equipos </h1>
          <p style={S.pageSubtitle}> Inventario corporativo: IP Wi-Fi/ETH, MACs, soporte RustDesk y contraseñas de equipos con cifrado AES-256</p>
        </div>

        {/* Botones de Exportar */}
        <div style={S.exportButtonsRow}>
          <button className="btn btn-ghost" onClick={handleExportExcel} style={S.exportButton} title="Exportar tabla estructurada por áreas en formato Excel (.xlsx)">
            <FileSpreadsheet size={16} style={S.excelIcon} /> Exportar Excel
          </button>
          <button className="btn btn-ghost" onClick={handleExportPDF} disabled={exportingPdf} style={S.exportButton} title="Exportar formato oficial de tabla con áreas en verde y columnas en azul (PDF)">
            <FileText size={16} style={S.pdfIcon} /> 
            {exportingPdf ? 'Generando PDF...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Estadísticas de equipos */}
      <div style={S.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className="glass" style={S.statCard}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div style={S.statValue}>{s.count}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs de vista: General / Asignados / Libres */}
      <div style={S.tabBar}>
        {[
          { key: 'todos',     label: 'Todos',      count: devices.length },
          { key: 'asignados', label: 'Asignados',  count: ocupados },
          { key: 'libres',    label: 'Disponibles', count: libres },
        ].map(tab => (
          <button key={tab.key} onClick={() => setViewMode(tab.key)} style={S.tab(viewMode === tab.key)}>
            {tab.label}
            <span style={S.tabBadge(viewMode === tab.key)}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="glass" style={S.toolbar}>
        <div className="search-input-wrapper" style={S.searchWrapper}>
          <Search className="search-icon" size={18} />
          <input className="input-field" placeholder="Buscar por equipo, IP, MAC, usuario, nómina, serie, área..." value={searchTerm} onChange={e => setSearch(e.target.value)}/>
        </div>

        {/* Filtros por Área y Estado */}
        <div style={S.filtersRow}>
          <select className="input-field" style={S.filterSelect} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
            <option value="Todos" style={S.selectOption}>Área: Todas</option>
            {areas.map(a => (
              <option key={a} value={a} style={S.selectOption}>{a}</option>
            ))}
          </select>

          <select className="input-field" style={S.filterSelect} value={filterStatus} onChange={e => setStatus(e.target.value)}>
            <option value="Todos" style={S.selectOption}>Estado: Todos</option>
            {DEVICE_STATUSES.map(s => (
              <option key={s} value={s} style={S.selectOption}>Estado: {s}</option>
            ))}
          </select>

          <div style={S.filterChipsRow}>
            {['Todos', ...DEVICE_TYPES].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={S.filterChip(filterType === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => { setEdit(null); setShowModal(true); }}
          style={S.registerButton}>
          <Plus size={18} /> Registrar Equipo
        </button>
      </div>

      {/* Grid de Dispositivos */}
      {loading ? (
        <div style={S.loadingContainer}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Cargando inventario de equipos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={S.emptyCard}>
          <Monitor size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={S.emptyText}>
            {devices.length === 0 ? 'No hay equipos registrados aún' : 'Sin resultados para los filtros seleccionados'}
          </p>
          {devices.length === 0 && (
            <button className="btn btn-primary" style={S.emptyRegisterButton}
              onClick={() => { setEdit(null); setShowModal(true); }}>
              <Plus size={18} /> Registrar Primer Equipo
            </button>
          )}
        </div>
      ) : (
        <div style={S.deviceGrid}>
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
