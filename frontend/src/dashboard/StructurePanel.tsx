import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import type { DepartmentRow } from './dashboardStorage'
import type { StructureView } from './dashboardUtils'
import { OrganizationChart } from './OrganizationChart'

interface StructurePanelProps {
  departments: DepartmentRow[]
  companyName: string
  structureView: StructureView
  onStructureViewChange: (view: StructureView) => void
  isDepartmentFormOpen: boolean
  editingDepartment: DepartmentRow | null
  draftParentId: string | null
  parentOptions: DepartmentRow[]
  departmentError: string
  isDepartmentSaving: boolean
  busyDepartmentId: string | null
  onToggleCreate: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onAddChild: (department: DepartmentRow | null) => void
  onEdit: (department: DepartmentRow) => void
  onDelete: (department: DepartmentRow) => void
}

export function StructurePanel({
  departments,
  companyName,
  structureView,
  onStructureViewChange,
  isDepartmentFormOpen,
  editingDepartment,
  draftParentId,
  parentOptions,
  departmentError,
  isDepartmentSaving,
  busyDepartmentId,
  onToggleCreate,
  onSubmit,
  onCancel,
  onAddChild,
  onEdit,
  onDelete,
}: StructurePanelProps) {
  return (
    <>
      <div className="dashboard-panel-head">
        <div>
          <h2 id="panel-title">Организационная структура</h2>
          <p>Отделы, руководители и численность</p>
        </div>
        <div className="dashboard-panel-actions">
          <div
            className="dashboard-view-switch"
            role="group"
            aria-label="Вид структуры"
          >
            <button
              type="button"
              className={structureView === 'chart' ? 'is-active' : ''}
              onClick={() => onStructureViewChange('chart')}
            >
              Схема
            </button>
            <button
              type="button"
              className={structureView === 'table' ? 'is-active' : ''}
              onClick={() => onStructureViewChange('table')}
            >
              Таблица
            </button>
          </div>
          <button type="button" className="dashboard-btn" onClick={onToggleCreate}>
            <Plus size={16} />
            Добавить отдел
          </button>
        </div>
      </div>

      {departmentError && !isDepartmentFormOpen && (
        <p className="dashboard-form-error" role="alert">
          {departmentError}
        </p>
      )}

      {isDepartmentFormOpen && (
        <form
          id="department-form"
          key={editingDepartment?.id ?? draftParentId ?? 'new'}
          className="dashboard-form"
          onSubmit={onSubmit}
          noValidate
        >
          {editingDepartment && (
            <p className="dashboard-form-title">
              Редактирование отдела «{editingDepartment.name}»
            </p>
          )}

          <div className="dashboard-form-row">
            <div className="dashboard-field">
              <label htmlFor="department-name">Название отдела</label>
              <input
                id="department-name"
                name="department_name"
                placeholder="Например, Аналитика"
                autoComplete="off"
                defaultValue={editingDepartment?.name ?? ''}
                autoFocus
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="department-head">Руководитель</label>
              <input
                id="department-head"
                name="department_head"
                placeholder="Иванов И.И."
                autoComplete="off"
                defaultValue={
                  !editingDepartment || editingDepartment.head === '—'
                    ? ''
                    : editingDepartment.head
                }
              />
            </div>
          </div>

          <div className="dashboard-field">
            <label htmlFor="department-parent">Родительский отдел</label>
            <select
              id="department-parent"
              name="department_parent"
              defaultValue={
                editingDepartment?.parentId ?? draftParentId ?? ''
              }
            >
              <option value="">Без родительского отдела</option>
              {parentOptions.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {departmentError && (
            <p className="dashboard-form-error" role="alert">
              {departmentError}
            </p>
          )}

          <div className="dashboard-form-actions">
            <button
              type="submit"
              className="dashboard-btn"
              disabled={isDepartmentSaving}
            >
              {editingDepartment
                ? isDepartmentSaving
                  ? 'Сохранение…'
                  : 'Сохранить'
                : isDepartmentSaving
                  ? 'Добавление…'
                  : 'Добавить отдел'}
            </button>
            <button
              type="button"
              className="dashboard-btn dashboard-btn--ghost"
              onClick={onCancel}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {structureView === 'chart' ? (
        <OrganizationChart
          departments={departments}
          companyName={companyName}
          busyId={busyDepartmentId}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Отдел</th>
                <th>Руководитель</th>
                <th>Сотрудников</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>
                    <strong>{dept.name}</strong>
                  </td>
                  <td>{dept.head}</td>
                  <td>
                    <Users
                      size={14}
                      style={{ verticalAlign: '-2px', marginRight: 4 }}
                    />
                    {dept.employees}
                  </td>
                  <td>
                    <div className="dashboard-table-actions">
                      <button
                        type="button"
                        className="dashboard-icon-btn"
                        aria-label={`Редактировать ${dept.name}`}
                        onClick={() => onEdit(dept)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="dashboard-icon-btn dashboard-icon-btn--danger"
                        aria-label={`Удалить ${dept.name}`}
                        disabled={busyDepartmentId === dept.id}
                        onClick={() => onDelete(dept)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
