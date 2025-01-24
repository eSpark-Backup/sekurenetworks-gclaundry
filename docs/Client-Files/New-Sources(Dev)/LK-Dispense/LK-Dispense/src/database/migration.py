from src.database.models.kiosk_info import KioskInfo_V4
from src.database.models.quotes_v4 import Quotes_V4
from src.database.models.survey_v4 import Survey_V4
from src.database.models.transaction import Transaction_v5
from src.database.models.user import User
from src.logger import getLogger

logger = getLogger(__name__)


class Migration:

    @classmethod
    def up(cls):
        KioskInfo_V4.create_table()
        Transaction_v5.create_table()
        Quotes_V4.create_table()
        Survey_V4.create_table()
        User.create_table()
        logger.log("Migration has been done")

    @classmethod
    def down(cls):
        KioskInfo_V4.drop_table()
        Quotes_V4.drop_table()
        Survey_V4.drop_table()
        logger.log("Migration has been deleted")
