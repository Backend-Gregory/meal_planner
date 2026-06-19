from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date

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

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RecipeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Название рецепта")
    description: str | None = Field(None, min_length=1, max_length=300, description="Описание рецепта")
    ingredients: list[str] = Field(..., min_length=1, description="Ингредиенты рецепта")
    instructions: str = Field(..., min_length=1, max_length=500, description="Инструкция рецепта")
    category: str = Field(..., min_length=1, max_length=50, description="Категория рецепта")
    cooking_time: int = Field(..., ge=1, description="Время приготовления рецепта в минутах")

class RecipeResponse(RecipeCreate):
    id: int = Field(..., description="id рецепта")
    user_id: int = Field(..., description="id пользователя рецепта")

class RecipeUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100, description="Название рецепта")
    description: str | None = Field(None, min_length=1, max_length=300, description="Описание рецепта")
    ingredients: list[str] | None = Field(None, min_length=1, description="Ингредиенты рецепта")
    instructions: str | None = Field(None, min_length=1, max_length=500, description="Инструкция рецепта")
    category: str | None = Field(None, min_length=1, max_length=50, description="Категория рецепта")
    cooking_time: int | None = Field(None, ge=1, description="Время приготовления рецепта в минутах")

class PlanDay(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="День недели")
    breakfast_recipe_id: int | None = Field(None, description="id завтрака")
    lunch_recipe_id: int | None = Field(None, description="id обеда")
    dinner_recipe_id: int | None = Field(None, description="id ужина")

class PlanCreate(BaseModel):
    week_start: date = Field(..., description="Старт недели")
    days: list[PlanDay] = Field(..., min_length=7, max_length=7, description="Список из 7 дней недели (пн–вс)")

class PlanResponse(BaseModel):
    id: int = Field(..., description="id плана")
    user_id: int = Field(..., description="id пользователя плана")
    week_start: date = Field(..., description="Старт недели")
    day_of_week: int = Field(..., description="День недели")
    recipe_id: int = Field(..., description="id рецепта")
    meal_type: str = Field(..., description="Тип приема пищи")

class ShoppingItemCreate(BaseModel):
    ingredient: str = Field(..., min_length=1, max_length=100, description="Ингредиент")
    quantity: str = Field(..., min_length=1, max_length=50, description="Кол-во ингредиентов")

class ShoppingItemResponse(ShoppingItemCreate):
    id: int = Field(..., description="id записи в системе покупок")
    purchased: bool = Field(..., description="Статус покупки")

class ShoppingItemUpdate(BaseModel):
    purchased: bool