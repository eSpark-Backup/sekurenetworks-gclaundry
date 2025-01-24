import json
import threading
import time

import paho.mqtt.client as mqtt

from config import config
from constants import ALIVE_SERVICE_INTERVAL
from src.logger import getLogger
logger = getLogger(__name__)
from src.sync_service.enums.topics import Topics
from src.sync_service.system_info import system_info


class AliveService(threading.Thread):

    def __init__(self):
        super().__init__(name="AliveService", daemon=True)
        self.client = mqtt.Client()
        self.client.username_pw_set(config().mqtt_username, config().mqtt_password)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.loop_start()

    def run(self):
        while 1 :
            try:
                self.connect(self.client)
                self.send_message(self.client)
                time.sleep(ALIVE_SERVICE_INTERVAL)
            except Exception as e:
                logger.error(f"Exception occurred {e=}")
                time.sleep(5)

    def on_disconnect(self, client, userdata, rc):
        logger.error('Alive service was disconnected. Waiting for connection...')

    def connect(self, client: mqtt.Client):
        try:
            client.connect(config().host, config().port)
        except:
            logger.error('ALIVE service could not connect, retrying connection in 5....')
    
    def on_connect(self, client: mqtt.Client, userdata, flags, rc):
        if client.is_connected():
            logger.log('Alive service, connected...')

    def send_message(self, client: mqtt.Client):
        payload = json.dumps(system_info().to_dict_alive())
        resp: mqtt.MQTTMessageInfo= client.publish(Topics.ALIVE, payload,1)
        logger.log(f"Triggered Alive service",payload)
        logger.debug("Alive sent but not acknowledged" if resp.is_published() else "Alive message acknowledged")