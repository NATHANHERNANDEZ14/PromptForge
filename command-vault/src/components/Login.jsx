import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, User, Lock } from 'lucide-react';
import { showError } from '../utils/alerts';
import FormField from './ui/FormField';
import PasswordField from './ui/PasswordField';
import { LoginStyles } from '../styles/loginStyles';

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
    <div className="app-container" style={LoginStyles.wrapper}>
      <div className="glass animate-fade-in" style={LoginStyles.card}>

        {/* ── Logo / Cabecera ── */}
        <div style={LoginStyles.header}>
          <div style={LoginStyles.logoIconContainer}>
            <Terminal size={34} />
          </div>
          <h1 style={LoginStyles.title}>
            COMMAND VAULT
          </h1>
          <p style={LoginStyles.subtitle}>
            Gestión centralizada de flujos y equipos
          </p>
        </div>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} noValidate style={LoginStyles.form}>

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
              style={LoginStyles.input}
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
            <div style={LoginStyles.errorMessage}>
              {errors.form}
            </div>
          )}

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={LoginStyles.submitButton}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin" style={LoginStyles.spinner} />
                Verificando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* ── Footer de seguridad ── */}
        <p style={LoginStyles.footer}>
          <Lock size={12} style={LoginStyles.footerIcon} />
          Acceso protegido — Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
