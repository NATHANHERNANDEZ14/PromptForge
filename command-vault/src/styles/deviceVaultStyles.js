/**
 * DeviceVaultStyles — Constantes semánticas de estilos para el módulo de Almacén de Dispositivos
 */
export const DeviceVaultStyles = {

  // ── Header ─────────────────────────────────────────────────────────────────
  pageHeader: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    marginBottom: '0.4rem',
    background: 'var(--primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
  },
  exportButtonsRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  exportButton: {
    border: '1px solid var(--card-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
  },
  excelIcon: {
    color: '#10b981',
  },
  pdfIcon: {
    color: '#3b82f6',
  },

  // ── Stats grid ─────────────────────────────────────────────────────────────
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    padding: '1rem 1.25rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },

  // ── View-mode tabs ─────────────────────────────────────────────────────────
  tabBar: {
    display: 'flex',
    gap: '0',
    marginBottom: '1.5rem',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '0.75rem',
    padding: '0.3rem',
    width: 'fit-content',
  },
  tab: (active) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  tabBadge: (active) => ({
    fontSize: '0.7rem',
    fontWeight: 800,
    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
    color: active ? 'white' : 'var(--text-muted)',
    borderRadius: '1rem',
    padding: '0.1rem 0.5rem',
    minWidth: 20,
    textAlign: 'center',
  }),

  // ── Toolbar ────────────────────────────────────────────────────────────────
  toolbar: {
    padding: '1.25rem',
    borderRadius: '1rem',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    minWidth: '220px',
  },
  filtersRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterSelect: {
    width: 'auto',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    borderRadius: '0.5rem',
  },
  filterChipsRow: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  filterChip: (active) => ({
    padding: '0.4rem 0.85rem',
    borderRadius: '2rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
    color: active ? 'white' : 'var(--text-muted)',
  }),
  registerButton: {
    whiteSpace: 'nowrap',
  },

  // ── Device grid ────────────────────────────────────────────────────────────
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: '1.25rem',
  },

  // ── Loading / Empty ────────────────────────────────────────────────────────
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem',
    color: 'var(--text-muted)',
  },
  emptyCard: {
    padding: '4rem',
    textAlign: 'center',
    borderRadius: '1rem',
    color: 'var(--text-muted)',
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  emptyRegisterButton: {
    marginTop: '1.5rem',
  },

  // ── Device Card ────────────────────────────────────────────────────────────
  deviceCard: {
    borderRadius: '1rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  deviceCardAccent: (color) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: color,
    borderRadius: '1rem 1rem 0 0',
    opacity: 0.9,
  }),
  deviceCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceCardTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  deviceTypeIcon: (bg, color) => ({
    width: 42,
    height: 42,
    borderRadius: '0.6rem',
    background: bg,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  deviceName: {
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: 1.2,
    marginBottom: '0.25rem',
  },
  badgesRow: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: (bg, color) => ({
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '1rem',
    background: bg,
    color,
  }),
  areaBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.08)',
    color: 'var(--text-main)',
  },
  deviceActions: {
    display: 'flex',
    gap: '0.25rem',
  },
  iconButton: {
    padding: '0.4rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.4rem',
  },
  dangerIconButton: {
    padding: '0.4rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.4rem',
    color: 'var(--danger)',
  },

  // ── Device Field Row ───────────────────────────────────────────────────────
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
  },
  fieldIcon: {
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  fieldLabel: {
    color: 'var(--text-muted)',
    fontWeight: 600,
    width: '85px',
    flexShrink: 0,
  },
  fieldValue: (isCode) => ({
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--text-main)',
    fontSize: isCode ? '0.78rem' : '0.82rem',
  }),
  copyButton: (copied) => ({
    padding: '0.2rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    color: copied ? 'var(--success)' : 'var(--text-muted)',
    flexShrink: 0,
  }),
  fieldsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },

  // ── Password row in device card ────────────────────────────────────────────
  passwordRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.25)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--card-border)',
  },
  passwordLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flex: 1,
    overflow: 'hidden',
  },
  passwordLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  passwordValue: (show) => ({
    fontSize: show ? '0.85rem' : '1.1rem',
    letterSpacing: show ? 0 : '0.18em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: show ? 700 : 'normal',
  }),
  noPasswordText: {
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    fontSize: '0.75rem',
  },
  passwordActions: {
    display: 'flex',
    gap: '0.25rem',
    flexShrink: 0,
  },
  passwordActionBtn: {
    padding: '0.3rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.3rem',
  },
  rdPackButton: (copied) => ({
    padding: '0.3rem 0.5rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.3rem',
    color: copied ? 'var(--success)' : 'var(--primary)',
    fontWeight: 700,
    fontSize: '0.7rem',
  }),

  // ── Card footer ────────────────────────────────────────────────────────────
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '0.5rem',
  },
  assignedBadge: (hasUser) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '0.2rem 0.6rem',
    borderRadius: '1rem',
    background: hasUser ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)',
    color: hasUser ? 'var(--primary)' : 'var(--success)',
  }),
  assignedDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'currentColor',
    flexShrink: 0,
  },
  dateText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  notesText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
    margin: 0,
  },

  // ── RustDesk badge ─────────────────────────────────────────────────────────
  rustDeskBadge: {
    fontSize: '0.72rem',
    fontWeight: 800,
    color: 'var(--primary)',
  },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalContent: {
    width: '680px',
    maxWidth: '96vw',
    maxHeight: '92vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: 800,
  },
  modalSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    margin: '0.2rem 0 0 0',
  },
  modalCloseButton: {
    border: 'none',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '50%',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  fullSpan: {
    gridColumn: '1 / -1',
  },
  selectOption: {
    background: '#1e293b',
  },
  areaHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  newAreaButton: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  },

  // ── Employee Picker ────────────────────────────────────────────────────────
  empPickerWrapper: {
    position: 'relative',
  },
  empSelectedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 0.75rem',
    minHeight: '42px',
  },
  empSelectedText: {
    flex: 1,
    minWidth: 0,
  },
  empSelectedName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  empSelectedNomina: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  empClearButton: {
    width: 24,
    height: 24,
    border: 'none',
    flexShrink: 0,
  },
  empTriggerButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.65rem 1rem',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
  empTriggerFlex: {
    flex: 1,
  },
  empDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#0f172a',
    border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
    maxHeight: 240,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  empSearchWrapper: {
    padding: '0.5rem',
    borderBottom: '1px solid var(--card-border)',
  },
  empSearchInput: {
    padding: '0.45rem 0.75rem',
    fontSize: '0.8rem',
  },
  empListScroll: {
    overflowY: 'auto',
    maxHeight: 185,
  },
  empEmpty: {
    padding: '1rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  empRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.6rem 0.875rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.1s',
  },
  empAvatar: {
    width: 28,
    height: 28,
    borderRadius: '6px',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.75rem',
    flexShrink: 0,
  },
  empInfo: {
    minWidth: 0,
  },
  empName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  empNomina: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },

  // ── Password section in modal form ─────────────────────────────────────────
  passwordFieldHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  encryptedLabel: {
    fontSize: '0.7rem',
    color: 'var(--success)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  passwordInputRow: {
    display: 'flex',
    gap: '0.4rem',
    alignItems: 'center',
  },
  passwordInputWrapper: {
    position: 'relative',
    flex: 1,
  },
  passwordInput: {
    paddingRight: '2.5rem',
  },
  passwordToggle: {
    position: 'absolute',
    right: '0.4rem',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  generateButton: {
    whiteSpace: 'nowrap',
    flexShrink: 0,
    gap: '0.3rem',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
  },
  nominaInput: (locked) => ({
    opacity: locked ? 0.7 : 1,
  }),

  // ── Form Footer ────────────────────────────────────────────────────────────
  formFooter: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--card-border)',
    paddingTop: '1rem',
  },
};

export default DeviceVaultStyles;
