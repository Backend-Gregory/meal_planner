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