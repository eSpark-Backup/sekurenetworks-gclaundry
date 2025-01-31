#################################################################
#  this class is created to test messages to and from the motor
#  controller board without starting the complete application
# To use
"""
from _board_controller import BoardController
ctrl = BoardController().es()
"""
#################################################################
import glob
import subprocess
import time

import serial

from src.logger import getLogger
logger = getLogger(__name__)

class BoardController():
    _instance = None

    def __init__(self):
        super().__init__()
        self._ser = None

    # emergency stop
    def es(self):
        self.connect()
        self.set_motor_speed('scented', 0)
        self.set_motor_speed('unscented', 0)

    def connect(self):
        for path in glob.glob('/dev/ttyACM*'):
            try:
                self._ser = serial.Serial(port=path, timeout=.2)
                logger.log(f"Found a controller board port - {path}")
                return True
            except Exception as e:
                logger.error(f"Failed to connect to serial({path})")
                self._ser = None
        logger.error(f"No path found in /dev/ttyACM*")
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

    def read_optical_sensor(self):
        msg = self.read_status(cmd=0x02)
        packets = [msg[i:i + 3] for i in range(0, len(msg), 3)]
        packets = [p for p in packets if len(p) == 3]
        print(packets)
        # offset = 2 if self.selected_sheet == 'scented' else 0
        # bottom_sensor = (pac[2] >> (offset + 1)) & 1
        # top_sensor = (pac[2] >> offset) & 1

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
        if self._ser is not None or self.connect():
            try:
                logger.log(f"Writing to board - `{cmd}`")
                self._ser.write(cmd)
            except Exception as e:
                logger.error(f"Failed to send command to the controller - {e}")
                self._ser = None
            if cmd[0] == 0x06:  # Controller Status
                time.sleep(.1)
                buf = self._ser.readline()
                logger.log(f">>> Read from board - `{buf}`")
        return buf if cmd[0] == 0x06 else None

    def stop(self):
        if self._ser is not None:
            self._ser.close()
