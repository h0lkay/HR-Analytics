from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_db
from app.schemas.registration import (
    CompanyWithOwnerRegisterRequest,
    EmployeeRegisterRequest,
    RegisterResponse,
    UserResponse,
    CompanyResponse
)
from app.services.registration import RegistrationService

router = APIRouter(prefix="/register", tags=["Регистрация"])


@router.post("/company", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_company(request: CompanyWithOwnerRegisterRequest, db: AsyncSession = Depends(get_db)):
    print(f"Request data: {request}")
    try:
        result = await RegistrationService.register_company_with_owner(
            db=db,
            company_data=request.company.model_dump(),
            user_data=request.owner.model_dump()
        )
        return RegisterResponse(
            message="Компания и владелец успешно зарегистрированы",
            user=UserResponse.model_validate(result['user']),
            company=CompanyResponse.model_validate(result['company'])
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Внутренняя ошибка сервера")


@router.post("/employee", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_employee(request: EmployeeRegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        try:
            company_id = UUID(request.company_id)
            department_id = UUID(request.department_id) if request.department_id else None
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некорректный формат company_id или department_id (ожидается UUID)"
            )

        result = await RegistrationService.register_employee(
            db=db,
            user_data=request.employee.model_dump(),
            company_id=company_id,
            department_id=department_id
        )
        return RegisterResponse(
            message="Сотрудник успешно зарегистрирован",
            user=UserResponse.model_validate(result['user']),
            company=CompanyResponse.model_validate(result['company'])
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Внутренняя ошибка сервера")