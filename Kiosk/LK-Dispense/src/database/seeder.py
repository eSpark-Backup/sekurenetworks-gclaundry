from config import config
from src.database.models.kiosk_info import KioskInfo_V4
from src.database.models.quotes_v4 import Quotes_V4
from src.database.models.survey_v4 import Survey_V4
from src.logger import getLogger

logger = getLogger(__name__)

class Seeder:
    _instance = None

    # Seeds only those tables which are found empty
    def seed(self):
        self.seed_survey()
        self.seed_quote()
        self.seed_config()

    def seed_survey(self):
        count = Survey_V4.select().count()
        if count > 0:
            return

        data = [
            {
                "id": None,
                "question": "How much energy is saved using cold versus hot water?",
                "options": '[{"option":"27%","is_valid":false},{"option":"66%","is_valid":false},{"option":"50%","is_valid":false},{"option":"93%","is_valid":true}]',
            },
            {
                "id": None,
                "question": "Which stains are better removed with cold water?",
                "options": '[{"option":"Food","is_valid":false},{"option":"Blood","is_valid":false},{"option":"Beverage","is_valid":false},{"option":"All of the above","is_valid":true}]',
            },
            {
                "id": None,
                "question": "What fabrics are best preserved by using a drying rack (air dry) instead of a dryer cycle?",
                "options": '[{"option":"Knitted/Woven fabrics (sweaters, cardigans, wool)","is_valid":false},{"option":"Leather, Suede, Faux Leather, Natural or Faux Fur","is_valid":false},{"option":"Silk, Lingerie, Delicate Fabrics, Spandex/Lycra","is_valid":false},{"option":"All of the above","is_valid":true}]',
            },
        ]

        for survey in data:
            Survey_V4.create(question=survey["question"], options=survey["options"])
            # Survey_V4.create(question2=survey["question2"], options2=survey["options2"])
        logger.log("Seeding performed for survey")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def seed_quote(self):
        count = Quotes_V4.select().count()
        if count > 0:
            return

        qoutes = [
            {
                "id": None,
                "quote": "If 2 out of 3 people refill Generation Conscious sheets instead of using pods or liquid detergent then we can achieve a 45% carbon reduction pathway in the laundry detergent category",
            },
            {
                "id": None,
                "quote": "Hygiene Security: Did you know 1 in 5 U.S. citizens cuts back on food to buy hygiene products",
            },
            {
                "id": None,
                "quote": 'Eco-Classism is where "sustainable" products are only accessible to upper-middle class people.',
            },
            {
                "id": None,
                "quote": "Zero Waste Eliminating packaging and water from laundry detergent can avoid 50-70% of total carbon emissions",
            },
            {
                "id": None,
                "quote": "Economic Justice Generation Conscious recycles the revenue they generate into 150+ Fellowships for First-Generation Low Income students. Every year, they grant 1% equity to FGLI students.",
            }
        ]

        for quote in qoutes:
            Quotes_V4.create(id=quote["id"], quote=quote["quote"])
        logger.log("Seeding performed for quotes")

    def seed_config(self):
        if KioskInfo_V4.select().count() == 0:
            KioskInfo_V4.create(
                id=0,
                answer_required=False,
                app_type="OPEN",
                sheets_per_transaction=config().sheets_per_transaction,
                screen_sequence='["WelcomeScreen", "SelectScreen", "SurveyScreen", "QuotesScreen"]',#json
                customer_id=None
            )

def seeder() -> Seeder:
    return Seeder.get_instance()