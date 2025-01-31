import json

from paho.mqtt.client import MQTTMessage

from src.logger import getLogger
from src.sync_service.commons import replace_survey
from src.sync_service.enums.topics import Topics
from src.sync_service.base_listener_service import BaseListenerService
from src.sync_service.check_in_service import CheckInService

logger = getLogger(__name__)


class SurveyListenerService(BaseListenerService):

    def __init__(self):
        super().__init__(name="SurveyListener", topic=Topics.SURVEY)

    def on_publish(self, client, userdata, msg: MQTTMessage):
        logger.debug(f"Received payload :{userdata=}, {msg=}, {msg.info=}, {msg.payload=}, {msg.properties=}")

        try:
            json.loads(msg.payload.decode())
            # replace_survey(data)
            CheckInService().get_data()

        except Exception as e:
            logger.error(f"Exception occurred, {msg.payload}, {e}")
