import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, User, Lock } from 'lucide-react';
import { showError } from '../utils/alerts';
import FormField from './ui/FormField';
import PasswordField from './ui/PasswordField';

export default function Login() {
  const { login } = useAuth();
  const [username,      setUsername]      = useState('');
  const [password,      setPassword]      = useState('');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [errors,        setErrors]        = useState({});

  // ─── Validación cliente ─────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'El usuario es requerido.';
    if (!password)        e.password = 'La contraseña es requerida.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await login(username.trim(), password);
      if (!res.success) {
        showError('Acceso Denegado', res.error);
        // Limpiar contraseña por seguridad en error
        setPassword('');
        setErrors({ form: res.error });
      } else {
        window.dispatchEvent(new CustomEvent('cv:login_success'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field) => setErrors(prev => ({ ...prev, [field]: null, form: null }));

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass animate-fade-in" style={{
        padding: '2.75rem',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        boxShadow: 'var(--shadow-lg)'
      }}>

        {/* ── Logo / Cabecera ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', padding: '1.1rem', borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)',
            color: 'var(--primary)', marginBottom: '1.1rem',
            border: '1.5px solid rgba(59,130,246,0.25)',
            boxShadow: '0 0 24px rgba(59,130,246,0.15)'
          }}>
            <Terminal size={34} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-main)', margin: 0 }}>
            COMMAND VAULT
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.875rem' }}>
            Gestión centralizada de flujos y equipos
          </p>
        </div>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

          <FormField
            label="Usuario"
            id="login-username"
            required
            error={errors.username}
            icon={<User size={16} />}
          >
            <input
              id="login-username"
              type="text"
              className={`input-field${errors.username ? ' input-error' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Ingresa tu usuario..."
              value={username}
              onChange={e => { setUsername(e.target.value); clearFieldError('username'); }}
              autoFocus
              autoComplete="username"
              spellCheck={false}
            />
          </FormField>

          <FormField
            label="Contraseña"
            id="login-password"
            required
            error={errors.password}
          >
            <PasswordField
              id="login-password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </FormField>

          {/* Error general del servidor */}
          {errors.form && (
            <div style={{
              padding: '0.65rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              fontSize: '0.82rem'
            }}>
              {errors.form}
            </div>
          )}

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Verificando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* ── Footer de seguridad ── */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>
          <Lock size={12} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
          Acceso protegido — Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
