from typing import Literal
from config import config
from src.ctrl import ctrl
from src.ui_application.models.auth import  LoginResults, verify_email_password
from src.logger import getLogger

from src.ui_application.screens.base_screen import BaseScreen
from src.ui_application.ui.ui_login import Ui_Login

from src.ui_application.models.keyboard import hide_keyboard
from PyQt5 import QtCore, QtGui, QtWidgets

logger = getLogger(__name__)


class LoginScreen(BaseScreen):

    def __init__(self, container):
        super().__init__(container)

        self.screen_ = Ui_Login()
        self.screen_.setupUi(self)

        self.screen_time.next_screen(self.on_timeout)

        self.add_hooks()
        self.show_keyboard()

    def add_hooks(self) -> None:

        # textChanged clear_error_message
        self.screen_.email_input.textChanged.connect(self.clear_error_message)
        # self.screen_.password_input.textChanged.connect(self.clear_error_message)

        # textChanged reset_timeout
        self.screen_.email_input.textChanged.connect(self.reset_timeout)
        # self.screen_.password_input.textChanged.connect(self.reset_timeout)

        # textChanged password_input.setFocus
        # self.screen_.email_input.returnPressed.connect(
            # self.screen_.password_input.setFocus
        # )
        # password_input.returnPressed login
        # self.screen_.password_input.returnPressed.connect(self.login)

        self.screen_.btn_login.clicked.connect(self.reset_timeout)
        self.screen_.btn_login.clicked.connect(self.login)

    def show_keyboard(self) -> None:
        """
        Simulates the click in email input to make keyboard apear
        """
        button_center = self.screen_.email_input.rect().center()
        mouse_event = QtGui.QMouseEvent(
            QtCore.QEvent.MouseButtonPress,
            button_center,
            QtCore.Qt.LeftButton,
            QtCore.Qt.LeftButton,
            QtCore.Qt.NoModifier,
        )
        QtWidgets.QApplication.postEvent(self.screen_.email_input, mouse_event)

    @property
    def password(self) -> str:
        # return self.screen_.password_input.text()
        return ""

    @property
    def email(self) -> str:
        return self.screen_.email_input.text()

    def clear_error_message(self):
        return self.screen_.error_message.setText("")

    def show_error_message(self, text):
        return self.screen_.error_message.setText(text)

    def reset_timeout(self):
        self.screen_time.hold_screen_for_timeout()

    def on_timeout(self):
        hide_keyboard()
        self.container.to_welcome_screen()

    def valitdate_email_password(self)  -> None | Literal[True]:

        # email_validator = QtGui.QRegExpValidator(
        #     QtCore.QRegExp(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"),
        #     self.screen_.email_input,
        # )

        # state, _, _ = email_validator.validate(self.email, 0)

        # if state == QtGui.QRegExpValidator.Invalid:  # type: ignore
        #     return self.show_error_message("Invalid Email")

        # if state == QtGui.QRegExpValidator.Intermediate:  # type: ignore # On partial match
        #     return self.show_error_message("Invalid Email")
        #     # return self.screen_.error_message.setText("Enter complete email") # possible

        # if self.password == "" or not self.password:
        #     return self.show_error_message("Enter Password")

        # if len(self.password) < 8:
        #     return self.show_error_message("Password must have 8 character")

        return True
        # if state == QtGui.QRegExpValidator.Acceptable:
        #     self.screen_.error_message.setText("GOOD")

    def login(self) -> None:

        # self.container.to_next_screen()

        if not self.valitdate_email_password():
            return
        logger.info(self.email)

        result , ctrl().user_id = verify_email_password(self.email, self.password)
        
        if result == LoginResults.SuccessFullLogin:
            logger.log(f"Login successful !")
            hide_keyboard()
            return self.container.to_next_screen()

        elif result == LoginResults.IncorrectPassword:
            logger.log("Invalid credentials.")
            return self.show_error_message("Wrong Password")

        elif result == LoginResults.UserNotFound:
            logger.log("LoginResults.UserNotFound")
            return self.show_error_message("User NOT Found")

        elif result == LoginResults.Error:
            logger.error("Error during Email password verification")
            return self.container.to_out_of_order_screen()
