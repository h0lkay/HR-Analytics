import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import type { AssignmentRow, CourseRow, DepartmentRow } from './dashboardStorage'
import { defaultDeadline } from './dashboardUtils'

interface CoursesPanelProps {
  departments: DepartmentRow[]
  courseCatalog: CourseRow[]
  assignments: AssignmentRow[]
  activeCourseId: string
  selectedTargetId: string
  isCourseFormOpen: boolean
  courseError: string
  assignmentError: string
  onToggleCourseForm: () => void
  onAddCourse: (event: FormEvent<HTMLFormElement>) => void
  onCancelCourseForm: () => void
  onAssignCourse: (event: FormEvent<HTMLFormElement>) => void
  onCourseChange: (courseId: string) => void
  onTargetChange: (targetId: string) => void
}

export function CoursesPanel({
  departments,
  courseCatalog,
  assignments,
  activeCourseId,
  selectedTargetId,
  isCourseFormOpen,
  courseError,
  assignmentError,
  onToggleCourseForm,
  onAddCourse,
  onCancelCourseForm,
  onAssignCourse,
  onCourseChange,
  onTargetChange,
}: CoursesPanelProps) {
  return (
    <>
      <div className="dashboard-panel-head">
        <div>
          <h2 id="panel-title">Назначение курсов</h2>
          <p>Выберите курс и отдел или всю компанию</p>
        </div>
        <button
          type="button"
          className="dashboard-btn dashboard-btn--ghost"
          onClick={onToggleCourseForm}
        >
          <Plus size={16} />
          Новый курс
        </button>
      </div>

      {isCourseFormOpen && (
        <form className="dashboard-form" onSubmit={onAddCourse} noValidate>
          <div className="dashboard-form-row dashboard-form-row--single">
            <div className="dashboard-field">
              <label htmlFor="course-title">Название курса</label>
              <input
                id="course-title"
                name="course_title"
                placeholder="Например, Основы наставничества"
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          {courseError && (
            <p className="dashboard-form-error" role="alert">
              {courseError}
            </p>
          )}

          <div className="dashboard-form-actions">
            <button type="submit" className="dashboard-btn">
              Добавить в каталог
            </button>
            <button
              type="button"
              className="dashboard-btn dashboard-btn--ghost"
              onClick={onCancelCourseForm}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <form
        className="dashboard-assign"
        onSubmit={onAssignCourse}
        aria-label="Назначить курс"
      >
        <div className="dashboard-field">
          <label htmlFor="course-select">Курс</label>
          <select
            id="course-select"
            value={activeCourseId}
            onChange={(event) => onCourseChange(event.target.value)}
          >
            {courseCatalog.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="dashboard-field">
          <label htmlFor="target-select">Кому</label>
          <select
            id="target-select"
            value={selectedTargetId}
            onChange={(event) => onTargetChange(event.target.value)}
          >
            <option value="all">Вся компания</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="dashboard-field">
          <label htmlFor="deadline-input">Срок</label>
          <input
            id="deadline-input"
            name="assignment_deadline"
            type="date"
            defaultValue={defaultDeadline()}
          />
        </div>
        <button type="submit" className="dashboard-btn">
          Назначить
        </button>

        {assignmentError && (
          <p className="dashboard-form-error dashboard-assign-error" role="alert">
            {assignmentError}
          </p>
        )}
      </form>

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Курс</th>
              <th>Кому</th>
              <th>Срок</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((row) => (
              <tr key={row.id}>
                <td>{row.course}</td>
                <td>{row.target}</td>
                <td>{row.deadline}</td>
                <td>
                  <span
                    className={
                      row.status === 'active'
                        ? 'dashboard-badge dashboard-badge--ok'
                        : 'dashboard-badge dashboard-badge--pending'
                    }
                  >
                    {row.status === 'active' ? 'Активно' : 'Запланировано'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
