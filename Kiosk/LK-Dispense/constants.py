import os
from pathlib import Path

REPO_OWNER = "MuhammadShabbarAbbas"
REPO_NAME = "LK-Dispense"

HOME: str = str(Path("~").expanduser())
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

REPO_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases/latest"
REPO_URL_DEV = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases"


DEPS_SCRIPT_NAME = "setup_enviroment.sh"
DEPS_SCRIPT = f"{BASE_DIR}/{DEPS_SCRIPT_NAME}"

LOG_DIR = BASE_DIR + "/logs/"

MAX_LOG_FILE_SIZE = 20_000_000 # 20MB
LOG_FILE_NAME = HOME + '/genco.log'
LOG_BACKUP_COUNT = 5

MAX_DEBUG_LOG_FILE_SIZE = 20_000_000 # 20MB
DEBUG_LOG_FILE_NAME = BASE_DIR + '/logs/genco_debug.log'

DEBUG_LOG_BACKUP_COUNT = 5

SYNC_INTERVAL = 120  # sec
FULL_CHECKIN_INTERVAL = 120  # sec
VERSION_INFO_RETRY = 20

ALIVE_SERVICE_INTERVAL = 120
OTA_INTERVAL = 30


VERSION_FILE = BASE_DIR + "/.version"