from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.database import get_session
from app.models import User, Recipe
from app.schemas import UserResponse, RecipeResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get('/users', response_model=list[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res = await session.execute(select(User))
    users = res.scalars().all()

    return [UserResponse.model_validate(user) for user in users]

@router.patch('/users/{user_id}/block', response_model=UserResponse)
async def block_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res = await session.execute(
        select(User)
        .where(User.id == user_id)
    )
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User is not found")
    
    user.is_active = False
    await session.commit()
    await session.refresh(user)
    return UserResponse.model_validate(user)

@router.patch('/users/{user_id}/unblock', response_model=UserResponse)
async def unblock_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res = await session.execute(
        select(User)
        .where(User.id == user_id)
    )
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    await session.commit()
    await session.refresh(user)
    return UserResponse.model_validate(user)

@router.get('/recipes', response_model=list[RecipeResponse])
async def get_recipes(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res = await session.execute(
        select(Recipe)
        .options(selectinload(Recipe.user))
    )
    recipes = res.scalars().all()

    return [RecipeResponse.model_validate(recipe) for recipe in recipes]

@router.delete('/recipes/{recipe_id}', status_code=204)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res = await session.execute(
        select(Recipe)
        .where(Recipe.id == recipe_id)
    )
    recipe = res.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    await session.delete(recipe)
    await session.commit()