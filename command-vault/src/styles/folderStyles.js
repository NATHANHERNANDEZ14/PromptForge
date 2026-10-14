export const FolderStyles = {
  notFoundCard: {
    padding: '3rem',
    textAlign: 'center',
    borderRadius: '1rem',
    marginTop: '2rem'
  },
  notFoundText: {
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
    marginBottom: '1.5rem'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    color: 'var(--text-muted)'
  },
  backButton: {
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer'
  },
  breadcrumbLink: {
    color: 'inherit',
    textDecoration: 'none'
  },
  breadcrumbCurrent: {
    color: 'var(--text-main)',
    fontWeight: 600
  },
  card: {
    padding: '2rem',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  folderBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: 'var(--primary)'
  },
  categoryBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--primary)',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  titleLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  titleInput: {
    fontSize: '1.4rem',
    fontWeight: 'bold'
  },
  titleView: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-main)'
  },
  videoRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  videoInputContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  videoLinkDisplay: (hasLink) => ({
    flex: 1,
    color: hasLink ? 'var(--text-main)' : 'var(--text-muted)',
    overflowWrap: 'anywhere'
  }),
  openLinkButton: (hasLink, isEditing) => ({
    opacity: hasLink ? 1 : 0.4,
    pointerEvents: hasLink ? 'auto' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    height: '42px',
    marginTop: isEditing ? '1.5rem' : 0
  }),
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '1rem'
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.4rem'
  },
  selectOption: {
    background: '#1e293b'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--primary)'
  },
  commandCount: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  sectionSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginBottom: '1.25rem'
  },
  commandsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  emptyCommands: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    borderRadius: '0.5rem'
  },
  commandCard: {
    padding: '1.25rem',
    borderRadius: '0.75rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  commandBadge: {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.15)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0
  },
  commandFieldsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  commandLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '0.35rem',
    fontWeight: 600
  },
  commandPre: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0
  },
  commandPurpose: (hasPurpose) => ({
    height: 'auto',
    minHeight: '75px',
    color: hasPurpose ? 'var(--text-main)' : 'var(--text-muted)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }),
  commandActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  copyButton: (isCopied) => ({
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    color: isCopied ? 'var(--success)' : 'inherit'
  }),
  deleteButton: {
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--danger)'
  },
  addCommandButton: {
    marginTop: '1rem',
    color: 'var(--primary)',
    border: '1px dashed var(--primary)',
    width: '100%',
    padding: '0.75rem',
    justifyContent: 'center'
  },
  globalDescriptionLabel: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.5rem'
  },
  globalDescriptionView: {
    minHeight: '100px',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5
  },
  actionFooter: {
    display: 'flex',
    gap: '1rem',
    borderTop: '1px solid var(--card-border)',
    paddingTop: '1.5rem',
    flexWrap: 'wrap'
  },
  pdfActionButton: (loading) => ({
    border: '1px solid var(--card-border)',
    opacity: loading ? 0.6 : 1
  }),
  loadingOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  },
  loadingCard: {
    padding: '2rem 3rem',
    borderRadius: '1rem',
    textAlign: 'center'
  },
  loadingSpinner: {
    color: 'var(--primary)',
    margin: '0 auto 1rem'
  },
  loadingTitle: {
    fontWeight: 600,
    fontSize: '1rem'
  },
  loadingSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem'
  },
  modalContent: {
    width: '90%',
    height: '90vh',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-main)',
    fontWeight: 700
  },
  pdfIframe: {
    width: '100%',
    flex: 1,
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: '#fff'
  }
};

export default FolderStyles;
