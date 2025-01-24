import threading

from config import config
from src.ctrl import ctrl
from src.database.retrieval import get_qoute
from src.logger import getLogger
logger = getLogger(__name__)
from src.ui_application.screens.base_screen import BaseScreen
from src.ui_application.ui.ui_dispense import Ui_DispenseScreen

import time

class QuotesScreen(BaseScreen):

    def __init__(self, container):
        super().__init__(container)
        ui_dispense = Ui_DispenseScreen()
        ui_dispense.setupUi(self)
        self.screen_time.next_screen(container.to_next_screen,self.container.get_screen_timeout(self))
        ctrl().qoute_id , qoute = get_qoute()
        ui_dispense.label.setText(qoute)
    
    def mousePressEvent(self,*args):
        if not self.container.is_last_screen(self):
            logger.info("User Interacted going to next screen...",args)
            self.container.to_next_screen()