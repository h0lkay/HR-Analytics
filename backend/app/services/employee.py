import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.company import Employee, Department, EmployeeDepartment


class EmployeeManagementService:
    @staticmethod
    async def update_role(db: AsyncSession, company_id: uuid.UUID, target_user_id: uuid.UUID,
                          new_role: str, current_user: User):
        if target_user_id == current_user.id:
            raise ValueError("Вы не можете изменить свою роль")

        stmt = select(Employee).where(
            Employee.user_id == target_user_id,
            Employee.company_id == company_id,
            Employee.is_active == True
        )
        emp = (await db.execute(stmt)).scalar_one_or_none()
        if not emp:
            raise ValueError("Сотрудник не найден")

        user_stmt = select(User).where(User.id == target_user_id)
        user = (await db.execute(user_stmt)).scalar_one_or_none()

        user.role = new_role
        emp.role = new_role

        await db.commit()
        return {"message": f"Роль пользователя успешно изменена на '{new_role}'"}

    @staticmethod
    async def assign_to_department(db: AsyncSession, company_id: uuid.UUID, target_user_id: uuid.UUID,
                                   department_id: uuid.UUID, current_user: User):
        if target_user_id == current_user.id:
            raise ValueError("Вы не можете перевести сами себя")

        emp_stmt = select(Employee).where(Employee.user_id == target_user_id, Employee.company_id == company_id,
                                          Employee.is_active == True)
        emp = (await db.execute(emp_stmt)).scalar_one_or_none()
        if not emp:
            raise ValueError("Сотрудник не найден в этой компании")

        dept_stmt = select(Department).where(Department.id == department_id, Department.company_id == company_id)
        dept = (await db.execute(dept_stmt)).scalar_one_or_none()
        if not dept:
            raise ValueError("Указанный отдел не принадлежит этой компании")

        link_stmt = select(EmployeeDepartment).where(
            EmployeeDepartment.employee_id == emp.id,
            EmployeeDepartment.department_id == department_id
        )
        existing_link = (await db.execute(link_stmt)).scalar_one_or_none()

        if existing_link:
            raise ValueError("Сотрудник уже состоит в этом отделе")

        new_link = EmployeeDepartment(employee_id=emp.id, department_id=department_id)
        db.add(new_link)
        await db.commit()
        return {"message": f"Сотрудник успешно добавлен в отдел '{dept.name}'"}

    @staticmethod
    async def remove_from_department(db: AsyncSession, company_id: uuid.UUID, target_user_id: uuid.UUID,
                                     department_id: uuid.UUID, current_user: User):
        if target_user_id == current_user.id:
            raise ValueError("Вы не можете убрать сами себя")

        emp_stmt = select(Employee).where(Employee.user_id == target_user_id, Employee.company_id == company_id,
                                          Employee.is_active == True)
        emp = (await db.execute(emp_stmt)).scalar_one_or_none()
        if not emp:
            raise ValueError("Сотрудник не найден")

        link_stmt = select(EmployeeDepartment).where(
            EmployeeDepartment.employee_id == emp.id,
            EmployeeDepartment.department_id == department_id
        )
        link = (await db.execute(link_stmt)).scalar_one_or_none()

        if not link:
            raise ValueError("Сотрудник не состоит в указанном отделе")

        await db.delete(link)
        await db.commit()
        return {"message": "Сотрудник успешно удален из отдела"}

    @staticmethod
    async def fire_employee(db: AsyncSession, company_id: uuid.UUID, target_user_id: uuid.UUID, current_user: User):
        if target_user_id == current_user.id:
            raise ValueError("Владелец не может уволить сам себя")

        emp_stmt = select(Employee).where(
            Employee.user_id == target_user_id,
            Employee.company_id == company_id,
            Employee.is_active == True
        )
        emp = (await db.execute(emp_stmt)).scalar_one_or_none()
        if not emp:
            raise ValueError("Сотрудник не найден или уже уволен")

        emp.is_active = False

        await db.commit()
        return {"message": "Сотрудник успешно уволен"}