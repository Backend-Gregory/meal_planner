from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ShoppingList
from helpers import assert_shopping_item_fields
from datetime import date, timedelta

async def test_get_shopping_list_success(client: AsyncClient, test_shopping_item, auth_headers, test_session: AsyncSession):
    response = await client.get("/shopping/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_shopping_item_fields(data[0], test_shopping_item)

async def test_get_shopping_list_empty(client: AsyncClient, auth_headers):
    response = await client.get("/shopping/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

async def test_get_shopping_list_no_token(client: AsyncClient):
    response = await client.get("/shopping/")
    assert response.status_code == 401

async def test_get_shopping_list_only_current_week(client: AsyncClient, create_shopping_item, auth_headers, test_session: AsyncSession):
    today = date.today()
    current_week = today - timedelta(days=today.weekday())
    last_week = current_week - timedelta(days=7)

    await create_shopping_item(ingredient="milk", week_start=current_week)
    await create_shopping_item(ingredient="bread", week_start=last_week)
    await test_session.commit()

    response = await client.get("/shopping/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["ingredient"] == "milk"

async def test_update_shopping_item_success(client: AsyncClient, test_shopping_item, auth_headers, test_session: AsyncSession):
    response = await client.patch(f"/shopping/{test_shopping_item.id}", headers=auth_headers, json={"purchased": True})
    assert response.status_code == 200
    data = response.json()

    assert data["purchased"] is True

async def test_update_shopping_item_not_found(client: AsyncClient, auth_headers):
    response = await client.patch(f"/shopping/9999", headers=auth_headers, json={"purchased": True})
    assert response.status_code == 404

async def test_update_shopping_item_foreign(client: AsyncClient, auth_second_headers, test_shopping_item, test_session: AsyncSession):
    response = await client.patch(f"/shopping/{test_shopping_item.id}", headers=auth_second_headers, json={"purchased": True})
    assert response.status_code == 403

async def test_update_shopping_item_no_token(client: AsyncClient, test_shopping_item, test_session: AsyncSession):
    response = await client.patch(f"/shopping/{test_shopping_item.id}", json={"purchased": True})
    assert response.status_code == 401

async def test_clear_shopping_list_success(client: AsyncClient, test_shopping_item, auth_headers, test_session: AsyncSession):
    response = await client.delete("/shopping/clear", headers=auth_headers)
    assert response.status_code == 204

    result = await test_session.execute(select(ShoppingList))
    all_items = result.scalars().all()
    assert len(all_items) == 0

async def test_clear_shopping_list_empty(client: AsyncClient, auth_headers):
    response = await client.delete("/shopping/clear", headers=auth_headers)
    assert response.status_code == 204

async def test_clear_shopping_list_no_token(client: AsyncClient):
    response = await client.delete("/shopping/clear")
    assert response.status_code == 401

async def test_clear_shopping_list_only_current_week(client: AsyncClient, auth_headers, create_shopping_item, test_session: AsyncSession):
    today = date.today()
    current_week = today - timedelta(days=today.weekday())
    last_week = current_week - timedelta(days=7)

    await create_shopping_item(ingredient="milk", week_start=current_week)
    await create_shopping_item(ingredient="bread", week_start=last_week)
    await test_session.commit()

    response = await client.delete("/shopping/clear", headers=auth_headers)

    res = await test_session.execute(select(ShoppingList))
    all_items = res.scalars().all()
    assert len(all_items) == 1
    assert all_items[0].ingredient == "bread"