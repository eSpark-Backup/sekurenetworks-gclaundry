from peewee import BigIntegerField,BooleanField, TextField, IntegerField

from src.database.models.base_model import BaseModel

# kiosk config table it is one row table
class KioskInfo_V4(BaseModel):
    id = BigIntegerField(primary_key=True, unique=True)
    answer_required = BooleanField()
    app_type = TextField()
    sheets_per_transaction= IntegerField(default=0)
    screen_sequence = TextField()
    customer_id = TextField(null=True)
    auth_type = TextField(null=True)
