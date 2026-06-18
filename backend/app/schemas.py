from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Имя пользователя")
    email: EmailStr = Field(..., min_length=1, max_length=100, description="Почта пользователя")
    password: str = Field(..., min_length=8, max_length=255, description="Пароль пользователя")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., min_length=1, max_length=100, description="Почта пользователя")
    password: str = Field(..., min_length=8, max_length=255, description="Пароль пользователя")

class UserResponse(BaseModel):
    id: int = Field(..., description="id пользователя")
    name: str = Field(..., description="Имя пользователя")
    email: EmailStr = Field(..., description="Почта пользователя")
    created_at: datetime = Field(..., description="Дата создания пользователя")

class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100, description="Имя пользователя")
    email: EmailStr | None = Field(None, max_length=100, description="Почта пользователя")