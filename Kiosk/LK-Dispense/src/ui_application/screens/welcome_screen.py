from config import config
from src.ctrl import ctrl
from src.ui_application.screens.base_screen import BaseScreen
from src.ui_application.ui.ui_welcome import UI_welcome


class WelcomeScreen(BaseScreen):

    def __init__(self, container):
        super().__init__(container)
        ui_dispense = UI_welcome()
        ui_dispense.setupUi(self)
        ctrl().is_active = False
  
    def mousePressEvent(self, event):
        ctrl().is_active = True
        # Switch to the second screen when the mouse is clicked anywhere
        if not ctrl().try_connect_board():
            self.container.to_out_of_order_screen(True)
        else:
            self.container.to_next_screen()