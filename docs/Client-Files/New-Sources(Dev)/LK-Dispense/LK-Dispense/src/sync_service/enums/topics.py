from enum import Enum
from src.sync_service.system_info import system_info

class Topics:
    QOUTES = f'message/{system_info().get_mac()}'
    SURVEY = f'survey/{system_info().get_mac()}'
    KIOSK_CONFIG = f"config/{system_info().get_mac()}"

    ALIVE = 'alive'
    STATUS = 'status' # Used by status 
    TRANSACTION_NEW = 'transaction_new'
    TRANSACTION = 'transaction'
    
    @staticmethod
    def get_user_service_topic(id):
        return f"user/{id}"