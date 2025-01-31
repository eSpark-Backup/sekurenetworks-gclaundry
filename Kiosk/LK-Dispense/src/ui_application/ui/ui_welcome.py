import os
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from PyQt5.QtGui import QFontDatabase
from PyQt5.QtGui import QMovie, QPainter
from PyQt5.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QLabel,
    QHBoxLayout,
    QSpacerItem,
    QSizePolicy,
)

from config import config
from constants import BASE_DIR


class UI_welcome:

    def setupUi(self, WelcomeScreen):
 
        self.gif_holder = QtWidgets.QLabel(WelcomeScreen)
        self.gif_holder.setGeometry(QtCore.QRect(0, -50, 1280, 900))
        self.gif_holder.setText("")
        self.gif_holder.setObjectName("img")
        self.movie = QMovie(
            f"{BASE_DIR}/assets/touch_me.gif",
            parent=WelcomeScreen,
        )
        self.gif_holder.setMovie(self.movie)
        self.movie.start()

        self.version = QLabel(f"{config().version}")

        QFontDatabase.addApplicationFont(f"{BASE_DIR}/assets/OwnersXNarrow-Black.ttf")
        font = QFont()
        font.setFamily("Owners XNarrow")
        font.setPointSize(15)
        font.setBold(True)
        font.setWeight(15)

        self.version.setObjectName("version")
        self.version.setFont(font)

        # Create a layout to position the version label at the bottom right
        bottom_layout = QHBoxLayout(WelcomeScreen)
        spacer = QSpacerItem(20, 40, QSizePolicy.Expanding, QSizePolicy.Minimum)
        bottom_layout.addSpacerItem(spacer)
        bottom_layout.addWidget(self.version)

        # layout.addLayout(bottom_layout)

        # Use stylesheet to position version label at the bottom right
        self.version.setStyleSheet(
            "color: rgb(255, 0, 0);"
            "QLabel#version { margin-right: 10px; margin-bottom: 10px; }"
        )
        self.version.setAlignment(Qt.AlignRight | Qt.AlignBottom)
        self.version.setContentsMargins(0, 10, 0, 50)
