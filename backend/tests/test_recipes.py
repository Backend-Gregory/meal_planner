from httpx import AsyncClient
from app.models import Recipe
from sqlalchemy.ext.asyncio import AsyncSession
from helpers import assert_recipe_fields
import pytest

recipe_data = {
        "title": "New Recipe",
        "description": "Description",
        "ingredients": ["a", "b"],
        "instructions": "Instructions",
        "category": "lunch",
        "cooking_time": 15
    }

async def test_create_recipe_success(client: AsyncClient, auth_headers, test_user):
    response = await client.post("/recipes/", headers=auth_headers, json=recipe_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Recipe"
    assert data["description"] == "Description"
    assert data["ingredients"] == ["a", "b"]
    assert data["instructions"] == "Instructions"
    assert data["category"] == "lunch"
    assert data["cooking_time"] == 15
    assert "id" in data
    assert data["user_id"] == test_user.id

async def test_create_recipe_no_token(client: AsyncClient):
    response = await client.post("/recipes/", json=recipe_data)
    assert response.status_code == 401

@pytest.mark.parametrize("payload", [
    pytest.param(
        {"title": "", "description": "Description", "ingredients": ["a", "b"], "instructions": "Instructions", "category": "lunch", "cooking_time": 15},
        id="empty_title"
    ),
    pytest.param(
        {"title": "New Recipe", "description": "Description", "ingredients": [], "instructions": "Instructions", "category": "lunch", "cooking_time": 15},
        id="empty_ingredients"
    ),
    pytest.param(
        {"title": "New Recipe", "description": "Description", "ingredients": ["a", "b"], "instructions": "", "category": "lunch", "cooking_time": 15},
        id="empty_instructions"
    ),
    pytest.param(
        {"title": "New Recipe", "description": "Description", "ingredients": ["a", "b"], "instructions": "Instructions", "category": "lunch", "cooking_time": 0},
        id="empty_cooking_time"
    ),
    pytest.param(
        {"title": "New Recipe", "description": "Description", "ingredients": ["a", "b"], "instructions": "Instructions", "category": "", "cooking_time": 15},
        id="empty_category"
    )
])
async def test_create_recipe_invalid_data(client: AsyncClient, auth_headers, payload):
    response = await client.post("/recipes/", headers=auth_headers, json=payload)
    assert response.status_code == 422

async def test_get_recipes_empty(client: AsyncClient):
    response = await client.get("/recipes/")
    assert response.status_code == 200
    assert response.json() == []

async def test_get_recipes_with_data(client: AsyncClient, test_recipe):
    response = await client.get("/recipes/")
    assert response.status_code == 200
    assert len(response.json()) == 1

async def test_get_recipes_pagination(client: AsyncClient, test_user, test_session: AsyncSession, create_recipe):
    recipe_ids = []
    for i in range(5):
        recipe = await create_recipe()
        recipe_ids.append(recipe.id)
    await test_session.commit()

    response1 = await client.get("/recipes/?limit=2")
    response2 = await client.get("/recipes/?skip=2&limit=2")
    response3 = await client.get("/recipes/?skip=10")

    assert response1.status_code == 200
    ids1 = [r["id"] for r in response1.json()]
    assert ids1 == [recipe_ids[4], recipe_ids[3]]

    assert response2.status_code == 200
    ids2 = [r["id"] for r in response2.json()]
    assert ids2 == [recipe_ids[2], recipe_ids[1]]

    assert response3.status_code == 200
    assert response3.json() == []