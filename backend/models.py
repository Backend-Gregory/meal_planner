from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, JSON, Integer, DateTime, Date
from app.database import Base
from datetime import datetime, date

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    recipes: Mapped[list["Recipe"]] = relationship(back_populates="user")
    plans: Mapped[list["Plan"]] = relationship(back_populates="user")

class Recipe(Base):
    __tablename__ = "recipes"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(300), nullable=False)
    ingredients: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    instructions: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    cooking_time: Mapped[int] = mapped_column(Integer, nullable=False)
    user: Mapped["User"] = relationship(back_populates="recipes")
    plans: Mapped[list["Plan"]] = relationship(back_populates="recipe")

class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    meal_type: Mapped[str] = mapped_column(String(20), nullable=False)
    user: Mapped["User"] = relationship(back_populates="plans")
    recipe: Mapped["Recipe"] = relationship(back_populates="plans")