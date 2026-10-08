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

async def test_copy_plan_success(client: AsyncClient, auth_headers, test_plan):
    week_start = test_plan.week_start
    response = await client.post("/plans/copy", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    data = response.json()[0]

    
    copied_week_start = date.fromisoformat(data["week_start"]) - timedelta(days=7)
    assert copied_week_start == week_start
    assert data["recipe_id"] == test_plan.recipe_id
    assert data["meal_type"] == test_plan.meal_type
    assert data["day_of_week"] == test_plan.day_of_week
    assert data["user_id"] == test_plan.user_id

async def test_copy_plan_empty(client: AsyncClient, auth_headers):
    response = await client.post("/plans/copy", headers=auth_headers)
    assert response.status_code == 404

async def test_copy_plan_no_token(client: AsyncClient):
    response = await client.post("/plans/copy")
    assert response.status_code == 401

async def test_update_plan_success(client: AsyncClient, auth_headers, test_plan, create_recipe, test_session: AsyncSession):
    new_recipe = await create_recipe(title="Another recipe")
    await test_session.commit()
    week_start = test_plan.week_start
    response = await client.put(f"/plans/{week_start}", headers=auth_headers, json=make_plan_data(breakfast_recipe_id=new_recipe.id))
    assert response.status_code == 200

async def test_update_plan_add_meal(client: AsyncClient, auth_headers, test_plan, create_recipe, test_session: AsyncSession):
    new_recipe = await create_recipe(title="Another recipe", category="lunch")
    await test_session.commit()
    week_start = test_plan.week_start
    response = await client.put(f"/plans/{week_start}", headers=auth_headers, json=make_plan_data(lunch_recipe_id=new_recipe.id))
    assert response.status_code == 200

async def test_update_plan_not_found(client: AsyncClient, auth_headers):
    response = await client.put("/plans/2030-01-09", headers=auth_headers, json=make_plan_data(week_start="2030-01-09"))
    assert response.status_code == 404

async def test_update_plan_invalid_recipe(client: AsyncClient, auth_headers, test_plan):
    week_start = test_plan.week_start
    response = await client.put(f"/plans/{week_start}", headers=auth_headers, json=make_plan_data(breakfast_recipe_id=9999))
    assert response.status_code == 404

async def test_update_plan_no_token(client: AsyncClient):
    response = await client.put("/plans/2025-01-01")
    assert response.status_code == 401

async def test_delete_plan_success(client: AsyncClient, auth_headers, test_plan, test_session: AsyncSession):
    response = await client.delete(f"/plans/{test_plan.id}", headers=auth_headers)
    assert response.status_code == 204
    plan = await test_session.get(Plan, test_plan.id)
    assert not plan

async def test_delete_plan_foreign(client: AsyncClient, auth_second_headers, test_plan):
    response = await client.delete(f"/plans/{test_plan.id}", headers=auth_second_headers)
    assert response.status_code == 403

async def test_delete_plan_not_found(client: AsyncClient, auth_headers):
    response = await client.delete("/plans/9999", headers=auth_headers)
    assert response.status_code == 404

async def test_delete_plan_no_token(client: AsyncClient):
    response = await client.delete("/plans/1")
    assert response.status_code == 401