import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, check_owner_or_hr
from app.models.user import User
from app.schemas.employee import (
    RoleUpdateRequest,
    DepartmentAssignmentRequest,
    EmployeeActionResponse
)
from app.services.employee import EmployeeManagementService

router = APIRouter(prefix="/companies/{company_id}/employees", tags=["Управление сотрудниками"])


@router.put("/{target_user_id}/role", response_model=EmployeeActionResponse)
async def update_employee_role(company_id: uuid.UUID, target_user_id: uuid.UUID, role_data: RoleUpdateRequest,
                               db: AsyncSession = Depends(get_db), current_user: User = Depends(check_owner_or_hr)):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Только Владелец компании может назначать роли")

    try:
        result = await EmployeeManagementService.update_role(
            db, company_id, target_user_id, role_data.role, current_user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{target_user_id}/department", response_model=EmployeeActionResponse)
async def assign_to_department(company_id: uuid.UUID, target_user_id: uuid.UUID, dept_data: DepartmentAssignmentRequest,
                               db: AsyncSession = Depends(get_db), current_user: User = Depends(check_owner_or_hr)):
    try:
        result = await EmployeeManagementService.assign_to_department(
            db, company_id, target_user_id, dept_data.department_id, current_user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{target_user_id}/departments/{department_id}", response_model=EmployeeActionResponse)
async def remove_from_department(company_id: uuid.UUID, target_user_id: uuid.UUID, department_id: uuid.UUID,
                                 db: AsyncSession = Depends(get_db), current_user: User = Depends(check_owner_or_hr)):
    try:
        result = await EmployeeManagementService.remove_from_department(
            db, company_id, target_user_id, department_id, current_user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{target_user_id}", response_model=EmployeeActionResponse)
async def fire_employee(company_id: uuid.UUID, target_user_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                        current_user: User = Depends(check_owner_or_hr)):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Только Владелец компании может увольнять сотрудников")

    try:
        result = await EmployeeManagementService.fire_employee(
            db, company_id, target_user_id, current_user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))