import json

from paho.mqtt.client import MQTTMessage

from src.logger import getLogger
from src.sync_service.commons import replace_quotes
from src.sync_service.enums.topics import Topics
from src.sync_service.base_listener_service import BaseListenerService

logger = getLogger(__name__)


class QuoteListenerService(BaseListenerService):

    def __init__(self):
        super().__init__("QuoteSyncService", Topics.QOUTES)

    def on_publish(self, client, userdata, msg: MQTTMessage):
        logger.debug(
            f"Received payload :{userdata=}, {msg=}, {msg.info=}, {msg.payload=}, {msg.properties=}"
        )
        try:
            data = json.loads(msg.payload.decode())
            replace_quotes(data)
        except Exception as e:
            logger.error(f"Exception occurred, {msg.payload}, {e}")
