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

async def test_login_success(client: AsyncClient, test_user):
    response_login = await client.post("/auth/login", json=user_data_login)

    data = response_login.json()
    assert response_login.status_code == 200
    assert isinstance(data["access_token"], str)
    assert isinstance(data["refresh_token"], str)

async def test_login_wrong_password(client: AsyncClient, test_user):
    user_data_login = {
        "email": "test@example.com",
        "password": "password12"
    }
    response_login = await client.post("/auth/login", json=user_data_login)

    assert response_login.status_code == 401
    assert response_login.json()["detail"] == "Invalid credentials"

async def test_login_nonexistent_user(client: AsyncClient):
    response_login = await client.post("/auth/login", json=user_data_login)

    assert response_login.status_code == 401

async def test_login_blocked_user(client: AsyncClient, test_session, test_user):
    test_user.is_active = False
    await test_session.commit()
    response = await client.post("/auth/login", json=user_data_login)
    assert response.status_code == 403