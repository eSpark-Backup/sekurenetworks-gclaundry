import json
import time

from config import config
from constants import SYNC_INTERVAL
from src.ctrl import ctrl
from src.database.enums.tissue_type import TissueType
from src.logger import getLogger
from src.sync_service.enums.topics import Topics
from src.sync_service.base_sync_service import BaseSyncService
from src.sync_service.system_info import system_info

logger = getLogger(__name__)


# This is for legacy support.
# Will be removed going forward
class StatusSyncServiceOld(BaseSyncService):

    def __init__(self):
        super().__init__(name="StatusSyncServiceOld")

    def run(self):
        t = 0

        while 1:
            # we are using both flags because with single flag the output was random and data loss was possible.
            if t >= SYNC_INTERVAL + 2 or self.FORCE_TRIGGER.is_set():
                if not (self.is_connected and self.client.is_connected()):
                    self.connect()

                self.do_action()

                self.FORCE_TRIGGER.clear()
                t = 0
            t += 1

            time.sleep(1)

    def calculate_tof_percentage(self, index):
        try:
            return round(100 - (ctrl().board.read_tof_sensor(index) * 100 / 260))
        except Exception as e:
            return "Error"

    def do_action(self):
        if ctrl().is_dispensing:
            logger.info("Board is busy, ignoring StatusSyncServiceOld")
            return

        logger.log("StatusSyncServiceOld triggered")
        a = self.calculate_tof_percentage(1)
        payload = json.dumps(
            {
                "quantity": (
                    self.calculate_tof_percentage(1)
                    if config().hardware_attached
                    else "CONN"
                ),
                "tissueTye": TissueType.SCENTED.value,
                "macId": system_info().get_mac(),
            }
        )
        self.client.publish(Topics.TRANSACTION, payload)
        logger.debug(
            f"StatusSyncServiceOld service : payload pushed: {json.loads(payload)}"
        )

        payload = json.dumps(
            {
                "quantity": (
                    self.calculate_tof_percentage(0)
                    if config().hardware_attached
                    else "CONN"
                ),
                "tissueTye": TissueType.UNSCENTED.value,
                "macId": system_info().get_mac(),
            }
        )
        self.client.publish(Topics.TRANSACTION, payload)
        logger.debug(f"StatusSyncServiceOld : payload pushed: {json.loads(payload)}")
