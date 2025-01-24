import datetime
import logging
import sys

import os
from concurrent_log_handler import ConcurrentRotatingFileHandler

from constants import (
    LOG_DIR,
    LOG_FILE_NAME,
    MAX_LOG_FILE_SIZE,
    DEBUG_LOG_FILE_NAME,
    DEBUG_LOG_BACKUP_COUNT,
    LOG_BACKUP_COUNT,
    MAX_DEBUG_LOG_FILE_SIZE,
)

logging.addLevelName(15, "SUCCESS")

class Logger(logging.Logger):
    def __init__(self, name):
        super().__init__(name)
        stdout_handler = ConcurrentRotatingFileHandler(
            LOG_FILE_NAME, maxBytes=MAX_LOG_FILE_SIZE, backupCount=LOG_BACKUP_COUNT
        )
        stdout_handler.setLevel(15)  # Log level for stdout log
        stdout_formatter = Formatter()
        stdout_handler.setFormatter(stdout_formatter)

        # Set up a separate RotatingFileHandler for the debug log file
        os.makedirs(LOG_DIR, exist_ok=True)
        debug_handler = ConcurrentRotatingFileHandler(
            DEBUG_LOG_FILE_NAME,  # Debug log file
            maxBytes=MAX_DEBUG_LOG_FILE_SIZE,  # Max size in bytes
            backupCount=DEBUG_LOG_BACKUP_COUNT,  # Keep up to 3 backups
        )
        debug_handler.setLevel(logging.DEBUG)
        debug_formatter = Formatter()
        debug_handler.setFormatter(debug_formatter)

        # Create a logger and attach both handlers
        self.setLevel(logging.DEBUG)
        self.addHandler(stdout_handler)  # Attach stdout file rotation
        self.addHandler(debug_handler)  # Attach debug fil

        if sys.stdout.isatty() :
            console_handler = logging.StreamHandler()
            console_handler.setLevel(logging.DEBUG)
            console_handler.setFormatter(ColoredFormatter())
            self.addHandler(console_handler)  # Attach co  nsole fil

    def log(self, *args, **kwargs):
        """Log messages with specified log level, *args for message, **kwargs for extra."""
        super().info(" ".join(map(str, args)))

    def info(self, *args, **kwargs):
        """Log messages with specified log level, *args for message, **kwargs for extra."""
        super().info(" ".join(map(str, args)))

    def warning(self, *args, **kwargs):
        """Log messages with specified log level, *args for message, **kwargs for extra."""
        super().warning(" ".join(map(str, args)))

    def error(self, *args, **kwargs):
        """Log messages with specified log level, *args for message, **kwargs for extra."""
        super().error(" ".join(map(str, args)),exc_info=True)

    def success(self, *args, **kwargs):
        """Log messages with specified log level, *args for message, **kwargs for extra."""
        super().log(15, " ".join(map(str, args)))  # type: ignore In custom class it is working
    
    def debug(self, *args, **kwargs):
        """Log messages with specified log level,**kwargs, *args for message"""
        super().debug(" ".join(map(str, args)))  # type: ignore In custom class it is working

# Custom formatter class with color and style support
class Formatter(logging.Formatter):
    def format(self, record):
        return f"[*{str(datetime.datetime.now()):<26}*][{record.levelname:<7}][{record.threadName:<19}] {record.getMessage()}"

class ColoredFormatter(logging.Formatter):
    # Define color codes for different log levels
    LOG_COLORS = {
        'INFO': '\033[0m',    
        'DEBUG': '\033[94m',     
        'WARNING': '\033[93m',
        'ERROR': '\033[91m',    
        'CRITICAL': '\033[95m',
        'RESET': '\033[0m',
        'SUCCESS': '\033[32m'
    }

    def format(self, record):
        # Choose the color based on the log level
        log_color = self.LOG_COLORS.get(record.levelname, self.LOG_COLORS['RESET'])

        # Construct the colored log message
        log_message = f"[*{str(datetime.datetime.now()):<26}*]" \
                      f"[{record.levelname:<7}]" \
                      f"[{record.threadName:<19}] " \
                      f"{record.getMessage()}"
        
        # Add the color to the log message and reset it at the end
        return f"{log_color}{log_message}{self.LOG_COLORS['RESET']}"


def getLogger(name) -> Logger:
    return Logger(name)

# Custom class to redirect sys.stdout to a logger 
# print will also log now
# import sys
# class StreamTologger:
#     def __init__(self, logger, log_level=logging.INFO):
#         self.logger = logger
#         self.log_level = log_level
#         self.linebuf = ""

#     def write(self, buf) -> None:
#         for line in buf.rstrip().splitlines():
#             self.logger.log(line)

#     def flush(self) -> None:
#         pass  # Sys.stdout expects a flush method, so we provide a no-op


# # Create a logger and attach both handlers
# logger = getLogger("print")
# sys.stdout = StreamTologger(logger, logging.INFO)

