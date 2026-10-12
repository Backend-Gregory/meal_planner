import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from app.models import Recipe, Plan, ShoppingList
from app.auth import hash_password
from helpers import create_user, create_auth_headers
from app.main import app
from app.database import Base, get_session
from datetime import date, timedelta

@pytest_asyncio.fixture
async def test_engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture
async def test_session(test_engine):
    async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)
    async with async_session_maker() as session:
        yield session

@pytest_asyncio.fixture
async def client(test_session):
    async def override_get_session():
        yield test_session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def test_user(test_session: AsyncSession):
    email = "test@example.com"
    hashed_password = hash_password("password123")
    name = "test user"

    user = await create_user(test_session, email, hashed_password, name)

    return user

@pytest_asyncio.fixture
async def test_recipe(test_session: AsyncSession, test_user):
    title = "test recipe"
    description = "test description"
    ingredients = ["test1", "test2", "test3"]
    instructions = "test instructions"
    category = "breakfast"
    cooking_time = 30

    recipe = Recipe(
        user_id=test_user.id,
        title=title,
        description=description,
        ingredients=ingredients,
        instructions=instructions,
        category=category,
        cooking_time=cooking_time
    )

    test_session.add(recipe)
    await test_session.commit()
    await test_session.refresh(recipe)
    
    return recipe

@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient, test_user):
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }

    return await create_auth_headers(client, login_data)

@pytest_asyncio.fixture
async def test_second_user(test_session: AsyncSession, ):
    email = "test2@example.com"
    hashed_password = hash_password("password123")
    name = "test user"

    user = await create_user(test_session, email, hashed_password, name)

    return user

@pytest_asyncio.fixture
async def auth_second_headers(client: AsyncClient, test_second_user):
    login_data = {
        "email": "test2@example.com",
        "password": "password123"
    }

    return await create_auth_headers(client, login_data)

@pytest_asyncio.fixture
async def create_recipe(test_session: AsyncSession, test_user):
    async def _create(**overrides):
        default = {
            "user_id": test_user.id,
            "title": "New Recipe",
            "description": "Description",
            "ingredients": ["a", "b"],
            "instructions": "Instructions",
            "category": "lunch",
            "cooking_time": 15,
        }
        default.update(overrides)
        recipe = Recipe(**default)
        test_session.add(recipe)
        await test_session.flush()
        return recipe
    return _create

@pytest_asyncio.fixture
async def create_plan(test_user, test_session: AsyncSession, test_recipe):
    async def _create(**overrides):
        today = date.today()
        defaults = {
            "user_id": test_user.id,
            "week_start": today - timedelta(days=today.weekday()),
            "day_of_week": 0,
            "recipe_id": test_recipe.id,
            "meal_type": "breakfast"
        }
        defaults.update(overrides)
        plan = Plan(**defaults)
        test_session.add(plan)
        await test_session.flush()
        return plan
    return _create

@pytest_asyncio.fixture
async def test_plan(create_plan, test_session: AsyncSession):
    plan = await create_plan()
    await test_session.commit()
    await test_session.refresh(plan)
    return plan

@pytest_asyncio.fixture
async def create_shopping_item(test_session: AsyncSession, test_user):
    async def _create(**overrides):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        defaults = {
            "user_id": test_user.id,
            "week_start": week_start,
            "ingredient": "milk",
            "quantity": "1 шт",
            "purchased": False
        }
        defaults.update(overrides)
        shopping_item = ShoppingList(**defaults)
        test_session.add(shopping_item)
        await test_session.flush()
        return shopping_item
    return _create

@pytest_asyncio.fixture
async def test_shopping_item(create_shopping_item, test_session: AsyncSession):
    shopping_item = await create_shopping_item()
    await test_session.commit()
    await test_session.refresh(shopping_item)
    return shopping_item

@pytest_asyncio.fixture
async def admin_auth_user(test_session: AsyncSession):
    email = "admin@example.com"
    hashed_password = hash_password("password123")
    name = "admin user"

    user = await create_user(test_session, email, hashed_password, name, is_admin=True)

    return user

@pytest_asyncio.fixture
async def admin_auth_headers(client: AsyncClient, admin_auth_user):
    login_data = {
        "email": "admin@example.com",
        "password": "password123"
    }

    return await create_auth_headers(client, login_data)