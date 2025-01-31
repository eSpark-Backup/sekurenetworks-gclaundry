import datetime
import time

from peewee import IntegerField, BooleanField, TextField, BigIntegerField, DateTimeField, UUIDField

from src.database.enums.transaction_type import Status
from src.database.models.base_model import BaseModel


# kiosk transaction table
class Transaction_v5(BaseModel):
    id = BigIntegerField(primary_key=True)

    qty = IntegerField(default=0,)
    tissue_type = TextField()
    status = TextField()
    error = TextField(null=True)
    questionid = UUIDField(null=True)
    questionid2 = UUIDField(null=True)
    qouteid = UUIDField(null=True)
    answer = TextField(null=True)
    answer2 = TextField(null=True)
    user_id = TextField(null=True)
    updatedToPortal = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.now)
