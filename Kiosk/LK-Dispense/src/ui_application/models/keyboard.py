import subprocess
from src.logger import getLogger

logger = getLogger(__name__)

DBUS_AVAILBLE = True
try:
    import dbus
except ImportError:
    DBUS_AVAILBLE = False

NAME = "org.onboard.Onboard"
PATH = "/org/onboard/Onboard/Keyboard"
INTERFACE = "org.onboard.Onboard.Keyboard"

interface = None


class DbusNotAvailableErorr(Exception):
    pass


def get_keyboard_dbus():

    if not DBUS_AVAILBLE:
        raise DbusNotAvailableErorr("Dbus is not Not Available")

    if not interface:
        bus = dbus.SessionBus()
        onboard = bus.get_object(NAME, PATH)

    return dbus.Interface(onboard, INTERFACE)


def show_keyboard():  # slow
    logger.log("Showing the keyboard")
    # try:
    #     get_keyboard_dbus().Show()
    #     logger.log("Showing the keyboard")

    # except DbusNotAvailableErorr as e:
    #     logger.error(e)

    # except Exception as e:
    #     logger.error(e)


def hide_keyboard():
    logger.log("stating Hidding the keyboard")
    # try:
    #     logger.log("stating Hidding the keyboard")
    #     get_keyboard_dbus().Hide()
    #     logger.log("Hidded the keyboard")

    # except DbusNotAvailableErorr as e:
    #     logger.warning(e)

    # except Exception as e:
    #     logger.error(e)

def hide_keyboard_pv():
    logger.log("stating Hidding the keyboard private")
    try:
        logger.log("stating Hidding the keyboard")
        get_keyboard_dbus().Hide()
        logger.log("Hidded the keyboard")

    except DbusNotAvailableErorr as e:
        logger.warning(e)

    except Exception as e:
        logger.error(e)


def spawn_keyboard():
    if DBUS_AVAILBLE:
        logger.error(
            subprocess.run(["onboard -s 1280x300 -x 0 -y 500 -l Phone -a -m &"],shell=True).returncode
        )
        return 
    logger.warning("onbaord not available")


spawn_keyboard()
hide_keyboard_pv() # makes keyboard appear faster after startup
