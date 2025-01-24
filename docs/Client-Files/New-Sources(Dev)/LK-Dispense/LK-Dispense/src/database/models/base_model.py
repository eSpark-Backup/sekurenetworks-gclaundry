from peewee import Model

from config import config


# base modal for every table
class BaseModel(Model):
    class Meta:
        database = config().db
