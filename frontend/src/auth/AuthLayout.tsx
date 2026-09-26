import type { ReactNode } from 'react'
import { ArrowLeft, LineChart } from 'lucide-react'
import './Auth.css'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <a className="auth-logo" href="/" aria-label="HR Analytics — на главную">
          <span>
            <LineChart size={19} />
          </span>
          HR Analytics
        </a>
        <a className="back-link" href="/">
          <ArrowLeft size={16} />
          На главную
        </a>
      </header>

      <section className="auth-container">
        <div className="auth-card">
          <div className="auth-card-heading">
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {children}

          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  )
}
