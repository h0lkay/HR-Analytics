import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { PasswordField, TextField } from './FormFields'

interface LoginFieldErrors {
  email?: string
  password?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})

  useEffect(() => {
    document.title = 'Вход — HR Analytics'
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const errors: LoginFieldErrors = {}

    if (!email) {
      errors.email = 'Введите электронную почту'
    } else if (!emailPattern.test(email)) {
      errors.email = 'Введите корректный адрес электронной почты'
    }

    if (!password) {
      errors.password = 'Введите пароль'
    } else if (password.length < 10) {
      errors.password = 'Пароль должен содержать минимум 10 символов'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setMessage(
      'Форма готова. Для входа необходимо добавить endpoint авторизации на бэкенде.',
    )
  }

  const clearFieldError = (field: keyof LoginFieldErrors) => {
    setMessage('')
    setFieldErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  return (
    <AuthLayout
      eyebrow="Вход в систему"
      title="С возвращением"
      description="Введите данные, указанные при регистрации."
      footer={
        <p>
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      }
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <TextField
          id="login-email"
          name="email"
          type="email"
          label="Электронная почта"
          placeholder="name@company.ru"
          autoComplete="email"
          error={fieldErrors.email}
          onChange={() => clearFieldError('email')}
          required
        />
        <PasswordField
          id="login-password"
          name="password"
          label="Пароль"
          placeholder="Введите пароль"
          autoComplete="current-password"
          error={fieldErrors.password}
          onChange={() => clearFieldError('password')}
          required
        />

        <div className="form-options">
          <label>
            <input type="checkbox" name="remember" />
            <span>Запомнить меня</span>
          </label>
          <a href="mailto:hr-analytics@example.com">Забыли пароль?</a>
        </div>

        {message && (
          <div className="form-notice" role="status">
            {message}
          </div>
        )}

        <button className="submit-button" type="submit">
          Войти <ArrowRight size={18} />
        </button>
      </form>
    </AuthLayout>
  )
}
