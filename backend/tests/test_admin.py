from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Recipe

async def test_get_users_success(client: AsyncClient, admin_auth_headers):
    response = await client.get("/admin/users", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["email"] == "admin@example.com"
    assert data[0]["is_admin"] is True

async def test_get_users_forbidden(client: AsyncClient, auth_headers):
    response = await client.get("/admin/users", headers=auth_headers)
    assert response.status_code == 403

async def test_get_users_no_token(client: AsyncClient):
    response = await client.get("/admin/users")
    assert response.status_code == 401

async def test_block_user_success(client: AsyncClient, admin_auth_headers, test_user):
    response = await client.patch(f"/admin/users/{test_user.id}/block", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] == False

async def test_block_user_not_found(client: AsyncClient, admin_auth_headers):
    response = await client.patch("/admin/users/9999/block", headers=admin_auth_headers)
    assert response.status_code == 404

async def test_block_user_forbidden(client: AsyncClient, test_user, auth_headers):
    response = await client.patch(f"/admin/users/{test_user.id}/block", headers=auth_headers)
    assert response.status_code == 403

async def test_block_user_no_token(client: AsyncClient, test_user):
    response = await client.patch(f"/admin/users/{test_user.id}/block")
    assert response.status_code == 401

async def test_unblock_user_success(client: AsyncClient, admin_auth_headers, test_user, test_session: AsyncSession):
    test_user.is_active = False
    await test_session.commit()
    response = await client.patch(f"/admin/users/{test_user.id}/unblock", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] == True

async def test_unblock_user_not_found(client: AsyncClient, admin_auth_headers):
    response = await client.patch("/admin/users/99999/unblock", headers=admin_auth_headers)
    assert response.status_code == 404

async def test_unblock_user_forbidden(client: AsyncClient, test_user, auth_headers):
    response = await client.patch(f"/admin/users/{test_user.id}/unblock", headers=auth_headers)
    assert response.status_code == 403

async def test_unblock_user_no_token(client: AsyncClient, test_user):
    response = await client.patch(f"/admin/users/{test_user.id}/unblock")
    assert response.status_code == 401

async def test_get_admin_recipes_success(client: AsyncClient, test_recipe, admin_auth_headers):
    response = await client.get("/admin/recipes", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["id"] == test_recipe.id

async def test_get_admin_recipes_forbidden(client: AsyncClient, auth_headers):
    response = await client.get("/admin/recipes", headers=auth_headers)
    assert response.status_code == 403

async def test_get_admin_recipes_no_token(client: AsyncClient):
    response = await client.get("/admin/recipes")
    assert response.status_code == 401

async def test_delete_admin_recipe_success(client: AsyncClient, test_recipe, admin_auth_headers, test_session: AsyncSession):
    recipe_id = test_recipe.id
    response = await client.delete(f"/admin/recipes/{recipe_id}", headers=admin_auth_headers)
    assert response.status_code == 204
    recipe = await test_session.get(Recipe, recipe_id)
    assert not recipe

async def test_delete_admin_recipe_not_found(client: AsyncClient, admin_auth_headers):
    response = await client.delete("/admin/recipes/99999", headers=admin_auth_headers)
    assert response.status_code == 404

async def test_delete_admin_recipe_forbidden(client: AsyncClient, auth_headers, test_recipe):
    response = await client.delete(f"/admin/recipes/{test_recipe.id}", headers=auth_headers)
    assert response.status_code == 403

async def test_delete_admin_recipe_no_token(client: AsyncClient, test_recipe):
    response = await client.delete(f"/admin/recipes/{test_recipe.id}")
    assert response.status_code == 401