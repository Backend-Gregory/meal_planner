from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.database import get_session
from models import Plan, User
from schemas import PlanDay, PlanCreate, PlanResponse
from app.dependencies import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/plans", tags=["plans"])

@router.post('/', response_model=list[PlanResponse])
async def create_plan(
    plan_data: PlanCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):

    if len(plan_data.days) != 7:
        raise HTTPException(status_code=400, detail="Must have exactly 7 days")
    
    week_start = plan_data.week_start - timedelta(days=plan_data.week_start.weekday())

    new_plans = []
    meal_types = ["breakfast", "lunch", "dinner"]
    for day in plan_data.days:
        for meal_type in meal_types:
            recipe_id = getattr(day, f"{meal_type}_recipe_id")
            if recipe_id:
                plan = Plan(
                    user_id = current_user.id,
                    week_start = week_start,
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

@router.get('/current', response_model=list[PlanResponse])
async def get_current_plan(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())

    res = await session.execute(
        select(Plan)
        .where(Plan.user_id == current_user.id)
        .where(Plan.week_start == week_start)
        .options(selectinload(Plan.recipe))
    )
    plans = res.scalars().all()

    return [PlanResponse.model_validate(plan) for plan in plans]