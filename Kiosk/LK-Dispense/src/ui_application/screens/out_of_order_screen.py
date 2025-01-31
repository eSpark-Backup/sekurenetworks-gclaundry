from src.ui_application.screens.base_screen import BaseScreen
from src.ui_application.ui.ui_out_of_order import Ui_OutOfOrderScreen


class OutOfOrderScreen(BaseScreen):
    container = None

    def __init__(self, container, show_comm):
        super().__init__(container)
        ui_out_of_order = Ui_OutOfOrderScreen()
        ui_out_of_order.setupUi(self, show_comm)
        self.screen_time.next_screen(container.to_welcome_screen)
        ui_out_of_order.btn_thankyou.clicked.connect(container.to_welcome_screen)
