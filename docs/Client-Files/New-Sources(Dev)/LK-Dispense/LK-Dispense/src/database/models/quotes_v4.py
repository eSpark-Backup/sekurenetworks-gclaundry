from datetime import datetime

from peewee import BigIntegerField, TextField, BooleanField, DateTimeField, UUIDField

from src.database.models.base_model import BaseModel


class Quotes_V4(BaseModel):
    id = UUIDField(null=True)
    quote = TextField()