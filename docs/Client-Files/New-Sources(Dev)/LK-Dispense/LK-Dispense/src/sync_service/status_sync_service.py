import json
import time

from src.ctrl import ctrl
from src.logger import getLogger
from src.sync_service.enums.topics import Topics
from src.sync_service.base_sync_service import BaseSyncService
from src.sync_service.system_info import system_info

logger = getLogger(__name__)


class StatusSyncService(BaseSyncService):

    def __init__(self):
        super().__init__(name="StatusSyncService")

    def generate_payload(self):

        payload = {
            "macId": system_info().get_mac(),
                   }
        try:
            if (temp := ctrl().board.read_temperature()) is not None:
                payload.update({"temperature": temp}) # type: ignore #
        except Exception as e:
            logger.error(f"Error reading temperature {e=}")

        try:
            if (scented := ctrl().board.read_tof_sensor(1)) is not None:
                payload.update({"scented": scented})# type: ignore
        except Exception as e:
            logger.error(f"Error reading tof sensor {e=}")

        try:
            if (unscented := ctrl().board.read_tof_sensor(0)) is not None:
                payload.update({"unscented": unscented})# type: ignore
        except Exception as e:
            logger.error(f"Error reading tof sensor {e=}")

        try:
            if (all_motor_status := ctrl().board.read_motor_status_all()) is not None:
                payload.update({"scented_motor_stuck": all_motor_status[0]})# type: ignore
                payload.update({"unscented_motor_stuck": all_motor_status[2]})# type: ignore
        except Exception as e:
            logger.error(f"Error reading moto status {e=}")

        try:

            if (is_door_open := ctrl().board.read_door_status()) is not None:
                payload.update({"is_door_open": is_door_open})# type: ignore
        except Exception as e:
            logger.error(f"Error reading door status {e=}")

        return payload

    def do_action(self):
        if ctrl().is_dispensing:
            logger.info("Board is busy, trying...")
            time.sleep(5)
            return self.do_action()

        logger.log("StatusUpdateService triggered")
        payload = json.dumps(self.generate_payload())
        try:
            r = self.client.publish(Topics.STATUS, payload, 1)
            r.wait_for_publish(20)
            if r.is_published():
                logger.success("Status sent successfully!")
                logger.debug("sent payload :", payload)
        except Exception as e:
            logger.error(f"Status Update Failed {e=}")
            return

        
