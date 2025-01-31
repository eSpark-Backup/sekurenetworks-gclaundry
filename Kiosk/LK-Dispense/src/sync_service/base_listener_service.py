import threading

import paho.mqtt.client as mqtt
from paho.mqtt.client import MQTTMessage

from config import config
from src.logger import getLogger

logger = getLogger(__name__)


class BaseListenerService(threading.Thread):

    def __init__(self, name, topic):
        super().__init__(name=name, daemon=True)
        self.client = mqtt.Client()
        self.client.username_pw_set(config().mqtt_username, config().mqtt_password)
        self.topic = topic
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_publish
        self.client.on_disconnect = self.on_disconnect

    def run(self):
        try:
            self.client.connect(config().host, config().port)
        except Exception as e:
            logger.error(f"Error connecting to MQTT broker: {e}")
        self.client.loop_forever()

    def on_connect(self, *args):
        if self.client.is_connected() and self.topic is not None:
            logger.success(f"{self.topic} is connected")
            self.client.subscribe(self.topic)
        else:
            logger.error(f"Tried to connect without topic")

    def on_disconnect(self, *args):
        logger.warning(f"{self.name} is disconnected")

    def on_publish(self, client, userdata, msg: MQTTMessage):
        pass
