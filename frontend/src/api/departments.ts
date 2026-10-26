import { getAuthToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export interface DepartmentDto {
  id: string
  company_id: string
  parent_id: string | null
  name: string
  description: string | null
}

export interface DepartmentPayload {
  name: string
  description?: string | null
  parent_id?: string | null
}

export class DepartmentApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DepartmentApiError'
  }
}

function authHeaders() {
  const token = getAuthToken()

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function readError(response: Response) {
  const result = await response.json().catch(() => null)
  const detail = result?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item?.msg === 'string' ? item.msg : ''))
      .filter(Boolean)

    if (messages.length > 0) {
      return messages.join('. ')
    }
  }

  if (response.status === 401) {
    return 'Нужно войти в аккаунт'
  }

  if (response.status === 403) {
    return 'Недостаточно прав для управления отделами'
  }

  return 'Не удалось выполнить запрос к отделам'
}

function departmentsUrl(companyId: string) {
  return `${API_BASE_URL}/api/v1/companies/${companyId}/departments/`
}

function departmentUrl(companyId: string, departmentId: string) {
  return `${API_BASE_URL}/api/v1/companies/${companyId}/departments/${departmentId}`
}

export async function createDepartment(
  companyId: string,
  payload: DepartmentPayload,
): Promise<DepartmentDto> {
  const response = await fetch(departmentsUrl(companyId), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new DepartmentApiError(await readError(response))
  }

  return (await response.json()) as DepartmentDto
}

export async function updateDepartment(
  companyId: string,
  departmentId: string,
  payload: DepartmentPayload,
): Promise<DepartmentDto> {
  const response = await fetch(departmentUrl(companyId, departmentId), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new DepartmentApiError(await readError(response))
  }

  return (await response.json()) as DepartmentDto
}

export async function deleteDepartment(
  companyId: string,
  departmentId: string,
) {
  const response = await fetch(departmentUrl(companyId, departmentId), {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok && response.status !== 204) {
    throw new DepartmentApiError(await readError(response))
  }
}
