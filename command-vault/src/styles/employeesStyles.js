/**
 * EmployeesStyles — Constantes semánticas de estilos para el módulo de Empleados
 */
export const EmployeesStyles = {
  restrictedCard: {
    padding: '3rem',
    textAlign: 'center',
    borderRadius: 'var(--radius-lg)',
    marginTop: '2rem'
  },
  restrictedIcon: {
    color: 'var(--danger)',
    margin: '0 auto 1rem'
  },
  restrictedTitle: {
    fontSize: '1.5rem'
  },
  restrictedText: {
    color: 'var(--text-muted)',
    marginTop: '0.5rem'
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '0.35rem'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  refreshButton: {
    padding: '0.6rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  statCard: {
    padding: '1.25rem 1.5rem',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statIconBox: (color = 'var(--primary)') => ({
    width: 42,
    height: 42,
    borderRadius: 'var(--radius-md)',
    background: `${color}18`,
    border: `1px solid ${color}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    flexShrink: 0
  }),
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    lineHeight: 1,
    color: 'var(--text-main)'
  },
  statLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
    fontWeight: 500
  },
  filterBar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    flex: '1 1 240px'
  },
  searchInput: {
    paddingLeft: '2.75rem'
  },
  deptFilterWrapper: {
    position: 'relative',
    minWidth: 180
  },
  deptFilterIcon: {
    position: 'absolute',
    left: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none'
  },
  deptFilterSelect: {
    paddingLeft: '2.5rem',
    paddingRight: '2rem',
    appearance: 'none'
  },
  deptFilterChevron: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none'
  },
  selectOption: {
    background: '#0f172a'
  },
  tableCard: {
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden'
  },
  tableScroll: {
    overflowX: 'auto'
  },
  table: {
    minWidth: 640
  },
  loadingCell: {
    textAlign: 'center',
    padding: '3rem'
  },
  loadingSpinner: {
    animation: 'spin 1s linear infinite',
    color: 'var(--primary)',
    display: 'inline-block'
  },
  nominaBadge: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: 600,
    background: 'var(--primary-dim)',
    padding: '0.2rem 0.6rem',
    borderRadius: 'var(--radius-xs)'
  },
  employeeRowInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  employeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-sm)',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.8rem',
    flexShrink: 0
  },
  employeeName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--text-main)'
  },
  statusText: (activo) => ({
    color: activo ? 'var(--success)' : 'var(--text-muted)'
  }),
  actionsGroup: {
    display: 'flex',
    gap: '0.3rem',
    justifyContent: 'flex-end'
  },
  tableFooter: {
    padding: '0.75rem 1.5rem',
    borderTop: '1px solid var(--card-border)',
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  // Modal styles
  modalFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  deptHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem'
  },
  deptLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  newDeptBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  fieldError: {
    color: 'var(--danger)',
    fontSize: '0.75rem',
    marginTop: '0.25rem'
  },
  activeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--card-border)'
  },
  activeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    userSelect: 'none'
  },
  activeCheckbox: {
    width: 16,
    height: 16,
    accentColor: 'var(--success)',
    cursor: 'pointer'
  },
  activeStatusText: (activo) => ({
    color: activo ? 'var(--success)' : 'var(--text-muted)',
    fontWeight: 600
  }),
  modalFormBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  modalFooter: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end'
  }
};

export default EmployeesStyles;
