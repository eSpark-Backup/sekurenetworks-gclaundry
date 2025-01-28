import json
from typing import Any

from src.database.models.kiosk_info import KioskInfo_V4
from src.database.models.quotes_v4 import Quotes_V4
from src.database.models.survey_v4 import Survey_V4
from src.database.models.user import User
from src.logger import getLogger
from src.sync_service.status_sync_service import StatusSyncService
from src.sync_service.transaction_sync_service import TransactionSyncService
from src.sync_service.enums.topics import Topics

#from src.sync_service.user_listener_service import refresh_UserService_topic

logger = getLogger(__name__)

def trigger_status():
    StatusSyncService.FORCE_TRIGGER.set()
    TransactionSyncService.FORCE_TRIGGER.set()


def replace_survey(data: list[dict[str, Any]]):
    Survey_V4.delete().execute()
    for survey in data:
        Survey_V4.insert(
            id=survey["id"],
            question=survey["question"],
            options=json.dumps(survey["options"]),
        ).on_conflict_replace().execute()
    logger.debug(f"Updated survey")




def replace_quotes(data: list[dict[str, Any]]):
    Quotes_V4.delete().execute()
    for qoute in data:
        Quotes_V4.insert(
            id=qoute["id"],
            quote=qoute["quote"],
        ).on_conflict_replace().execute()
    logger.debug(f"Updated quotes")

def replace_users(users):
    User.delete().execute()
    for user in users:
        User.insert(
            id=user["id"],
            email=user["email"],
            password=user["password"],
            student_id = "1234",                   #student_id = user["student_id"],
            phone_number = "123456789",            #phone_number = user["phone_number"],
        ).on_conflict_replace().execute()
    logger.debug(f"Updated user")
        
def update_config(data: dict[str, Any]):
    from src.sync_service.user_listener_service import UserListenerService
    UserListenerService.update_topic(topic=data["customerId"])
    KioskInfo_V4.insert(
        id=0,
        sheets_per_transaction=data["sheets_per_transaction"],
        answer_required=data["answer_required"],
        screen_sequence=json.dumps(data["screen_sequence"]),
        app_type=data["type"],
        customer_id=data["customerId"],
    ).on_conflict_replace().execute()