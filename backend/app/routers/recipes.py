from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.database import get_session
from models import Recipe, User
from schemas import RecipeCreate, RecipeResponse
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