from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ShoppingList
from helpers import make_plan_data

async def test_create_plan_success(client: AsyncClient, test_recipe, auth_headers):
    response = await client.post("/plans/", json=make_plan_data(breakfast_recipe_id=test_recipe.id), headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    plan = data[0]
    assert plan["day_of_week"] == 0
    assert plan["meal_type"] == "breakfast"
    assert plan["recipe_id"] == test_recipe.id
    assert plan["user_id"] == test_recipe.user_id
    assert plan["week_start"] == "2025-01-06"

async def test_create_plan_no_token(client: AsyncClient):
    response = await client.post("/plans/", json=make_plan_data())
    assert response.status_code == 401

async def test_create_plan_empty_recipes(client: AsyncClient, auth_headers):
    response = await client.post("/plans/", json=make_plan_data(), headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

async def test_create_plan_invalid_recipe(client: AsyncClient, auth_headers):
    response = await client.post("/plans/", json=make_plan_data(99999), headers=auth_headers)
    assert response.status_code == 404

async def test_create_plan_wrong_days_count(client: AsyncClient, auth_headers):
    plan_data = {
        "week_start": "2025-01-06",
        "days": [
            {"day_of_week": 0, "breakfast_recipe_id": None, "lunch_recipe_id": None, "dinner_recipe_id": None}
        ]
    }
    response = await client.post("/plans/", json=plan_data, headers=auth_headers)
    assert response.status_code == 422

async def test_create_plan_generates_shopping_list(client: AsyncClient, auth_headers, test_recipe, test_session: AsyncSession):
    response = await client.post("/plans/", json=make_plan_data(breakfast_recipe_id=test_recipe.id), headers=auth_headers)
    assert response.status_code == 200
    res = await test_session.execute(select(ShoppingList).where(ShoppingList.user_id == test_recipe.user_id))
    shopping_items = res.scalars().all()
    assert shopping_items