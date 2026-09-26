const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export type RegisterFieldName =
  | 'company_name'
  | 'inn'
  | 'company_id'
  | 'department_id'
  | 'full_name'
  | 'email'
  | 'password'
  | 'password_confirmation'
  | 'agreement'

export type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>

export class RegistrationApiError extends Error {
  fieldErrors: RegisterFieldErrors

  constructor(message: string, fieldErrors: RegisterFieldErrors = {}) {
    super(message)
    this.name = 'RegistrationApiError'
    this.fieldErrors = fieldErrors
  }
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    full_name: string
    role: string
  }
  company?: {
    id: string
    name: string
    inn?: string
  }
}

export interface CompanyRegistrationData {
  company: {
    name: string
    inn?: string
    description?: string
  }
  owner: {
    full_name: string
    email: string
    password: string
  }
}

export interface EmployeeRegistrationData {
  employee: {
    full_name: string
    email: string
    password: string
  }
  company_id: string
  department_id?: string
}

const backendPathToField: Record<string, RegisterFieldName> = {
  'company.name': 'company_name',
  'company.inn': 'inn',
  'owner.full_name': 'full_name',
  'owner.email': 'email',
  'owner.password': 'password',
  'employee.full_name': 'full_name',
  'employee.email': 'email',
  'employee.password': 'password',
  company_id: 'company_id',
  department_id: 'department_id',
}

function cleanValidationMessage(message: string) {
  return message.replace(/^Value error,\s*/i, '')
}

function parseFieldErrors(detail: unknown): RegisterFieldErrors {
  if (!Array.isArray(detail)) {
    return {}
  }

  return detail.reduce<RegisterFieldErrors>((errors, item) => {
    if (!item || typeof item !== 'object') {
      return errors
    }

    const location = Array.isArray(item.loc)
      ? item.loc.filter((part: unknown) => part !== 'body').join('.')
      : ''
    const field = backendPathToField[location]

    if (field && typeof item.msg === 'string' && !errors[field]) {
      errors[field] = cleanValidationMessage(item.msg)
    }

    return errors
  }, {})
}

function inferFieldError(detail: unknown): RegisterFieldErrors {
  if (typeof detail !== 'string') {
    return {}
  }

  const message = detail.toLowerCase()

  if (message.includes('email')) {
    return { email: detail }
  }
  if (message.includes('company_id') || message.includes('компания не найдена')) {
    return { company_id: detail }
  }
  if (message.includes('department_id') || message.includes('отдел')) {
    return { department_id: detail }
  }

  return {}
}

async function postRegistration<T>(
  path: string,
  data: T,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = result?.detail
    const fieldErrors = Array.isArray(detail)
      ? parseFieldErrors(detail)
      : inferFieldError(detail)
    const message = Array.isArray(detail)
      ? detail
          .map((item) =>
            typeof item?.msg === 'string'
              ? cleanValidationMessage(item.msg)
              : '',
          )
          .filter(Boolean)
          .join('. ')
      : detail

    throw new RegistrationApiError(
      message || 'Не удалось выполнить регистрацию',
      fieldErrors,
    )
  }

  return result as RegisterResponse
}

export function registerCompany(data: CompanyRegistrationData) {
  return postRegistration('/api/v1/register/company', data)
}

export function registerEmployee(data: EmployeeRegistrationData) {
  return postRegistration('/api/v1/register/employee', data)
}
