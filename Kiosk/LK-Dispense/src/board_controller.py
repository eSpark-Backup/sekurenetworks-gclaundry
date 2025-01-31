import glob
import subprocess
import time

import serial

from config import config
from src.logger import getLogger

logger = getLogger(__name__)


class BoardController():

    def __init__(self):
        super().__init__()
        self._ser = None

    def connect(self):
        for path in glob.glob(config().serial_port):
            try:
                self._ser = serial.Serial(port=path, timeout=.2)
                logger.log(f"Found a controller board port - {path}")
                return True
            except Exception as e:
                logger.error(f"Failed to connect to serial({path})")
                self._ser = None
        logger.error(f"No path found in {config().serial_port}")
        return False

    def read_status(self, cmd):
        r = self.__send_cmd(cmd=bytes([0x06, cmd]))
        if isinstance(r, bytes) and len(r) > 2 and r[0] == cmd:
            return r[1:3]

    def read_tof_sensor(self, index=1):
        data = self.read_status(cmd=0x03 if index == 1 else 0x04)
        if data:
            return data[0] * 256 + data[1]

    def read_temperature(self):
        data = self.read_status(cmd=0x0B)
        if data:
            return data[1]

    def read_motor_current(self, index=1):
        data = self.read_status(0x0C if index == 1 else 0x0D)
        if data:
            return data[0] * 256 + data[1]

    def set_motor_speed(self, mode, speed):
        cmd = bytes([0x07 if mode == 'scented' else 0x08, speed])
        self.__send_cmd(cmd)

    def read_firmware_version(self):
        r = self.read_status(cmd=0x09)
        if r:
            return f"{r[1] // 16}.{r[1] % 16}"

    def read_motor_status(self, index) -> tuple[bool, bool] | None:
        """returns bool , bool first is for stuck second for motor start/stop"""

        __l_stuck_index = 0
        __l_stop_index = 1
        __r_stuck_index = 2
        __r_stop_index = 3
        if d := self.read_motor_status_all() :
            return (d[__l_stuck_index], d[__l_stop_index]) if index == 1 else (d[__r_stuck_index], d[__r_stop_index])

    def read_motor_status_all(self):
        """
        returns:
            is scented stuck, is scented running
            is unscented stuck, is unscented running
        """
        __l_stop_bit = 0
        __l_stuck_bit = 1
        __r_stop_bit = 4
        __r_stuck_bit = 5
        if r := self.read_status(cmd=0x05):
            return [(r[1] >> bit) & 1 == 1 for bit in (__l_stuck_bit, __l_stop_bit, __r_stuck_bit , __r_stop_bit)]

    def read_door_status(self):
        if (r := self.read_status(0x01)):
            return (r[1] >> 6) & 1 == 1

    def reboot_device(self):
        self.__send_cmd(cmd=bytes([0x0E]))

    def update_firmware(self, path):
        self.read_status(cmd=0x0A)
        time.sleep(.5)
        p = subprocess.Popen(f"dfu-util -a 0 -s 0x08010000 -D {path} -R", shell=True,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = p.communicate()
        logger.log(f"Firmware update : {stdout}\n\t{stderr}")

    def __send_cmd(self, cmd):
        try:

            if self._ser is None:
                if not self.connect():
                    raise RuntimeError("connection was not possible")
            assert self._ser is not None, "Serial connection was not present"

            logger.log(f"Writing to board - `{cmd}`")

            self._ser.write(cmd)
            if cmd[0] == 0x06:  # Controller Status
                time.sleep(.1)
                buf = self._ser.readline()
                logger.log(f">>> Read from board - `{buf}`")
            return buf if cmd[0] == 0x06 else None

        except Exception as e:
            logger.error(f"Failed to send CMD({cmd}) - {e}")
            self._ser = None

    def stop(self):
        if self._ser is not None:
            self._ser.close()


if __name__ == '__main__':

    def on_message(msg):
        logger.debug(f"Message received from the CTRL board - {msg}")


    _ctrl = BoardController()

    while True:
        try:
            time.sleep(.1)
        except KeyboardInterrupt:
            break
    _ctrl.stop()
