import { Loader2 } from 'lucide-react';

/** Spinner — Indicador de carga */
export default function Spinner({ size = 20, label = 'Cargando...' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
      <Loader2 size={size} className="animate-spin" aria-hidden="true" />
      {label && <span style={{ fontSize: '0.875rem' }}>{label}</span>}
    </span>
  );
}
