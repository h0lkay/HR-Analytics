import type { DepartmentDto } from '../api/departments'
import type { DepartmentRow } from './dashboardStorage'

export type Tab = 'structure' | 'courses'
export type StructureView = 'chart' | 'table'

export const roleLabels: Record<string, string> = {
  owner: 'Владелец',
  hr: 'HR',
  admin: 'Администратор',
  employee: 'Сотрудник',
}

export function createId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toDateInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

export function defaultDeadline() {
  const date = new Date()
  date.setDate(date.getDate() + 30)

  return toDateInputValue(date)
}

export function formatDeadline(value: string) {
  const [year, month, day] = value.split('-')

  return `${day}.${month}.${year}`
}

export function plural(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few
  }

  return many
}

export function collectDescendantIds(departments: DepartmentRow[], id: string) {
  const found = new Set<string>()
  const queue = [id]

  while (queue.length > 0) {
    const current = queue.pop()

    if (current === undefined) {
      break
    }

    departments.forEach((department) => {
      if (department.parentId === current && !found.has(department.id)) {
        found.add(department.id)
        queue.push(department.id)
      }
    })
  }

  return found
}

export function toDepartmentRow(
  dto: DepartmentDto,
  previous?: DepartmentRow,
): DepartmentRow {
  return {
    id: dto.id,
    name: dto.name,
    head: dto.description?.trim() || previous?.head || '—',
    employees: previous?.employees ?? 0,
    parentId: dto.parent_id,
  }
}

export function deleteOrder(departments: DepartmentRow[], rootId: string) {
  const ids = [...collectDescendantIds(departments, rootId), rootId]
  const remaining = new Set(ids)
  const byId = new Map(
    departments.map((department) => [department.id, department]),
  )
  const ordered: string[] = []

  while (remaining.size > 0) {
    const leaves = [...remaining].filter(
      (id) =>
        ![...remaining].some((other) => byId.get(other)?.parentId === id),
    )

    if (leaves.length === 0) {
      ordered.push(...remaining)
      break
    }

    leaves.forEach((id) => {
      ordered.push(id)
      remaining.delete(id)
    })
  }

  return ordered
}
