from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ShoppingList, Plan
from helpers import make_plan_data, assert_plan_fields
from datetime import timedelta, date

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

async def test_get_current_plan_success(client: AsyncClient, auth_headers, test_plan):
    response = await client.get("/plans/current", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert_plan_fields(data[0], test_plan)

async def test_get_current_plan_empty(client: AsyncClient, auth_headers):
    response = await client.get("/plans/current", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

async def test_get_current_plan_no_token(client: AsyncClient):
    response = await client.get("/plans/current")
    assert response.status_code == 401

async def test_get_plan_by_week_success(client: AsyncClient, auth_headers, test_plan):
    week_start = test_plan.week_start
    response = await client.get(f"/plans/{week_start}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert_plan_fields(data[0], test_plan)

async def test_get_plan_by_week_empty(client: AsyncClient, auth_headers):
    response = await client.get("/plans/2030-01-06", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

async def test_get_plan_by_week_alignment(client: AsyncClient, auth_headers, test_plan):
    week_start = test_plan.week_start
    response = await client.get(f"/plans/{week_start + timedelta(days=2)}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["week_start"] == week_start.isoformat()