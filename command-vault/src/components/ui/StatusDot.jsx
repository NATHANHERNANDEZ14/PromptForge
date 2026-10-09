/** StatusDot — Punto de estado animado (activo/inactivo) */
export default function StatusDot({ active, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      color: active ? 'var(--success)' : 'var(--danger)',
      fontSize: '0.875rem', fontWeight: 600
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'currentColor',
        boxShadow: active ? '0 0 0 3px rgba(74,222,128,0.2)' : 'none',
        display: 'inline-block',
        animation: active ? 'pulse 2s ease-in-out infinite' : 'none'
      }} />
      {label || (active ? 'Activo' : 'Inactivo')}
    </span>
  );
}
