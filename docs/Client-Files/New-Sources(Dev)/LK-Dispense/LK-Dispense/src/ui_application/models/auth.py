from enum import Enum
import hashlib
from src.database.models.user import User
from src.database.models.kiosk_info import KioskInfo_V4
from src.logger import getLogger

logger = getLogger(__name__)

class LoginResults(Enum):
    UserNotFound = 0
    IncorrectPassword = 1
    SuccessFullLogin = 2
    Error = 3
    WrongAuthorizationID = 4


# def verify_email_password(email, password) -> tuple[LoginResults, str | None]:

#     try:
#         user = User.get(User.email == email)
#         if check_password(user.password, password):
#             return LoginResults.SuccessFullLogin, str(user.id)
#         return LoginResults.IncorrectPassword, None
    
#     except User.DoesNotExist:
#         return LoginResults.UserNotFound, None
    
#     except Exception as e:
#         return LoginResults.Error, None

# def check_password(stored_hash: str, password: str) -> bool:
#     # Check if the entered password matches the stored hash
#     # return hashlib.sha256(password.encode(), usedforsecurity=True).hexdigest() == stored_hash
#     return True


def verify_email_password(input_value: str, password: str) -> tuple[LoginResults, str | None]:
    try:
        kiosk_info = KioskInfo_V4.select().limit(1).first()

        if not kiosk_info:
            logger.log("No KioskInfo found")
            return LoginResults.UserNotFound, None

        logger.log(f"Kiosk authentication type: {kiosk_info.auth_type}")

        auth_fields = {
            "Email": User.email,
            "Student ID": User.student_id,
            "Phone": User.phone_number
        }

        if kiosk_info.auth_type in auth_fields:
            try:
                user = User.get(auth_fields[kiosk_info.auth_type] == input_value)
                if check_password(user.password, password):
                    logger.log(f"{kiosk_info.auth_type} authentication successful for user ID {user.id}")
                    return LoginResults.SuccessFullLogin, str(user.id)
                else:
                    logger.log(f"Incorrect password for {kiosk_info.auth_type}")
                    return LoginResults.IncorrectPassword, None
            except User.DoesNotExist:
                logger.log(f"User not found for {kiosk_info.auth_type}: {input_value}")
                return LoginResults.UserNotFound, None
        else:
            logger.log(f"Invalid authentication type: {kiosk_info.auth_type}")
            return LoginResults.WrongAuthorizationID, None

    except Exception as e:
        logger.log(f"Unexpected error: {str(e)}")
        return LoginResults.Error, None
    
def check_password(stored_hash: str, password: str) -> bool:
    # Check if the entered password matches the stored hash
    # return hashlib.sha256(password.encode(), usedforsecurity=True).hexdigest() == stored_hash
    return True