from peewee import TextField, UUIDField
from src.database.models.base_model import BaseModel


# USERS table
class User(BaseModel):
    id = UUIDField(primary_key=True)
    email = TextField()
    password = TextField()