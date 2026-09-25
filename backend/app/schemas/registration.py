from typing import Optional
from pydantic import BaseModel, field_validator, ConfigDict, EmailStr
import re

FORBIDDEN_PASSWORD_PATTERNS = [r'^1234567890',
                               r'^qwerty',
                               r'^password',
                               r'^admin',
                               r'^1111111111',
                               r'^0000000000',
                               r'^abcdefghij']

class CompanyBase(BaseModel):
    name: str
    inn: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

    @field_validator('name')
    @classmethod
    def name_validate(cls, v):
        if not v.strip():
            raise ValueError('Название компании не может быть пустым')
        return v.strip()

    @field_validator('inn')
    @classmethod
    def inn_validate(cls, v):
        if v is not None:
            if not re.match(r'^\d{10}$|^\d{12}$', v):
                raise ValueError('ИНН должен содержать 10 или 12 цифр')
        return v


class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @field_validator('full_name')
    @classmethod
    def full_name_validate(cls, v):
        words = v.strip().split()
        if len(words) < 2:
            raise ValueError('Неверное ФИО')

        for word in words:
            if not re.match(r'^[А-Яа-яЁёA-Za-z\-]+$', word):
                raise ValueError('ФИО содержит недопустимые символы')

        return v.strip()

    @field_validator('password')
    @classmethod
    def password_validate(cls, v):
        if len(v) < 10:
            raise ValueError('Пароль должен содержать минимум 10 символов')

        if not re.search(r'[#^%@!$&*()_+\-=\[\]{};\':"\\|,.<>\/?]', v):
            raise ValueError('Пароль должен содержать хотя бы один спец. символ (!@#$% и пр.)')

        for pattern in FORBIDDEN_PASSWORD_PATTERNS:
            if re.match(pattern, v.lower()):
                raise ValueError('Пароль содержит примитивные комбинации ввода (11111, qwerty или др.)')

        if re.search(r'(012|123|234|345|456|567|678|789|890)', v):
            raise ValueError('Пароль содержит простую числовую последовательность')

        if re.search(
                r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)',
                v.lower()):
            raise ValueError('Пароль содержит простую буквенную последовательность')

        return v


class CompanyWithOwnerRegisterRequest(BaseModel):
    company: CompanyBase
    owner: EmployeeBase


class EmployeeRegisterRequest(BaseModel):
    employee: EmployeeBase
    company_id: str
    department_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    model_config = ConfigDict(from_attributes=True)


class CompanyResponse(BaseModel):
    id: str
    name: str
    inn: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class RegisterResponse(BaseModel):
    message: str
    user: UserResponse
    company: Optional[CompanyResponse] = None
