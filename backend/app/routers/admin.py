from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_session
from models import User
from schemas import UserResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get('/users', response_model=list[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res = await session.execute(select(User))
    users = res.scalars().all()

    return [UserResponse.model_validate(user) for user in users]