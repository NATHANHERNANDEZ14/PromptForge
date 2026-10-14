/**
 * LoginStyles — Constantes semánticas de estilos para la pantalla de inicio de sesión
 */
export const LoginStyles = {
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem'
  },
  card: {
    padding: '2.75rem',
    borderRadius: '1.5rem',
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    boxShadow: 'var(--shadow-lg)'
  },
  header: {
    textAlign: 'center'
  },
  logoIconContainer: {
    display: 'inline-flex',
    padding: '1.1rem',
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.12)',
    color: 'var(--primary)',
    marginBottom: '1.1rem',
    border: '1.5px solid rgba(59,130,246,0.25)',
    boxShadow: '0 0 24px rgba(59,130,246,0.15)'
  },
  title: {
    fontSize: '1.85rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: 'var(--text-main)',
    margin: 0
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginTop: '0.4rem',
    fontSize: '0.875rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem'
  },
  input: {
    paddingLeft: '2.5rem'
  },
  errorMessage: {
    padding: '0.65rem 1rem',
    borderRadius: '0.5rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#f87171',
    fontSize: '0.82rem'
  },
  submitButton: {
    marginTop: '0.5rem',
    padding: '0.875rem',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%'
  },
  footer: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.72rem',
    margin: 0
  },
  footerIcon: {
    verticalAlign: 'middle',
    marginRight: '0.35rem'
  }
};

export default LoginStyles;
