from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.database import get_session
from app.models import Plan, User, Recipe
from app.schemas import PlanDay, PlanCreate, PlanResponse, PlanUpdate
from app.dependencies import get_current_user
from datetime import datetime, timedelta, date

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
                recipe = await session.get(Recipe, recipe_id)
                if not recipe:
                    raise HTTPException(status_code=404, detail=f"Recipe {recipe_id} not found")
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

@router.get('/{week_start}', response_model=list[PlanResponse])
async def get_plan_by_week(
    week_start: date,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    week_start = week_start - timedelta(days=week_start.weekday())

    res = await session.execute(
        select(Plan)
        .where(Plan.user_id == current_user.id)
        .where(Plan.week_start == week_start)
        .options(selectinload(Plan.recipe))
    )
    plans = res.scalars().all()

    return [PlanResponse.model_validate(plan) for plan in plans]

@router.post('/copy', response_model=list[PlanResponse])
async def copy_plan(
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

    if not plans:
        raise HTTPException(status_code=404, detail="Plans not found")
    
    new_plans = []
    for plan in plans:
        new_plan = Plan(
            user_id = current_user.id,
            week_start = week_start + timedelta(days=7),
            day_of_week = plan.day_of_week,
            recipe_id = plan.recipe_id,
            meal_type = plan.meal_type
        )
        new_plans.append(new_plan)

    session.add_all(new_plans)
    await session.commit()

    for plan in new_plans:
        await session.refresh(plan)

    return [PlanResponse.model_validate(plan) for plan in new_plans]

@router.delete('/{plan_id}', status_code=204)
async def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    res = await session.execute(select(Plan).where(Plan.id == plan_id))
    plan = res.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if current_user.id != plan.user_id:
        raise HTTPException(status_code=403, detail="You are not the author of this plan")
    
    await session.delete(plan)
    await session.commit()

@router.put('/{week_start}')
async def update_plan(
    week_start: date,
    plan_data: PlanUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(Plan).where(
            Plan.user_id == current_user.id,
            Plan.week_start == week_start
        )
    )
    existing_plans = result.scalars().all()
    
    if not existing_plans:
        raise HTTPException(status_code=404, detail="Plan not found for this week")

    meals_map = {}
    for day in plan_data.days:
        meals_map[day.day_of_week] = {
            'breakfast': day.breakfast_recipe_id,
            'lunch': day.lunch_recipe_id,
            'dinner': day.dinner_recipe_id
        }

    for plan in existing_plans:
        meal_data = meals_map.get(plan.day_of_week, {})
        new_recipe_id = meal_data.get(plan.meal_type)
        
        if new_recipe_id is not None:
            # Проверяем, что рецепт существует
            recipe = await session.get(Recipe, new_recipe_id)
            if not recipe:
                raise HTTPException(status_code=404, detail=f"Recipe {new_recipe_id} not found")
            
            plan.recipe_id = new_recipe_id

    existing_keys = {(p.day_of_week, p.meal_type) for p in existing_plans}
    
    for day_of_week, meals in meals_map.items():
        for meal_type, recipe_id in meals.items():
            if recipe_id and (day_of_week, meal_type) not in existing_keys:
                recipe = await session.get(Recipe, recipe_id)
                if not recipe:
                    raise HTTPException(status_code=404, detail=f"Recipe {recipe_id} not found")
                
                new_plan = Plan(
                    user_id=current_user.id,
                    week_start=week_start,
                    day_of_week=day_of_week,
                    recipe_id=recipe_id,
                    meal_type=meal_type
                )
                session.add(new_plan)

    await session.commit()

    result = await session.execute(
        select(Plan).where(
            Plan.user_id == current_user.id,
            Plan.week_start == week_start
        )
    )
    return result.scalars().all()