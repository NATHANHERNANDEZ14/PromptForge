/**
 * Badge — Chip/etiqueta de estado o categoría
 * Props:
 *   - variant: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'muted'
 *   - children: ReactNode
 */
const VARIANTS = {
  primary: { bg: 'rgba(59,130,246,0.15)',   color: 'var(--primary)',  border: 'rgba(59,130,246,0.3)'  },
  success: { bg: 'rgba(74,222,128,0.12)',   color: '#4ade80',         border: 'rgba(74,222,128,0.25)' },
  warning: { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24',         border: 'rgba(251,191,36,0.25)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',    color: 'var(--danger)',   border: 'rgba(239,68,68,0.25)'  },
  accent:  { bg: 'rgba(139,92,246,0.15)',   color: 'var(--accent)',   border: 'rgba(139,92,246,0.3)'  },
  muted:   { bg: 'rgba(255,255,255,0.06)',  color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)' }
};

export default function Badge({ variant = 'muted', children, style }) {
  const v = VARIANTS[variant] || VARIANTS.muted;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.65rem', borderRadius: '999px',
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em',
      background: v.bg, color: v.color,
      border: `1px solid ${v.border}`,
      ...style
    }}>
      {children}
    </span>
  );
}
