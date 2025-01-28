from peewee import TextField, UUIDField, IntegerField
from src.database.models.base_model import BaseModel


# USERS table
class User(BaseModel):
    id = UUIDField(primary_key=True)
    email = TextField()
    password = TextField()
    student_id = TextField(null=True)
    phone_number = TextField(null=True)
    AUTH = TextField(null=True)