import os
from dotenv import load_dotenv

load_dotenv()

class Settings():
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASS: str = os.getenv("DB_PASS", "postgres")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "meal_planner")

    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_this_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    POOL_SIZE: int = int(os.getenv("POOL_SIZE", 10))
    MAX_OVERFLOW: int = int(os.getenv("MAX_OVERFLOW", 20))
    ECHO_SQL: bool = os.getenv("ECHO_SQL", "False").lower() == "true"

settings = Settings()