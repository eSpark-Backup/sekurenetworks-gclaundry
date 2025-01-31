import threading
import time

from src import board_controller
from src.database.enums.transaction_type import Status
from src.database.retrieval import add_transaction_telemetry, get_sheets_per_transaction, get_quotes_flag, get_qoute,get_surveys_flag
from src.logger import getLogger
logger = getLogger(__name__)

from src.sync_service.commons import trigger_status
from src.ui_application.screens.router import router
from src.ctrl import ctrl

class DispenseRoutine(threading.Thread):

    PRECAUTIONARY_STOP_MOTOR_THREAD = None
    DISPENSING_STEP_COMPLETED = 0  
    DISPENSE_SHEETS_COUNT :int = 0

    def __init__(self, board :board_controller.BoardController, dispense_steps_completed) -> None:
        super().__init__()
        self.board = board
        self.name = "DispenseRoutine"
        self.DISPENSING_STEP_COMPLETED = dispense_steps_completed
        self._b_stop_dispense = threading.Event()
        self.last_pac : bytes
        self.error_message = None
        self.status = Status.FAILED
        # self.status = Status.SUCCESS
    def run(self) -> None:
        ctrl().is_dispensing = True
        self.start_new_precuationary_thread()

        while not self._b_stop_dispense.is_set() :
            if self.board._ser is not None or self.board.connect():
                assert self.board._ser is not None 
                try :
                    buf = self.board._ser.readline()

                except Exception as e:
                    logger.error(f"Failed to read data from the controller {e}")
                    buf = None
                    self._ser = None
                    continue

                if not buf :
                    continue

                try :
                    if self.handle_dispense_count(buf):
                        logger.success("Sheets dispense completed, stopping motor")
                        self.board.set_motor_speed(ctrl().selected_sheet, 0)
                        self.status = Status.SUCCESS
                        if self.PRECAUTIONARY_STOP_MOTOR_THREAD is not None:
                            logger.debug(
                                "Stopping previous PRECAUTIONARY THREAD as the dispensing is completed"
                            )
                            self.PRECAUTIONARY_STOP_MOTOR_THREAD.cancel()  # cancel previous timer
                        break # if condition will only be true if dispensing is completed
                except Exception as e:
                    logger.error(f"Error occurred While dispensing, stopping motor {e=}")
                    self.board.set_motor_speed(ctrl().selected_sheet, 0)
                    self.error_message = f"Error during dispensing :{e}"
                    router().show_out_of_order()
                    break

            time.sleep(.1)
        # Send transaction telemetry to cloud
        
        if get_quotes_flag():
            ctrl().qoute_id , qoute = get_qoute()
        

        add_transaction_telemetry(
            qty=self.DISPENSE_SHEETS_COUNT,
            tissue_type=ctrl().selected_sheet,
            status=self.status,
            user_id=ctrl().user_id,
            error=self.error_message,
            questionid=ctrl().question_id,
            questionid2 = ctrl().question_id2,
            answer=ctrl().answer,
            answer2=ctrl().answer2,
            qoute_id=ctrl().qoute_id
        )
        ctrl().is_dispensing = False
        trigger_status()


    def handle_dispense_count(self, msg):

        logger.log(f"Message received from the CTRL board - {msg}")
        packets = [msg[i : i + 3] for i in range(0, len(msg), 3)]
        packets = [p for p in packets if len(p) == 3]

        for pac in packets:
            if not pac[0] == 0x02:  # Optical Sensor
                logger.debug(f"Read from board (discarded) {pac}")
                continue
            else:
                logger.debug(f"Read from board {pac}")

            # new_data = {f"irBreak{k}": (pac[2] >> (4 - k)) & 1 for k in range(1, 5)}
            # if self._cur_screen_name == 'dispense':
            offset = 2 if ctrl().selected_sheet == "scented" else 0
            bottom_sensor = (pac[2] >> (offset + 1)) & 1
            top_sensor = (pac[2] >> offset) & 1
            logger.debug(f"{top_sensor=} {bottom_sensor=}")
            ########################### Conditions for invalid/unexpected trigger ###########################
            if (
                top_sensor == ctrl().NO_OBJECT_DETECTED and
                bottom_sensor == ctrl().OBJECT_DETECTED
                and self.DISPENSING_STEP_COMPLETED == 0
            ):
                logger.warning(
                    f"Bottom sensor alone was trigger at {self.DISPENSING_STEP_COMPLETED}, which is not expected."
                )

                # if self.last_pac  in [0xfc,0xf3]:
                #     logger.warning("Last packet was both triggerred, so forcefuly triggered top sensor.")
                self.top_sensor_triggered()
                # else:
                #     raise RuntimeError("Exception occurred: Bottom sensor alone was triggered")

            elif (
                top_sensor == ctrl().OBJECT_DETECTED
                and bottom_sensor == ctrl().NO_OBJECT_DETECTED
                and self.DISPENSING_STEP_COMPLETED == 1
            ):
                logger.warning(
                    f"Top sensor alone was triggered at {self.DISPENSING_STEP_COMPLETED}, which is not expected."
                )
                
                # if self.last_pac  in [0xfc,0xf3]:
                #     logger.warning("Last packet was both triggerred, so forcefuly triggered bottom sensor.")
                self.bottom_sensor_triggered()

                # else:
                #     raise RuntimeError("Exception occurred: Top sensor alone was triggered")

            # in ideal condition these 2 if will become true after one another
            if (
                top_sensor == ctrl().OBJECT_DETECTED
                and bottom_sensor == ctrl().NO_OBJECT_DETECTED
                and self.DISPENSING_STEP_COMPLETED == 0
            ):
                
                self.top_sensor_triggered()
                logger.debug(
                    f"Top sensor has been triggered, awaiting bottom sensor detection {self.DISPENSING_STEP_COMPLETED=}"
                )


            elif (
                self.DISPENSING_STEP_COMPLETED == 1
                and top_sensor == ctrl().NO_OBJECT_DETECTED
                and bottom_sensor == ctrl().OBJECT_DETECTED
            ):
                logger.debug(
                    "Bottom sensor has been triggered, increasing sheet count"
                )
                self.bottom_sensor_triggered()
            else :
                logger.debug("No valid condition occurred")

            if self.DISPENSE_SHEETS_COUNT == get_sheets_per_transaction() :
                # stop motor
                return True
            
            # self.last_pac = pac[-1]
    
    def top_sensor_triggered(self):
        self.DISPENSING_STEP_COMPLETED = 1

    def bottom_sensor_triggered(self):
        self.DISPENSING_STEP_COMPLETED = 0
        self.DISPENSE_SHEETS_COUNT += 1
        self.start_new_precuationary_thread()
        logger.success(f"No. of Sheet  dispensed is {self.DISPENSE_SHEETS_COUNT}.")


    def start_new_precuationary_thread(self) -> None:  # type: ignore
        """
        Start new and cancel old one
        """
        if self.PRECAUTIONARY_STOP_MOTOR_THREAD is not None:
            logger.debug("Stoping previous PRECAUTIONARY THREAD ")
            self.PRECAUTIONARY_STOP_MOTOR_THREAD.cancel()  # cancel previous timer

        logger.debug("Starting new PRECAUTIONARY THREAD")
        self.PRECAUTIONARY_STOP_MOTOR_THREAD = threading.Timer(
            5, self.precautionary_stop_motor
        )
        self.PRECAUTIONARY_STOP_MOTOR_THREAD.name = "MOTOR SAFETY"
        self.PRECAUTIONARY_STOP_MOTOR_THREAD.start()

    def precautionary_stop_motor(self):
        logger.log("Precautionary thread, Stopping Motor...")
        self.board.set_motor_speed(ctrl().selected_sheet, 0)
        logger.log("Displaying out of order")
        self._b_stop_dispense.set()
        self.error_message = "Safety Thread Stopped the motor"
        router().show_out_of_order()

