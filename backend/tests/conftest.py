import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from app.models import User, Recipe, Plan
from app.auth import hash_password
from helpers import create_user, create_auth_headers
from app.main import app
from app.database import Base, get_session
from datetime import date, datetime, timedelta

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