from typing import Callable
from PyQt5.QtCore import QTimer
import os

from config import config


class ScreenTime:

    def __init__(self):
        self.__screen_time = QTimer()

    def next_screen(self, next_screen, timeout=config().screen_timeout):
        # timeout = int(config().screen_timeout)
        self.connection = self.__screen_time.timeout.connect(next_screen)
        self.__screen_time.setInterval(timeout)  # Initial interval: 5000 milliseconds (30 seconds)
        # self.__screen_time.setSingleShot(True)  # Initial interval: 5000 milliseconds (30 seconds)

        self.__screen_time.start()
        # self.__screen_time.start(timeout)

    def hold_screen_for_timeout(self, time=5000, new_func : Callable | None = None):
        if new_func is not None:
            self.__screen_time.timeout.disconnect(self.connection)
            self.connection = self.__screen_time.timeout.connect(new_func)
            self.__screen_time.setInterval(time)  # Initial interval: 5000 milliseconds (30 seconds)
        self.__screen_time.start(time)
