from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    hash_password = pwd_context.hash(password)
    return hash_password

def verify_password(password: str, hashed: str) -> bool:
    is_password = pwd_context.verify(password, hashed)
    return is_password

def create_token(user_id: int, type_token: str = 'access') -> str:
    to_encode = {"sub": str(user_id)}
    time = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    if type_token == 'refresh':
        time = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    expire = datetime.now(timezone.utc) + time
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def create_access_token(user_id: int) -> str:
    return create_token(user_id)

def create_refresh_token(user_id):
    return create_token(user_id, 'refresh')

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except JWTError:
        return None