import json

from PyQt5 import QtCore
from PyQt5.QtGui import QFont
from PyQt5.QtWidgets import QPushButton

from src.ctrl import ctrl

from src.database.retrieval import get_survey2, is_answer_required
from src.logger import getLogger
logger = getLogger(__name__)

from src.ui_application.screens.base_screen import BaseScreen
from src.ui_application.stylesheet.button_styles import ButtonStyles
from src.ui_application.ui.ui_survey import Ui_SurveyScreen
from config import config

class SurveyScreen_1(BaseScreen):

    def __init__(self, container):
        super().__init__(container)
        # Todo: Modify all screen variables to be _screen to avoid conflict with internal variable
        self.screen = Ui_SurveyScreen()
        self.screen.setupUi(self)

        self.screen_time.next_screen(self.on_timeout_go_to_next_screen, container.get_screen_timeout(self))
        self.screen.btn_submit.setDisabled(True)

        self.answer_buttons = []
        self.selected_option = None
        self.correct_answers = []
        self.load_question_from_database()

    def load_question_from_database(self):
        logger.log("Showing Survey_1 Screen")
        survey = get_survey2()
        question_text = survey[0]
        options = survey[1]

        ctrl().question_id2 = survey[2]

        self.screen.question.setText(question_text)
        # Remove existing options
        for i in reversed(range(self.screen.verticalLayout_2.count())):
            widget = self.screen.verticalLayout_2.itemAt(i).widget()
            if widget is not None:
                widget.deleteLater()
        # Add new options
        self.answer_buttons = []
        self.correct_answers = []
        for option in options:
            btn = QPushButton(option['option'], self)
            btn.setFont(QFont("Owners XNarrow", 30))
            btn.setStyleSheet(ButtonStyles.unselected())
            btn.clicked.connect(self.on_button_clicked)
            btn.setFocusPolicy(QtCore.Qt.FocusPolicy.NoFocus)
            self.screen.verticalLayout_2.addWidget(btn)
            self.answer_buttons.append(btn)
            if "is_valid" in option and (option['is_valid'] == True or option['is_valid'] == 'true'):
                self.correct_answers.append(option['option'])
        logger.debug(f'Correct answers: {json.dumps(self.correct_answers)}')
        self.screen.btn_submit.clicked.connect(self.check_answer)

    def on_button_clicked(self):
        sender = self.sender()
        self.selected_option = sender.text()  # Store the selected option

        ctrl().answer2=self.selected_option
        

        for btn in self.answer_buttons:
            if btn == sender:
                btn.setStyleSheet(ButtonStyles.selected())
            else:
                btn.setStyleSheet(ButtonStyles.unselected())
        self.screen.btn_submit.setDisabled(False)
        self.screen_time.hold_screen_for_timeout(config().screen_timeout)
    def disable_submit(self):

        self.screen.btn_submit.setStyleSheet("QToolButton{\n"
"                                        color: rgb(255, 56, 21);\n"
"                                        background-color: rgb(255, 255, 255);\n"
"                                        border-width: 1px;\n"
"                                        border-radius: 150px 30px;\n"
"                                        }"
                                )
        self.screen.btn_submit.setDisabled(True)

    def on_timeout_go_to_next_screen(self):
        if is_answer_required() :
            logger.warning("Answer is required Going to welcomecome screen")
            self.container.to_welcome_screen()
        else:
            logger.warning("Answer is not required Going to next screen")
            self.container.to_next_screen()
    
    # this function only gets called if is survey is answered and answer was required
    def on_answer_go_to_next_screen(self):

        # for (A) => 1 ,  (B) => 1 , (C) => 0
        # for (A) => 1 ,  (B) => 1 , (C) => 1
        # if get_survey
        if is_answer_required():
            ctrl().trigger_dispense()

        if self.container.is_last_screen(self):
            self.screen_time.hold_screen_for_timeout(config().last_screen_timeout, self.container.to_next_screen)
            return

        if self.selected_option not in self.correct_answers:
            self.screen_time.hold_screen_for_timeout(5000, self.container.to_next_screen)
            return
        # for (A) => 0 ,  (B) => 0 , (C) => 1
        self.container.to_next_screen()

    def check_answer(self):
        logger.debug("checking answer")

        self.disable_submit()
        for btn in self.answer_buttons:
            btn.setDisabled(True)

        if self.selected_option in self.correct_answers: # On Right answer
            for btn in self.answer_buttons:
                if btn.text() == self.selected_option:
                    btn.setStyleSheet(ButtonStyles.correct())
            logger.debug("Answer is correct")

        else: # On Wrong answer
            logger.debug("Answer is Wrong")
            # Set the selected button to white
            for btn in self.answer_buttons:
                if btn.text() == self.selected_option:
                    btn.setStyleSheet(ButtonStyles.selected())
                elif btn.text() in self.correct_answers:
                    btn.setStyleSheet(ButtonStyles.correct())

        self.on_answer_go_to_next_screen()
