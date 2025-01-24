from config import config
from src.sync_service.system_info import system_info

class Routes:
    version = f"{config().base_url}/{system_info().get_mac()}"
    complete_check_in = f"{config().base_url}/{system_info().get_mac()}"
