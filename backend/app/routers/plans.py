from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.database import get_session
from models import Plan, User
from schemas import PlanDay, PlanCreate, PlanResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/plans", tags=["plans"])

@router.post('/', response_model=list[PlanResponse])
async def create_plan(
    plan_data: PlanCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if len(plan_data.days) != 7:
        raise HTTPException(status_code=400, detail="Must have exactly 7 days")
    
    new_plans = []
    meal_types = ["breakfast", "lunch", "dinner"]
    for day in plan_data.days:
        for meal_type in meal_types:
            recipe_id = getattr(day, f"{meal_type}_recipe_id")
            if recipe_id:
                plan = Plan(
                    user_id = current_user.id,
                    week_start = plan_data.week_start,
                    day_of_week = day.day_of_week,
                    recipe_id = recipe_id,
                    meal_type = meal_type
                )
                new_plans.append(plan)
    
    session.add_all(new_plans)
    await session.commit()

    for plan in new_plans:
        await session.refresh(plan)
    
    return [PlanResponse.model_validate(plan) for plan in new_plans]