from enum import Enum
import hashlib
from src.database.models.user import User
# from src.logger import getLogger

# logger = getLogger(__name__)

class LoginResults(Enum):
    UserNotFound = 0
    IncorrectPassword = 1
    SuccessFullLogin = 2
    Error = 3


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



def verify_email_password(input, password) -> tuple[LoginResults, str | None]:

    try:
        user = User.get(
            (User.email == input) | (User.student_id == input) | (User.phone_number == input)
        )
        
        print(f"Student ID: {user.student_id}, Phone Number: {user.phone_number}, Email: {user.email}")

        if check_password(user.password, password):
            return LoginResults.SuccessFullLogin, str(user.id)
        return LoginResults.IncorrectPassword, None

    except User.DoesNotExist:
        return LoginResults.UserNotFound, None
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return LoginResults.Error, None

def check_password(stored_hash: str, password: str) -> bool:
    # Check if the entered password matches the stored hash
    # return hashlib.sha256(password.encode(), usedforsecurity=True).hexdigest() == stored_hash
    return True