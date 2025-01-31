import json
from typing import Self

from paho.mqtt.client import MQTTMessage

from src.database.retrieval import get_owner_id
from src.logger import getLogger
from src.sync_service.commons import replace_users
from src.sync_service.enums.topics import Topics
from src.sync_service.base_listener_service import BaseListenerService

logger = getLogger(__name__)

class UserListenerService(BaseListenerService):
    _instance = None

    def __init__(self):
        owner_id = get_owner_id()
        super().__init__("UserListenerService", Topics.get_user_service_topic(owner_id))
        self._instance = self


    def on_publish(self, client, userdata, msg: MQTTMessage):
        logger.debug(
            f"Received payload :{userdata=}, {msg=}, {msg.info=}, {msg.payload=}, {msg.properties=}"
        )
        try:
            data = json.loads(msg.payload.decode())
            replace_users(data)
        except Exception as e:
            logger.error(f"Exception occurred, {msg.payload}, {e}")
            
    @classmethod
    def get_instance(cls) -> Self:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def update_topic(cls, topic: str | None) -> Self:
        self = cls.get_instance()       
        if topic is not None and self.topic != topic:
            logger.log(f"Change topic from {self.topic} to {topic}")
            self.client.unsubscribe(self.topic) 
            self.client.subscribe(topic) 
            self.topic = topic
        return self
