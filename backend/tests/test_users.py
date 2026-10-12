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

async def test_refresh_with_valid_token(client: AsyncClient, test_user):
    response_login = await client.post("/auth/login", json=user_data_login)
    refresh_token = response_login.json()["refresh_token"]

    response_refresh = await client.post("/auth/refresh", json={"refresh_token": refresh_token})

    assert response_refresh.status_code == 200
    data = response_refresh.json()
    assert isinstance(data["access_token"], str)
    assert isinstance(data["refresh_token"], str)

async def test_refresh_with_invalid_token(client: AsyncClient):
    response = await client.post("/auth/refresh", json={"refresh_token": "invalid token"})
    assert response.status_code == 401

async def test_me_authorized(client: AsyncClient, auth_headers):
    response = await client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

async def test_me_unauthorized_not_token(client: AsyncClient):
    response = await client.get("/auth/me")
    assert response.status_code == 401

async def test_me_unauthorized_invalid_token(client: AsyncClient):
    response = await client.get("/auth/me", headers={"Authorization": "Bearer 123"})
    assert response.status_code == 401

async def test_change_password_success(client: AsyncClient, auth_headers):
    password_data = {
        "old_password": "password123",
        "new_password": "pass12345"
    }

    response = await client.put("/auth/change-password", headers=auth_headers, json=password_data)
    assert response.status_code == 200

async def test_change_password_invalid_password(client: AsyncClient, auth_headers):
    password_invalid_data = {
        "old_password": "password12",
        "new_password": "pass12345"
    }
    response = await client.put("/auth/change-password", headers=auth_headers, json=password_invalid_data)
    assert response.status_code == 401

async def test_change_password_not_token(client: AsyncClient):
    password_data = {
        "old_password": "password123",
        "new_password": "pass12345"
    }
    response = await client.put("/auth/change-password", json=password_data)
    assert response.status_code == 401

async def test_change_password_success_login(client: AsyncClient, auth_headers):
    password_data = {
        "old_password": "password123",
        "new_password": "pass12345"
    }
    await client.put("/auth/change-password", json=password_data, headers=auth_headers)
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "pass12345"
    })
    assert response.status_code == 200

    response_old = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response_old.status_code == 401
    
    response_new = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "pass12345"
    })
    assert response_new.status_code == 200

async def test_update_success(client: AsyncClient, auth_headers):
    response = await client.patch("/auth/update", headers=auth_headers, json={"name": "test user2"})
    assert response.status_code == 200
    assert response.json()["name"] == "test user2"

async def test_update_busy_email(client: AsyncClient, auth_headers):
    second_user = {
        "name": "second user",
        "email": "test2@example.com",
        "password": "password123"
    }
    await client.post("/auth/register", json=second_user)
    response = await client.patch("/auth/update", headers=auth_headers, json={"email": "test2@example.com"})
    assert response.status_code == 400

async def test_update_not_token(client: AsyncClient):
    response = await client.patch("/auth/update", json={"name": "test user2"})
    assert response.status_code == 401