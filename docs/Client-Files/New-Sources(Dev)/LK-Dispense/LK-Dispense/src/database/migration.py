from src.database.models.kiosk_info import KioskInfo_V4
from src.database.models.quotes_v4 import Quotes_V4
from src.database.models.survey_v4 import Survey_V4
from src.database.models.transaction import Transaction_v5
from src.database.models.user import User
from src.logger import getLogger

logger = getLogger(__name__)


class Migration:

    @classmethod
    def up(cls):
        KioskInfo_V4.create_table()
        Transaction_v5.create_table()
        Quotes_V4.create_table()
        Survey_V4.create_table()
        User.create_table()

 #    new changes to the database schema, comment this field if update on database  
        
        # def add_column_if_not_exists(table_name, column_name, column_type):
        #         query = f"PRAGMA table_info({table_name});"  # Use SQLite-specific syntax
        #         existing_columns = [row[1] for row in KioskInfo_V4._meta.database.execute_sql(query)]
        #         if column_name not in existing_columns:
        #             KioskInfo_V4._meta.database.execute_sql(
        #                 f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type};"
        #             )
        

        # add_column_if_not_exists("KioskInfo_V4", "auth_type", "TEXT")
        # logger.log("Migration has been done")

#    end of new changes to the database schema


    @classmethod
    def down(cls):

#    new changes to the database schema, comment this field if update on database  
        
        # def remove_columns(table_name, columns_to_remove):
        #     query = f"PRAGMA table_info({table_name});"  # SQLite-specific syntax
        #     existing_columns = [row[1] for row in KioskInfo_V4._meta.database.execute_sql(query)]
            
        #     # Keep only columns that are not being removed
        #     columns_to_keep = [col for col in existing_columns if col not in columns_to_remove]
            
        #     # Build new table without the unwanted columns
        #     columns_definition = ", ".join(columns_to_keep)
        #     KioskInfo_V4._meta.database.execute_sql(
        #         f"""
        #         CREATE TABLE {table_name}_new AS SELECT {columns_definition} FROM {table_name};
        #         DROP TABLE {table_name};
        #         ALTER TABLE {table_name}_new RENAME TO {table_name};
        #         """
        #     )
        
        # # Specify the columns to remove
        # remove_columns("KioskInfo_V4", ["auth_type"])
        # logger.log("Columns removed and migration rolled back")     

#    end of new changes to the database schema
        
        KioskInfo_V4.drop_table()
        Quotes_V4.drop_table()
        Survey_V4.drop_table()
        logger.log("Migration has been deleted")
