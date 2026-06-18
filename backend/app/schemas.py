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
    id: int
    name: str
    email: EmailStr
    created_at: datetime

class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100, description="Имя пользователя")
    email: EmailStr | None = Field(None, max_length=100, description="Почта пользователя")