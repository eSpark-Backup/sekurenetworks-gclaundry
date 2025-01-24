from PyQt5.QtWidgets import QWidget

from src.ui_application.screen_time import ScreenTime
from src.logger import getLogger

logger = getLogger(__name__)


class BaseScreen(QWidget):

    def __init__(self, container):
        super().__init__(container)
        self.screen_time = ScreenTime()
        self.container = container
