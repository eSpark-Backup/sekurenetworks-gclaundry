from config import config
from src.ctrl import ctrl
from src.database.retrieval import get_screen_sequence, is_answer_required, is_login_required
from src.ui_application.screens.base_screen import BaseScreen

from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QMainWindow

from src.logger import getLogger

logger = getLogger(__name__)

from src.ui_application.screens.login_screen import LoginScreen
from src.ui_application.screens.out_of_order_screen import OutOfOrderScreen
from src.ui_application.screens.quotes_screen import QuotesScreen
from src.ui_application.screens.select_screen import SelectScreen
from src.ui_application.screens.survey_screen import SurveyScreen
from src.ui_application.screens.survey_screen_1 import SurveyScreen_1
from src.ui_application.screens.welcome_screen import WelcomeScreen



class Container(QMainWindow):

    def __init__(self):
        super().__init__()
        # self.setCursor(Qt.BlankCursor)

        self.screen_callback_map = {
            "WelcomeScreen": self.to_welcome_screen,
            "SelectScreen": self.to_select_screen,
            "LoginScreen": self.to_login_screen,
            "SurveyScreen": self.to_survey_screen,
            "SurveyScreen_1": self.to_survey_screen_1,
            "QuotesScreen": self.to_quotes_screen,
            "OutOfOrderScreen": self.to_out_of_order_screen,
        }
        self.to_welcome_screen()

    def to_next_screen(self):
        """
        Display Next screen from sequence

        dispense if is_answer_required Second Last screen

        """
        sequence = get_screen_sequence()
        current_screen_name = self.centralWidget().__class__.__name__
        current_screen_idx = sequence.index(current_screen_name)  # finding idx
        logger.debug(sequence)

        #################screen logic###########################
        if current_screen_name == sequence[-1]:  # at Last screen
            next_screen_name = sequence[0]
            logger.debug(f"Going From Last Screen to first screen ")
    
        # if next screen is login and login is not required skip it 
        elif sequence[current_screen_idx + 1] == "LoginScreen" and not is_login_required() :    
            next_screen_name = sequence[current_screen_idx + 2]
            logger.debug(f"Going From {current_screen_name} to {next_screen_name} instead of login screen as login is not required")
    
        else : # general case
            next_screen_name = sequence[current_screen_idx + 1]                
            logger.log(
                f"Going From {current_screen_name} to {next_screen_name}"
            )

        # call screen constructor
        self.screen_callback_map[next_screen_name]()

        #################dispense logic###########################
        if (
            current_screen_name == sequence[-2] and not is_answer_required()
        ):  # Second Last screen
            logger.success("Answers not required and Dispensing at Second last screen")
            ctrl().trigger_dispense()

    def get_screen_timeout(self, currentScreen: BaseScreen) -> int:
        if self.is_last_screen(currentScreen):
            return config().last_screen_timeout

        return config().screen_timeout

    def is_last_screen(self, currentScreen: BaseScreen):
        sequence = get_screen_sequence()
        return currentScreen.__class__.__name__ == sequence[-1]

    def to_welcome_screen(self):
        self.setCentralWidget(WelcomeScreen(self))

    def to_select_screen(self):
        self.setCentralWidget(SelectScreen(self))

    def to_quotes_screen(self):
        self.setCentralWidget(QuotesScreen(self))

    def to_survey_screen(self):
        self.setCentralWidget(SurveyScreen(self))
    
    def to_survey_screen_1(self):
        self.setCentralWidget(SurveyScreen_1(self))

    def to_out_of_order_screen(self, show_comm=False):
        logger.log("Showing out of order !")
        self.setCentralWidget(OutOfOrderScreen(self, show_comm))

    def to_login_screen(self):
        self.setCentralWidget(LoginScreen(self))