import json
import time
from datetime import datetime
from typing import Any

from src.database.enums.tissue_type import TissueType
from src.database.enums.transaction_type import Status
from src.database.models.transaction import Transaction_v5
from src.logger import getLogger
from src.sync_service.enums.topics import Topics
from src.sync_service.base_sync_service import BaseSyncService
from src.sync_service.system_info import system_info
from src.database.retrieval import get_quotes_flag, get_surveys_flag

logger = getLogger(__name__)


class TransactionSyncService(BaseSyncService):

    def __init__(self):
        """
        This Thread is responsible to send Dispense transaction data to portal.
        It takes all the values from database with where Flag "Uploaded" is false
        Uploads data to server via MQTT.
        After successful update, it makes "Uploaded" flag to false.
        """
        super().__init__(name="TransactionSync")

    def do_action(self):
        updated_rows = Transaction_v5.select().where(Transaction_v5.updatedToPortal == False)
        # logger.debug(f"Transaction data to be uploaded: {updated_rows}")
        if not updated_rows:
            return

        list_payload = [
            self.generate_payload(
                no_of_sheets=data.qty,
                sheet_type=data.tissue_type,
                status=data.status,
                question_id=str(data.questionid),
                question_id2 = str(data.questionid2),
                answer=data.answer,
                answer2=data.answer2,
                # questions_with_answers=data.questionid,
                created_at=data.created_at,
                error=data.error,
                quote_id=str(data.qouteid),
                user_id=str(data.user_id),
                mac_id=system_info().get_mac()
            )
            for data in updated_rows
        ]

        try:
            request = self.client.publish(
                topic=Topics.TRANSACTION_NEW,
                payload=json.dumps(list_payload),
                qos=2,
            )
            request.wait_for_publish(20)

            if request.is_published():
                for data in updated_rows:
                    logger.info("Transaction service triggered")
                    logger.debug(f"Pushed Transaction data : {json.dumps(list_payload)}")
                    data.updatedToPortal = True
                    data.save()
                    logger.debug("Transaction In DB updated")

        except RuntimeError as e:
            logger.error(f"Exception upload transaction: {e=}")

    def generate_payload(
            self,
            no_of_sheets: int,
            sheet_type: TissueType,
            status: Status,
            question_id: int | None,
            question_id2: int | None,
            answer: str | None,
            answer2: str | None,
            # questions_with_answers: list[dict[str, Any]],
            created_at: datetime,
            mac_id: str,
            quote_id: str | None,
            user_id= str | None,
            error: str | None= "",
    ) -> dict[str, Any]:
        """
        Generate payload for server
        """
        payload = {
            "kioskId": mac_id,
            "tissueType": sheet_type,
            "quantity": no_of_sheets,
            "status": status,
            # "questionId": question_id,
            # "selectedAnswer": answer,
            # "quoteId": quote_id,
            "error": error,
            # "userId": user_id,
            "time": time.mktime(created_at.timetuple()),
            "questionsWithAnswers":[],
        }

        if get_quotes_flag():  # Only add quoteId if get_quotes_flag() returns True
            payload["quoteId"] = quote_id

        if get_surveys_flag():
            if question_id and answer:
                payload["questionsWithAnswers"].extend([
                    {"questionId": question_id, "answer": answer},
                    {"questionId": question_id2, "answer": answer2}
            ])
        else:
            payload["questionsWithAnswers"].extend([
                {"questionId": question_id, "answer": answer},
                # {"questionId": "", "answer": ""}
            ])

        return payload
