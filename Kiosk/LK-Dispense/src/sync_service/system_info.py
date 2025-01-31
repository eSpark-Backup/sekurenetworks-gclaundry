import re
import socket
import uuid
from time import sleep

from screeninfo import screeninfo

import config
from src.ctrl import ctrl
from src.logger import getLogger

logger = getLogger(__name__)


class SystemInfo:
    _instance = None

    def to_dict(self):
        return {
            "macId": self.get_mac(),

            "Screen Resolution": self.get_resolution(),
            "Kiosk Name": self.get_machine_name(),
            "Application Version": self.get_app_version(),
            "Firmware Version": self.get_mcb_hw_version(),

            # TODO add proper support for these
            "sbcHWVersion": self.get_sbc_hw_version(),
            "motorHWVersion": self.__get_motor_hw_version(),
            "sbcSWVersion": self.__get_sbc_sw_version(),
            "motorSWVersion": self.__get_motor_sw_version(),
        }
    def to_dict_alive(self):
        return {
            "wifiName": "None",
            "macId": self.get_mac(),
            "kioskName": self.get_machine_name(),
            "machineInfo": {
                "sbcHWVersion": self.get_sbc_hw_version(),
                "motorHWVersion": self.__get_motor_hw_version(),
                "mcbHWVersion": self.__get_motor_hw_version(),
                "screen": "1200x700",
                "resolution": self.get_resolution(),
                "sbcSWVersion": self.__get_sbc_sw_version(),
                "motorSWVersion": self.__get_motor_sw_version(),
                "mcbSWVersion": self.get_mcb_hw_version()
            }
        }
    
    def get_machine_name(self) -> str:
        return socket.gethostname()

    def get_resolution(self) -> str:
        try:
            screen = screeninfo.get_monitors()[0]
            return f"{screen.width}x{screen.height}"
        except Exception as e:
            logger.error(f"Error getting resolution {e=}")
            return "None"

    def get_mac(self) -> str:
        """
        retives mac_address

        on Unix :
            /sys/class/net/eth0/address
            
            on error :
                uuid.getnode

        on windows:
            uuid.getnode
        """
        try:
            with open('/sys/class/net/eth0/address') as f:
                return f.read().strip()
        except Exception as e :
            logger.error(f"Failed to get mac adress from sys/class/net/eth0/address trying other method {e=}")
            return ":".join(re.findall("..", "%012x" % uuid.getnode()))
        # return "a7:2B:3c:D4:e5:FF"

    def get_app_version(self) -> str | None:
        return config.config().version

    def get_mcb_hw_version(self) -> str:
        if ctrl().is_dispensing:
            sleep(5)
            return self.get_mcb_hw_version()

        # return str(ctrl().board.read_firmware_version()) todo: currently status service collides with status sync service. We'll fix it later
        return "2.7"

    def __get_sbc_sw_version(self):
        return "SBC_SW_Version_1.0"

    def get_sbc_hw_version(self):
        return "SBC_HW_Version_1.0"

    def __get_motor_sw_version(self):
        return "Motor_SW_Version_1.0"

    def __get_motor_hw_version(self):
        return "Motor_HW_Version_1.0"

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance


def system_info():
    return SystemInfo.get_instance()
