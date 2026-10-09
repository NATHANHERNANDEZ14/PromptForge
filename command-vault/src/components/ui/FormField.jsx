/**
 * FormField — Campo de formulario genérico con label y mensaje de error
 * Props:
 *   - label: string
 *   - id: string (para a11y)
 *   - error: string | null
 *   - required: boolean
 *   - icon: ReactNode (icono del input field, opcional)
 *   - children: ReactNode (el input, select, etc.)
 */
export default function FormField({ label, id, error, required, icon, children, hint }) {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className={`form-input-wrapper${icon ? ' has-icon' : ''}`}>
        {icon && <span className="form-icon" aria-hidden="true">{icon}</span>}
        {children}
      </div>

      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
}
