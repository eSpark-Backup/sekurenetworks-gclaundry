import json
import threading
import time

import requests

from constants import VERSION_INFO_RETRY
from src.logger import getLogger

logger = getLogger(__name__)
from src.sync_service.enums.api import Routes
from src.sync_service.system_info import system_info


class VersionInfoSync(threading.Thread):

    def __init__(self):
        """Send Version info to server one time in async manner"""
        super().__init__(daemon=True, name="VersionInfoSync")

    def run(self):
        self.send_versions()
        logger.info("Sent version info")

    def send_versions(self):
        try:
            # logger.info(json.dumps(system_info().to_dict()))
            r = requests.put(Routes.version, data=json.dumps(system_info().to_dict()),headers = {'Content-Type': 'application/json'})
            r.raise_for_status()

        except Exception as e:
            logger.error(f"Error Sending version data {e=}")
            time.sleep(VERSION_INFO_RETRY)
            return self.send_versions()
