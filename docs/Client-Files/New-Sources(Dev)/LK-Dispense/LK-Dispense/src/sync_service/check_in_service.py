import time
from threading import Thread

import requests

from constants import FULL_CHECKIN_INTERVAL
from src.ctrl import ctrl
from src.logger import getLogger
from src.sync_service.commons import replace_quotes, replace_survey, replace_users, update_config
from src.sync_service.enums.api import Routes

logger = getLogger(__name__)


class CheckInService(Thread):
    def __init__(self) -> None:
        super().__init__(name="CheckInService", daemon=True)

    def get_data(self):
        try:
            r = requests.get(Routes.complete_check_in)
            r.raise_for_status()
            response_data = r.json()
            logger.debug("Data from the api:", str(response_data))
            self.update_tables(response_data)
        except Exception as e:
            logger.error(f"Error Performing Check In {e=}")
    
    def run(self):
        while 1:
            self.get_data()
            time.sleep(FULL_CHECKIN_INTERVAL)

    def update_tables(self, data):
        # When user is interacting with kiosk, delay table update, to avoid unexpected behaviour from kiosk.

        # time.sleep(3)
        if ctrl().is_active:
            logger.log("Kiosk is busy delaying table update")
            time.sleep(15)
            return self.update_tables(data)

        replace_survey(data["survey"])
        replace_quotes(data["environmental_messages"])
        update_config(data["config"])
        replace_users(data["users"])
        logger.success("Updated all tables")
    
    
