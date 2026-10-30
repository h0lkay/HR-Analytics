import uuid
from pydantic import BaseModel, field_validator

class RoleUpdateRequest(BaseModel):
    role: str

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in ['employee', 'hr']:
            raise ValueError("Роль может быть только 'employee' или 'hr'")
        return v

class DepartmentAssignmentRequest(BaseModel):
    department_id: uuid.UUID

class EmployeeActionResponse(BaseModel):
    message: str
    success: bool = True