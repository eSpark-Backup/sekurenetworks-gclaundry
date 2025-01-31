from typing import Callable
from PyQt5.QtCore import pyqtSignal, QObject
from PyQt5 import QtWidgets


class Router(QObject):

    _instance = None
    out_of_order = pyqtSignal()

    def __init__(self, parent: QObject | None = None) -> None:
        super().__init__(parent)
        self.window = QtWidgets.QApplication.topLevelWidgets()[0]
        self.out_of_order.connect(self.window.to_out_of_order_screen)

    def show_out_of_order(self):
        self.out_of_order.emit()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

router:Callable[[], Router] = Router.get_instance