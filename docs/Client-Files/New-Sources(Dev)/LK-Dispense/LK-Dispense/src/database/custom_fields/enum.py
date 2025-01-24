# creating a custom enum field
from peewee import CharField


class EnumField(CharField):
    def __init__(self, enum_type, *args, **kwargs):
        self.enum_type = enum_type
        super().__init__(*args, **kwargs)

    def db_value(self, value):
        if isinstance(value, self.enum_type):
            return value.value
        return value

    def python_value(self, value):
        if value is not None:
            return self.enum_type(value)
        return value
