import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './Landing.tsx'
import LoginPage from './auth/LoginPage.tsx'
import RegisterPage from './auth/RegisterPage.tsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

const page =
  path === '/login' ? (
    <LoginPage />
  ) : path === '/register' ? (
    <RegisterPage />
  ) : (
    <Landing />
  )

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
