/**
 * DashboardStyles — Constantes semánticas de estilos para el Dashboard principal (carpetas y flujos)
 */
export const DashboardStyles = {

  // ── Page hero ──────────────────────────────────────────────────────────────
  heroSection: {
    marginBottom: '2.5rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
    background: 'var(--primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
  heroSubtitle: {
    color: 'var(--text-muted)',
  },

  // ── Main bar (search + filters) ────────────────────────────────────────────
  mainBar: {
    padding: '1.5rem',
    borderRadius: '1rem',
    marginBottom: '1.5rem',
  },
  searchBarContainer: {
    marginBottom: '1.25rem',
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  // ── Category filters ───────────────────────────────────────────────────────
  categoryBar: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  categoryLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginRight: '0.25rem',
  },
  categoryButton: (active) => ({
    fontSize: '0.8rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '1rem',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
  }),

  // ── Action buttons bar ─────────────────────────────────────────────────────
  actionsBar: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--card-border)',
  },
  leftActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  importButton: {
    fontSize: '0.85rem',
  },

  // ── Loading / empty states ─────────────────────────────────────────────────
  loadingCard: {
    padding: '4rem',
    textAlign: 'center',
    borderRadius: '1rem',
    color: 'var(--text-muted)',
  },
  emptyCard: {
    padding: '3.5rem',
    textAlign: 'center',
    borderRadius: '1rem',
    color: 'var(--text-muted)',
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '0.5rem',
  },
  emptyText: {
    maxWidth: '400px',
    margin: '0 auto 1.5rem',
    fontSize: '0.9rem',
  },

  // ── Folder card ────────────────────────────────────────────────────────────
  folderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  folderCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  folderIconBox: {
    width: 42,
    height: 42,
    borderRadius: '0.75rem',
    background: 'rgba(59, 130, 246, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  categoryBadge: {
    fontSize: '0.72rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--text-muted)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  // ── Context menu ───────────────────────────────────────────────────────────
  menuWrapper: {
    position: 'relative',
  },
  menuTrigger: {
    padding: '0.35rem',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
  },
  contextMenu: {
    position: 'absolute',
    right: 0,
    top: '100%',
    zIndex: 20,
    borderRadius: '0.5rem',
    padding: '0.5rem',
    minWidth: '160px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    boxShadow: 'var(--shadow-lg)',
  },
  menuItem: {
    textAlign: 'left',
    padding: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  menuItemDanger: {
    textAlign: 'left',
    padding: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--danger)',
    borderRadius: '0.25rem',
  },
  menuDivider: {
    borderColor: 'var(--card-border)',
    margin: '0.25rem 0',
  },

  // ── Folder card body ───────────────────────────────────────────────────────
  folderCardBody: {
    flex: 1,
    marginTop: '0.5rem',
  },
  folderName: {
    fontSize: '1.15rem',
    fontWeight: 700,
    marginBottom: '0.35rem',
    color: 'var(--text-main)',
  },
  folderTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  tagsRow: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  tagChip: {
    fontSize: '0.68rem',
    padding: '0.15rem 0.45rem',
    borderRadius: '0.4rem',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--primary)',
  },

  // ── Folder card footer ─────────────────────────────────────────────────────
  folderCardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  folderMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  folderButtonsRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  pdfButton: {
    flex: 1,
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
  },
  openButton: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
  },

  // ── Create / Edit modal ────────────────────────────────────────────────────
  modalTitle: {
    marginBottom: '1.5rem',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  modalFormBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  fieldLabel: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  selectOption: {
    background: '#1e293b',
    color: 'white',
  },
  modalFooter: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
};

export default DashboardStyles;
