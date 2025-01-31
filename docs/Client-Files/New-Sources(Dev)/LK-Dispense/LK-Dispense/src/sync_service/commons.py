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
        if survey["isActive"] is True:
            Survey_V4.insert(
                id=survey["id"],
                question=survey["question"],
                options=json.dumps(survey["options"]),
            ).on_conflict_replace().execute()
        else:
            logger.debug(f"Survey is not active")
    logger.debug(f"Updated survey")


def replace_quotes(data: list[dict[str, Any]]):
    Quotes_V4.delete().execute()
    for qoute in data:
        if qoute["isActive"] is True:
            Quotes_V4.insert(
                id=qoute["id"],
                quote=qoute["quote"],
            ).on_conflict_replace().execute()
        else:
            logger.debug(f"Quote is not active")
    logger.debug(f"Updated quotes")

def replace_users(users):
    User.delete().execute()
    for user in users:
        User.insert(
            id=user["id"],
            email=user["email"],
            password=user["password"],
            student_id = user["studentId"],                        
            phone_number = user["phone"],        
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
        auth_type = data.get("auth_type"),
        customer_id=data["customerId"],
    ).on_conflict_replace().execute()
    # Check if 'auth_type' is missing
    if "auth_type" not in data:
        print("Missing auth_type data")
    else:
        print("auth_type value:", data["auth_type"])
