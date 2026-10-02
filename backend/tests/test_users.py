from httpx import AsyncClient

user_data = {
        "name": "test user",
        "email": "test@example.com",
        "password": "password123"
    }

user_data_login = {
        "email": "test@example.com",
        "password": "password123"
    }

async def test_register_success(client: AsyncClient):
    response = await client.post("/auth/register", json=user_data)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "test user"
    assert "id" in data

async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/auth/register", json=user_data)
    response = await client.post("/auth/register", json=user_data)

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

async def test_register_short_password(client: AsyncClient):
    user_wrong_data = {
            "name": "test user",
            "email": "test@example.com",
            "password": "123"
        }

    response = await client.post("/auth/register", json=user_wrong_data)

    assert response.status_code == 422