from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "F1 Intelligence Hub"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://f1-intelligence-hub-tan.vercel.app"
    CACHE_DIR: str = "./data/raw"
    FASTF1_CACHE_DIR: str = "./data/raw/fastf1_cache"
    ERGAST_BASE_URL: str = "https://api.jolpi.ca/ergast/f1"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
os.makedirs(settings.CACHE_DIR, exist_ok=True)
os.makedirs(settings.FASTF1_CACHE_DIR, exist_ok=True)
os.makedirs("./data/processed", exist_ok=True)
