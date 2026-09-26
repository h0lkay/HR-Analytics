import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function TextField({
  label,
  hint,
  error,
  id,
  required,
  ...props
}: FieldProps) {
  const messageId = `${id}-${error ? 'error' : 'hint'}`

  return (
    <label className={`form-field ${error ? 'form-field-invalid' : ''}`} htmlFor={id}>
      <span>
        {label}
        {required && <b aria-hidden="true">*</b>}
      </span>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        {...props}
      />
      {error ? (
        <small className="field-error" id={messageId}>
          {error}
        </small>
      ) : (
        hint && <small id={messageId}>{hint}</small>
      )}
    </label>
  )
}

export function PasswordField({
  label,
  hint,
  error,
  id,
  required,
  ...props
}: FieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const messageId = `${id}-${error ? 'error' : 'hint'}`

  return (
    <label className={`form-field ${error ? 'form-field-invalid' : ''}`} htmlFor={id}>
      <span>
        {label}
        {required && <b aria-hidden="true">*</b>}
      </span>
      <span className="password-input">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setIsVisible((value) => !value)}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error ? (
        <small className="field-error" id={messageId}>
          {error}
        </small>
      ) : (
        hint && <small id={messageId}>{hint}</small>
      )}
    </label>
  )
}
