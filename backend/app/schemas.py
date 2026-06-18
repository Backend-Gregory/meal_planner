from pydantic import BaseModel, Field, EmailStr

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Имя пользователя")
    email: EmailStr = Field(..., min_length=1, max_length=100, description="Почта пользователя")
    password: str = Field(..., min_length=8, max_length=255, description="Пароль пользователя")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., min_length=1, max_length=100, description="Почта пользователя")
    password: str = Field(..., min_length=8, max_length=255, description="Пароль пользователя")