import threading
import time

import paho.mqtt.client as mqtt

from config import config
from constants import SYNC_INTERVAL
from src.logger import getLogger

logger = getLogger(__name__)


class BaseSyncService(threading.Thread):
    FORCE_TRIGGER = threading.Event()

    def __init__(self, name):
        super().__init__(name=name, daemon=True)
        self.client = mqtt.Client()
        self.client.username_pw_set(config().mqtt_username, config().mqtt_password)
        self.client.on_disconnect = self.on_disconnect
        self.client.on_connect = self.on_connect
        self.is_connected = False
        self.connect()

    def run(self):
        t = 1000 # high initial value to trigger first time

        while 1:
            # we are using both flags because with single flag the output was random and data loss was possible.
            if t >= SYNC_INTERVAL or self.FORCE_TRIGGER.is_set():
                if not (self.is_connected and self.client.is_connected()):
                    self.connect()

                self.do_action()

                self.FORCE_TRIGGER.clear()
                t = 0
            t += 1

            time.sleep(1)

    def do_action(self):
        pass

    def on_disconnect(self, *args):
        logger.error(
            f"{self.name} Sync Service was disconnected. Waiting for connection..."
        )
        self.is_connected = False
        self.connect()

    def on_connect(self, client, userdata, rc, *args):
        if self.client.is_connected():
            logger.success(f"{self.name} Sync Service connected...")
            self.is_connected = True

    def connect(self):
        try:
            self.client.connect(
                config().host, config().port,
                keepalive=10  # it is ping/s
            )
            self.client.loop_start()
        except Exception as e:
            logger.error(f"{self.name} Sync Service could not connect {e=}")

        if self.client.is_connected():
            logger.info(f"{self.name} sync service, connected...")
            self.is_connected = True
        else:
            logger.error(f"{self.name} Sync Service could not connect....")
