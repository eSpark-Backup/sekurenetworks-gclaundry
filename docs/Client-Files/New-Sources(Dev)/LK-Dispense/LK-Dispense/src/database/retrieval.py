import json
import random


from config import config
from src.database.models.kiosk_info import KioskInfo_V4
from src.database.models.quotes_v4 import Quotes_V4
from src.database.models.survey_v4 import Survey_V4
from src.database.models.transaction import Transaction_v5
from src.logger import getLogger

logger = getLogger(__name__)


def get_survey():
    survey = Survey_V4.select()
    active_data = random.choice(survey)
    question = active_data.question
    options = active_data.options
    logger.debug("Survey question: " + str(question))
    logger.debug("All Answers: " + str(options))
    id = active_data.id
    return [question, json.loads(options), id]


def get_qoute():
    qoute = Quotes_V4.select()
    qoute_list = random.choice(qoute)
    return qoute_list.id, qoute_list.quote

def get_sheets_per_transaction() -> int:
    row =  KioskInfo_V4.select().where(KioskInfo_V4.id == 0)
    if len(row) < 1 :
        sheets_per_transaction  =config().sheets_per_transaction
        logger.warning("Table is empty using config value",sheets_per_transaction)
        return sheets_per_transaction
    
    return row[0].sheets_per_transaction

def get_screen_sequence() -> list[str]:
    return json.loads(KioskInfo_V4.select().first().screen_sequence)


def is_answer_required()-> bool:
    return KioskInfo_V4.select().first().answer_required

def is_login_required()-> bool:
    return KioskInfo_V4.select().first().app_type != "OPEN"

def get_owner_id():
    return str(KioskInfo_V4.select().first().customer_id)

# def get_auth_type():
#     return KioskInfo_V4.select().first().auth_type

def add_transaction_telemetry(
    qty,
    tissue_type,
    status,
    questionid,
    answer,
    qoute_id,
    user_id=None,
    error=None,
    updatedToPortal=False
):
    Transaction_v5.create(
        qty=qty,
        user_id=user_id,
        tissue_type=tissue_type,
        status=status,
        error=error,
        updatedToPortal=updatedToPortal,
        questionid = questionid,
        qouteid= qoute_id,
        answer = answer
    ).save()
