import os
import sys
import time

from config import config
from src.ctrl import ctrl
from src.database.enums.tissue_type import TissueType
from src.logger import getLogger
logger = getLogger(__name__)

from src.sync_service.commons import trigger_status
from src.ui_application.screens.base_screen import BaseScreen
from src.ui_application.stylesheet.button_styles import ButtonStyles
from src.ui_application.ui.ui_select_screen import UI_Select_Screen

# Add the parent directory of 'ui' to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '../..')
sys.path.append(parent_dir)

class SelectScreen(BaseScreen):

    def __init__(self, container):
        super().__init__(container)

        self.screen = UI_Select_Screen()
        self.screen.setupUi(self)

        self.screen_time.next_screen(self.container.to_welcome_screen)

        self.screen.btn_scented.clicked.connect(lambda: self.select_button(self.screen.btn_scented))
        self.screen.btn_unscented.clicked.connect(
            lambda: self.select_button(self.screen.btn_unscented))

        self.screen.btn_dispense.clicked.connect(lambda: self.may_be_dispense())
        self.screen.btn_dispense.setCheckable(True) # to make color apear on checked

    def mousePressEvent(self, event):
        ctrl().is_active = True
        # Switch to the second screen when the mouse is clicked anywhere
        if not ctrl().try_connect_board():
            self.container.to_out_of_order_screen(True)
        else:
            # self.reset_timeout
            logger.log(f"Screen timer reset!")
            self.screen_time.hold_screen_for_timeout()

    def may_be_dispense(self):
        self.screen.btn_dispense.setDisabled(True)
        if config().hardware_attached:
            for i in range(2):
                # first try to read tof sensor to view if it's correct
                try:

                    selected_sheet = ctrl().selected_sheet
                    board = ctrl().board

                    if (
                        (selected_sheet == TissueType.SCENTED.value and (board.read_tof_sensor(1) < 230 or board.read_tof_sensor(1) > 285 )) or
                        (selected_sheet == TissueType.UNSCENTED.value and (board.read_tof_sensor(0) < 230 or board.read_tof_sensor(0) > 285 ))
                    ):
                        logger.success("TOF reading successful going to next screen")
                        self.container.to_next_screen()
                    else:
                        logger.warning("Sheets quantity is less than minimum quantity")
                        trigger_status()
                        self.container.to_out_of_order_screen()
                    break  # break if reading was fine.
                except:
                    logger.warning('Invalid value received from tof sensor')
                    if i == 0:
                        logger.warning('sending reset command')
                        ctrl().board.reboot_device()
                        time.sleep(0.5)
                    else:
                        logger.error("TOF reading successful invalid. Showing next screen anyways")
                        self.container.to_next_screen()
        else:
            self.container.to_next_screen()

    def select_button(self, button):
        # Reset style for both buttons
        self.screen_time.hold_screen_for_timeout(config().screen_timeout)

        # first set both as unselected
        self.screen.btn_scented.setStyleSheet(ButtonStyles.unselected())
        self.screen.btn_unscented.setStyleSheet(ButtonStyles.unselected())

        # Set the selected button to white color
        button.setStyleSheet(ButtonStyles.selected())

        ctrl().selected_sheet = TissueType.SCENTED.value if TissueType.SCENTED.value == button.text().lower() else TissueType.UNSCENTED.value

        # Show the DISPENSE button when either SCENTED or UNSCENTED is selected
        self.screen.btn_dispense.setVisible(True)
