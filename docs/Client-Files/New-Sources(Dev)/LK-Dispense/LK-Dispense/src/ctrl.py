from src.database.enums.tissue_type import TissueType

from src.ui_application.screens.router import router
from config import config
from src.board_controller import BoardController
from src.logger import getLogger
logger = getLogger(__name__)

class TOFSensorNotAvailble(Exception):
    "Raised when the Tof value is more than 285 or invalid"
    pass

class Ctrl:
    _instance = None

    IS_BOARD_CONNECTED = False

    OBJECT_DETECTED = 0
    NO_OBJECT_DETECTED = 1
    
    # keeps track of next step to produce 1 complete count of dispense sheet.
    DISPENSING_STEP_COMPLETED = 0
    # DISPENSE_SHEETS_COUNT :int = 0

    is_dispensing = False

    def __init__(self):
        self.board = BoardController()
        self.selected_sheet: TissueType | None = None
        self.answer : str | None = None
        self.question_id: int | None= None
        self.qoute_id :int | None= None
        self.user_id  : str | None = None
        self.is_active:bool = False

    def read_optical_sensors(self, sheet, sensor):
        pac = self.board.read_status(cmd=0x02)
        offset = 2 if sheet == "scented" else 0

        if pac is None :
            return pac
        
        if sensor == "bottom":
            return (pac[1] >> (offset + 1)) & 1
        else:
            return (pac[1] >> offset) & 1

    def trigger_dispense(self):
        """
        Triggers dispense routine It includes checks and proper handling of counting
        this function return true if dispensing is started false if it is not either on error or on hardware false 
        """
        from src.sync_service.commons import trigger_status
        """
        check and dispense

        """
        if not config().hardware_attached:
            logger.warning(f"Dispense was triggered but Hardware was not required {config().hardware_attached=}")
            return

        try :
            tof = self.board.read_tof_sensor(self.tissue_index)

            if tof is None:
                raise 

            if tof > 285 :  # error 291
                raise TOFSensorNotAvailble

            if tof > 230:  # low quantity
                logger.warning(f"Low inventory detected, showing out of order... `{tof}`")
                trigger_status()
                router().show_out_of_order()
                return

        except TOFSensorNotAvailble :
                logger.warning(f"Invalid value received from TOF sensor `{tof}`")
                logger.warning("Continuing dispense regardless of TOF sensor value")

        except Exception as e:
            logger.error(f"Exception occurred reading value from TOF sensor. {e}")
            logger.warning("Continue dispense regardless of TOF sensor value")

        result = self.perform_checks()

        if not result:
            trigger_status()
            router().show_out_of_order()
            return

        # added reset command here just to make sure that the board always send appropriate values after motor is
        # started from recent logs 4th Oct 2024 we found that sometimes board does not show ANY data after starting
        # motor There are 2 cases which may cause above error: 1. Motor could not grab sheets 2. Motor was able to
        # grab sheets but couldn't send TOF data.
        # ctrl().board.reboot_device()
        # though after testing, we see that one device (in office) works fine, but not the one which is at
        # technicians office.
        # Brad asks to remove reboot device

        logger.success('starting motor')
        self.board.set_motor_speed(self.selected_sheet, 100)

        from src.dispense_handler import DispenseRoutine
        t = DispenseRoutine(self.board, self.DISPENSING_STEP_COMPLETED)
        t.daemon =True
        t.start()

    def perform_checks(self) -> bool:

        d = self.board.read_motor_status(self.tissue_index)
        logger.debug("motor status :",d)

        # garbage data
        if d is None: 
            logger.error(f"Motor status was {d}")
            return False

        # Motor was stuck as bit was 1
        if d[0]:
            logger.error(f"Motor was Stuck...{d}")
            return False
        
        if d[1]:
            logger.warning(f"Motor was running... {d}")

        optical_value = self.read_optical_sensors(self.selected_sheet, "top")

        if optical_value is None:
            logger.error("Optical sensor returned None")
            return False
         
        if optical_value == self.OBJECT_DETECTED :
            # self.DISPENSE_SHEETS_COUNT = 1
            self.DISPENSING_STEP_COMPLETED = 1
            logger.warning("Sheet already detected in top sensor, before starting motor.")
        else:
            # self.DISPENSE_SHEETS_COUNT = 0
            self.DISPENSING_STEP_COMPLETED = 0

        return True

    def try_connect_board(self):
        "try to connect to board on boot othwise show out of order"
        if not config().hardware_attached:
            return True

        if not self.IS_BOARD_CONNECTED:
            self.IS_BOARD_CONNECTED = self.board.connect()

            # run on connected
            if not self.IS_BOARD_CONNECTED:
                return False

        return True

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def tissue_index(self):
        return 1 if self.selected_sheet == TissueType.SCENTED.value else 0

def ctrl():
    return Ctrl.get_instance()