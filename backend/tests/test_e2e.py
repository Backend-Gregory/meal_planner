from httpx import AsyncClient
from helpers import make_plan_data
from datetime import date, timedelta

async def test_full_user_flow(client: AsyncClient):
    register_data = {
        "name": "E2E User",
        "email": "e2e@example.com",
        "password": "password123"
    }

    login_data = {
        "email": "e2e@example.com",
        "password": "password123"
    }

    recipe_data = {
        "title": "E2E Recipe",
        "description": "Description",
        "ingredients": ["a", "b"],
        "instructions": "Instructions",
        "category": "lunch",
        "cooking_time": 15,
    }

    response_register = await client.post("/auth/register", json=register_data)
    assert response_register.status_code == 201

    response_login = await client.post("/auth/login", json=login_data)
    assert response_login.status_code == 200
    token = response_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response_create_recipe = await client.post("/recipes/", headers=headers, json=recipe_data)
    assert response_create_recipe.status_code == 201
    recipe_id = response_create_recipe.json()["id"]

    today = date.today()
    week_start = (today - timedelta(days=today.weekday())).isoformat()
    response_create_plan = await client.post("/plans/", headers=headers, json=make_plan_data(breakfast_recipe_id=recipe_id, week_start=week_start))
    assert response_create_plan.status_code == 200

    response_get_shopping = await client.get("/shopping/", headers=headers)
    assert response_get_shopping.status_code == 200
    assert len(response_get_shopping.json()) > 0

    response_get_current_plan = await client.get("/plans/current", headers=headers)
    assert response_get_current_plan.status_code == 200
    assert len(response_get_current_plan.json()) == 1