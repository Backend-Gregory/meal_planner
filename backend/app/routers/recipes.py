from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.database import get_session
from models import Recipe, User
from schemas import RecipeCreate, RecipeResponse, RecipeUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.post('/', status_code=201, response_model=RecipeResponse)
async def create_recipe(
    recipe: RecipeCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    user_id = current_user.id
    new_recipe = Recipe(
        user_id=user_id, title=recipe.title, description=recipe.description,
        ingredients=recipe.ingredients, instructions=recipe.instructions, category=recipe.category,
        cooking_time=recipe.cooking_time
)
    session.add(new_recipe)
    await session.commit()
    await session.refresh(new_recipe)
    return RecipeResponse.model_validate(new_recipe)

@router.get('/', response_model=list[RecipeResponse])
async def get_recipes(
    skip: int = 0,
    limit: int = 10,
    category: str | None = None,
    search: str | None = None,
    session: AsyncSession = Depends(get_session)
):
    query = select(Recipe).options(selectinload(Recipe.user))

    if category:
        query = query.where(Recipe.category == category)
    if search:
        query = query.where(Recipe.title.ilike(f"%{search}%"))

    query = query.offset(skip).limit(limit)

    res = await session.execute(query)
    recipes = res.scalars().all()

    return [RecipeResponse.model_validate(recipe) for recipe in recipes]

@router.get('/{recipe_id}', response_model=RecipeResponse)
async def get_recipe(recipe_id: int, session: AsyncSession = Depends(get_session)):
    res = await session.execute(
        select(Recipe)
        .where(Recipe.id == recipe_id)
        .options(selectinload(Recipe.user))
    )
    recipe = res.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return RecipeResponse.model_validate(recipe)

@router.put('/{recipe_id}', response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_data: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    res = await session.execute(
        select(Recipe)
        .where(Recipe.id == recipe_id)
        .options(selectinload(Recipe.user))
    )
    recipe = res.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    is_author = current_user.id == recipe.user_id

    if not is_author:
        raise HTTPException(status_code=403, detail="You are not the author of this recipe")
    
    update_data = recipe_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(recipe, key, value)

    await session.commit()
    return RecipeResponse.model_validate(recipe)

@router.delete('/{recipe_id}', status_code=204)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    res = await session.execute(
        select(Recipe)
        .where(Recipe.id == recipe_id)
    )
    recipe = res.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    is_author = current_user.id == recipe.user_id

    if not is_author:
        raise HTTPException(status_code=403, detail="You are not the author of this recipe")
    
    await session.delete(recipe)
    await session.commit()