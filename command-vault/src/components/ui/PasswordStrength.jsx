import { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';

/**
 * Evalúa la fortaleza de una contraseña
 * Retorna: { score: 0-4, label, color, percent }
 */
export function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent', percent: 0 };

  let score = 0;
  const checks = {
    length:     password.length >= 8,
    longEnough: password.length >= 12,
    uppercase:  /[A-Z]/.test(password),
    lowercase:  /[a-z]/.test(password),
    number:     /\d/.test(password),
    special:    /[^a-zA-Z0-9]/.test(password)
  };

  if (checks.length)                        score++;
  if (checks.longEnough)                    score++;
  if (checks.uppercase && checks.lowercase) score++;
  if (checks.number)                        score++;
  if (checks.special)                       score++;

  const levels = [
    { label: '',           color: 'transparent', percent: 0   },
    { label: 'Muy débil',  color: '#ef4444',     percent: 20  },
    { label: 'Débil',      color: '#f97316',     percent: 40  },
    { label: 'Regular',    color: '#eab308',     percent: 60  },
    { label: 'Fuerte',     color: '#22c55e',     percent: 80  },
    { label: 'Muy fuerte', color: '#10b981',     percent: 100 },
  ];

  const capped = Math.min(score, 5);
  return { score: capped, checks, ...levels[capped] };
}

/**
 * PasswordStrength — Barra visual de fortaleza de contraseña
 * Props:
 *   - password: string
 */
export default function PasswordStrength({ password }) {
  const result = useMemo(() => evaluatePasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Barra de progreso */}
      <div style={{
        height: '3px', borderRadius: '99px',
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden', marginBottom: '0.5rem'
      }}>
        <div style={{
          height: '100%',
          width: `${result.percent}%`,
          background: result.color,
          borderRadius: '99px',
          transition: 'width 0.35s ease, background 0.35s ease'
        }} />
      </div>

      {/* Etiqueta */}
      {result.label && (
        <span style={{ fontSize: '0.72rem', color: result.color, fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          {result.label}
        </span>
      )}

      {/* Requisitos con íconos Lucide */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        <Req met={result.checks?.length}    label="8+ caracteres" />
        <Req met={result.checks?.uppercase} label="Mayúscula" />
        <Req met={result.checks?.lowercase} label="Minúscula" />
        <Req met={result.checks?.number}    label="Número" />
        <Req met={result.checks?.special}   label="Símbolo" />
      </div>
    </div>
  );
}

function Req({ met, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '99px',
      background: met ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
      color: met ? '#4ade80' : '#475569',
      border: `1px solid ${met ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)'}`,
      transition: 'all 0.25s ease'
    }}>
      {met
        ? <Check size={10} strokeWidth={3} />
        : <Circle size={9} strokeWidth={1.5} />
      }
      {label}
    </span>
  );
}
