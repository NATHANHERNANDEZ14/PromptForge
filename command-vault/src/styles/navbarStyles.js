/**
 * NavbarStyles — Constantes semánticas de estilos para la barra de navegación principal
 */
export const NavbarStyles = {
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flex: '0 0 auto'
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: 'var(--primary)',
    fontWeight: 800,
    fontSize: '1.05rem',
    letterSpacing: '0.06em',
    textDecoration: 'none'
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--primary-dim)',
    border: '1px solid rgba(58,134,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  linksGroup: {
    display: 'flex',
    gap: '0.25rem'
  },
  navLink: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.875rem',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: '0.845rem',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    background: active ? 'rgba(58,134,255,0.12)' : 'transparent',
    border: `1px solid ${active ? 'rgba(58,134,255,0.25)' : 'transparent'}`,
    transition: 'var(--transition-fast)'
  }),
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '0 0 auto'
  },
  notifBtnWrapper: {
    position: 'relative'
  },
  notifButton: (showNotifs) => ({
    width: 38,
    height: 38,
    border: '1px solid var(--card-border)',
    color: showNotifs ? 'var(--primary)' : 'var(--text-muted)',
    background: showNotifs ? 'var(--primary-dim)' : 'transparent',
    position: 'relative'
  }),
  notifBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    background: 'var(--danger)',
    width: 7,
    height: 7,
    borderRadius: '50%',
    border: '1.5px solid var(--bg-color)'
  },
  divider: {
    width: 1,
    height: 22,
    background: 'var(--card-border)'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--card-border)',
    background: 'rgba(255,255,255,0.03)'
  },
  userAvatar: {
    width: 28,
    height: 28,
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
  userName: {
    fontSize: '0.845rem',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  logoutButton: {
    width: 38,
    height: 38,
    border: '1px solid var(--card-border)',
    color: 'var(--text-muted)'
  },
  panelBadge: {
    fontSize: '0.65rem'
  },
  panelActions: {
    display: 'flex',
    gap: '0.25rem',
    alignItems: 'center'
  },
  panelClearBtn: {
    width: 28,
    height: 28,
    border: 'none',
    color: 'var(--text-muted)'
  },
  panelCloseBtn: {
    width: 28,
    height: 28,
    border: 'none',
    color: 'var(--text-muted)'
  }
};

export default NavbarStyles;
