#########################################################################################
# Application Name: Gencolk Laundry Kiosk
# Description: Laundry Kiosk Embedded application
# Version: 0.0.1

import sys
import threading

from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QApplication

from config import config
from src.ctrl import ctrl
from src.database.migration import Migration
from src.database.seeder import seeder

from src.logger import getLogger

from src.sync_service.check_in_service import CheckInService
from src.sync_service.config_listener_service import ConfigListenerService
from src.sync_service.qoute_listener_service import QuoteListenerService
from src.sync_service.status_sync_service_old import StatusSyncServiceOld
from src.sync_service.survey_listener_service import SurveyListenerService
from src.sync_service.status_sync_service import StatusSyncService

from src.ota_service.updater import OtaService
from src.sync_service.alive_service import AliveService
from src.sync_service.transaction_sync_service import TransactionSyncService
from src.sync_service.user_listener_service import UserListenerService
from src.sync_service.version_info_sync import VersionInfoSync
from src.ui_application.container import Container

logger = getLogger(__name__)


class Kiosk:

    def __init__(self):
        # run migration
        Migration.up()
        seeder().seed()

        # REST data updater
        CheckInService().start()
        
        # REST telemetry
        # reads from board
        VersionInfoSync().start()

        # MQTT Listeners
        SurveyListenerService().start()
        QuoteListenerService().start()
        ConfigListenerService().start()
        UserListenerService().start()

        # MQTT telemetry
        TransactionSyncService().start()
        # reads from board
        StatusSyncService().start()

        # Todo : To remove in phase 2 of project.
        AliveService().start()
        # StatusSyncServiceOld().start()

        # AUTO Updater
        # OtaService().start()

        # thread = threading.Thread(target=check_usb)
        # thread.daemon = True
        # thread.start()
        # verify_service.start()

        # try to connect at the time of application start
        # ctrl().try_connect_board()

        logger.log("Starting QT application")
        qt_app = QApplication(sys.argv)
        window = Container()
        window.setFixedSize(1280, 800)
        window.setWindowFlags(Qt.FramelessWindowHint)
        window.setWindowTitle('Main Window')
        window.resize(1280, 800)  # Set the initial size of the main window
        window.move(0, 0)
        # window.show()
        window.showMaximized()
        logger.log("QT application started successfully")
        qt_app.exec_()


if __name__ == "__main__":
    Kiosk()
