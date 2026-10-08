from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient
from app.models import User

def assert_recipe_fields(data: dict, recipe):
    assert data["id"] == recipe.id
    assert data["title"] == recipe.title
    assert data["description"] == recipe.description
    assert data["ingredients"] == recipe.ingredients
    assert data["instructions"] == recipe.instructions
    assert data["category"] == recipe.category
    assert data["cooking_time"] == recipe.cooking_time
    assert data["user_id"] == recipe.user_id

def assert_plan_fields(data: dict, plan):
    assert data["id"] == plan.id
    assert data["user_id"] == plan.user_id
    assert data["week_start"] == plan.week_start.isoformat()
    assert data["day_of_week"] == plan.day_of_week
    assert data["recipe_id"] == plan.recipe_id
    assert data["meal_type"] == plan.meal_type

async def create_user(test_session: AsyncSession, email, hashed_password, name):
    user = User(
        email=email,
        hashed_password=hashed_password,
        name=name
    )

    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user

async def create_auth_headers(client: AsyncClient, login_data: dict):
    response = await client.post("/auth/login", json=login_data)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}