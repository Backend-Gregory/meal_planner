from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_session
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token, ChangePassword
from app.auth import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post('/register', status_code=201, response_model=UserResponse)
async def register(user: UserCreate, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(User).where(User.email == user.email))
    existing_user = res.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

@router.post('/login', response_model=Token)
async def login(user: UserLogin, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(User).where(User.email == user.email))
    db_user = res.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    is_password = verify_password(user.password, db_user.hashed_password)

    if not is_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = db_user.id
    access_token = create_access_token(user_id)

    return {"access_token": access_token, "token_type": "bearer"}

@router.get('/me', response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put('/change-password', response_model=dict)
async def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    is_old_password = verify_password(data.old_password, current_user.hashed_password)

    if not is_old_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    new_hashed = hash_password(data.new_password)

    current_user.hashed_password = new_hashed
    await session.commit()

    return {"message": "Password changed successfully"}