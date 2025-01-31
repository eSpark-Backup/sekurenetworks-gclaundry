import os

from dotenv import load_dotenv
from peewee import SqliteDatabase
from src.logger import getLogger
from constants import VERSION_FILE, BASE_DIR

logger = getLogger(__name__)

if os.path.exists(f"{BASE_DIR}/.env"):
    load_dotenv(f"{BASE_DIR}/.env")
    print("Loaded .env")
elif os.path.exists(f"{BASE_DIR}/.env.prod"):
    load_dotenv(f"{BASE_DIR}/.env.prod")
    print("Loaded .env.prod")
else:
    raise RuntimeError("No env file found")

class Config:
    _instance = None

    def __init__(self):
        # initialize db
        db = SqliteDatabase(os.getenv("DATABASE_URL"), check_same_thread=False)
        db.connect()
        self.db = db

        self.github_token: str | None = os.getenv('GITHUB_TOKEN')
        # self.version: str | None = os.getenv('VERSION')
        self.host: str  = os.getenv('HOST',"")
        self.base_url: str  = os.getenv('BASE_URL',"")
        self.port = int(os.getenv('PORT', 1883))
        self.mqtt_username: str | None = os.getenv('MQTT_USERNAME')
        self.mqtt_password: str | None = os.getenv('MQTT_PASSWORD')
        self.hardware_attached: bool = os.getenv('HARDWARE_ATTACHED', 'True').lower() in ["true", "1"]
        self.serial_port: str | None = os.getenv('SERIAL_PORT')
        self.sheets_per_transaction : int = int(os.getenv('SHEETS_PER_TRANSACTION',5))
        self.screen_timeout = int(os.getenv('SCREEN_TIMEOUT', 5000))
        self.last_screen_timeout = int(os.getenv('LAST_SCREEN_TIMEOUT', 20000))
        self.is_dev = os.getenv('APP_ENV', "production") in ("development", "dev", "d")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def version(self):
        if os.path.exists(VERSION_FILE):
            with open(VERSION_FILE) as f:   
                return f.read()
        logger.warning("No version file found")
        return ""

def config() -> Config:
    return Config.get_instance()
