from datetime import datetime

from peewee import UUIDField, TextField, DateTimeField

from src.database.models.base_model import BaseModel


class Survey_V4(BaseModel):
    id = UUIDField(null=True)
    question = TextField()
    created_at = DateTimeField(default=datetime.now)
    # json in as
    #{"question": "", "options": '[{"option": "","is_valid": false},...]'}
    options = TextField()
