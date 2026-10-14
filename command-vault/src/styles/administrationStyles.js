export const AdministrationStyles = {

  // ── Restricted access ──────────────────────────────────────────────────────
  restrictedCard: {
    padding: '3rem',
    textAlign: 'center',
    borderRadius: '1rem',
    marginTop: '2rem',
  },
  restrictedIcon: {
    color: 'var(--danger)',
    margin: '0 auto 1rem',
  },
  restrictedTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  restrictedText: {
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },

  // ── Page header ────────────────────────────────────────────────────────────
  pageHeader: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.35rem',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },

  // ── Stats grid ─────────────────────────────────────────────────────────────
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    padding: '1rem 1.25rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statIcon: (color) => ({
    color: color || 'var(--primary)',
    opacity: 0.8,
  }),
  statValue: (color) => ({
    fontSize: '1.5rem',
    fontWeight: 800,
    color: color || 'var(--text-main)',
    lineHeight: 1,
  }),
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },

  // ── Table ──────────────────────────────────────────────────────────────────
  tableCard: {
    borderRadius: '1rem',
    overflow: 'hidden',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    minWidth: 640,
  },
  tdName: {
    padding: '0.875rem 1.25rem',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  selfBadge: {
    marginLeft: '0.5rem',
    fontSize: '0.65rem',
  },
  tdUsername: {
    padding: '0.875rem 1.25rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.85rem',
  },
  tdEmail: {
    padding: '0.875rem 1.25rem',
  },
  emailCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  noEmailText: {
    fontStyle: 'italic',
    opacity: 0.5,
  },
  tdBadge: {
    padding: '0.875rem 1.25rem',
  },
  tdStatus: {
    padding: '0.875rem 1.25rem',
  },
  tdActions: {
    display: 'flex',
    gap: '0.3rem',
    justifyContent: 'flex-end',
  },

  // ── Modal form ─────────────────────────────────────────────────────────────
  modalFormBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    marginBottom: '1.5rem',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  emailInput: {
    paddingLeft: '2.5rem',
  },
  selectOption: {
    background: '#1e293b',
  },

  // ── Modal footer ───────────────────────────────────────────────────────────
  modalFooter: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
};

export default AdministrationStyles;
