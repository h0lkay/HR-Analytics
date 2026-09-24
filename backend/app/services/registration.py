from uuid import UUID
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.company import Company, Employee, Department
from app.core.security import get_password_hash


class RegistrationService:
    @staticmethod
    def register_company_with_owner(db: Session, company_data: dict, user_data: dict):
        try:
            company = Company(**company_data, is_active = True)
            db.add(company)
            db.flush()

            management_dept = Department(
                company_id = company.id,
                name = 'руководство',
                description = 'Административный отдел'
            )
            db.add(management_dept)
            db.flush()

            user = User(
                full_name=user_data['full_name'],
                email=user_data['email'],
                hashed_password=get_password_hash(user_data['password']),
                role='owner',
                is_active=True
            )
            db.add(user)
            db.flush()

            company.owner_id = user.id
            owner_employee = Employee(
                company_id=company.id,
                user_id=user.id,
                department_id=management_dept.id,
                role='owner',
                hire_date=date.today(),
                is_active=True
            )
            db.add(owner_employee)
            db.commit()

            db.refresh(company)
            db.refresh(user)

            return {'user': user, 'company': company}

        except IntegrityError as e:
            db.rollback()
            if 'users.email' in str(e.orig) or 'ix_users_email' in str(e.orig):
                raise ValueError('Пользователь с таким email уже существует')
            raise ValueError(f'Ошибка базы данных: {str(e)}')


    @staticmethod
    def register_employee(db: Session, user_data: dict, company_id: UUID, department_id: UUID = None):
        try:
            company = db.query(Company).filter(Company.id == company_id).first()
            if not company:
                raise ValueError('Компания не найдена')

            if department_id:
                dept = db.query(Department).filter(Department.id == department_id, Department.company_id == company_id).first()
                if not dept:
                    raise ValueError('Отдел не найден или не принадлежит этой компании')

            user = User(
                full_name=user_data['full_name'],
                email=user_data['email'],
                hashed_password=get_password_hash(user_data['password']),
                role='employee',
                is_active=True
            )
            db.add(user)
            db.flush()

            employee_record = Employee(
                company_id=company_id,
                user_id=user.id,
                department_id=department_id,
                role='employee',
                hire_date=date.today(),
                is_active=True
            )
            db.add(employee_record)
            db.commit()

            db.refresh(user)

            return {'user': user, 'company': company}

        except IntegrityError as e:
            db.rollback()
            if 'users.email' in str(e.orig) or 'ix_users_email' in str(e.orig):
                raise ValueError('Пользователь с таким email уже существует')
            raise ValueError(f'Ошибка базы данных: {str(e)}')