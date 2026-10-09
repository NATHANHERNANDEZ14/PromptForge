/**
 * EmptyState — Estado vacío genérico
 * Props:
 *   - icon: ReactNode
 *   - title: string
 *   - description: string
 *   - action: ReactNode (botón opcional)
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center',
      gap: '0.75rem'
    }}>
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', marginBottom: '0.25rem'
        }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}
