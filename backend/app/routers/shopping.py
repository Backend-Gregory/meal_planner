from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_session
from models import ShoppingList, User
from schemas import ShoppingItemCreate, ShoppingItemResponse, ShoppingItemUpdate
from app.dependencies import get_current_user
from datetime import datetime, timedelta, date

router = APIRouter(prefix="/shopping", tags=["shopping"])

@router.get('/', response_model=list[ShoppingItemResponse])
async def get_shopping_list(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),   
):
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())

    res = await session.execute(
        select(ShoppingList)
        .where(ShoppingList.user_id == current_user.id)
        .where(ShoppingList.week_start == week_start)
    )
    shopping_list = res.scalars().all()

    return [ShoppingItemResponse.model_validate(item) for item in shopping_list]