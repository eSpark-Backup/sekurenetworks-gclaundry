# A file to delete all the migrations when needed
from src.database.migration import Migration

Migration.down()
