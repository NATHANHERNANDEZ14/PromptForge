import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

/**
 * PasswordField — Input de contraseña con toggle de visibilidad
 * Props:
 *   - id: string
 *   - value: string
 *   - onChange: (e) => void
 *   - placeholder: string
 *   - required: boolean
 *   - autoComplete: string
 */
export default function PasswordField({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  autoComplete = 'current-password',
  minLength,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        className="input-field"
        style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        {...rest}
      />
      {/* Icono izquierdo */}
      <Lock
        size={16}
        style={{
          position: 'absolute', left: '0.85rem', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}
      />
      {/* Toggle visibilidad */}
      <button
        type="button"
        onClick={() => setShowPassword(v => !v)}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%',
          transform: 'translateY(-50%)', background: 'none',
          border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', display: 'flex',
          alignItems: 'center', padding: '0.15rem'
        }}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
