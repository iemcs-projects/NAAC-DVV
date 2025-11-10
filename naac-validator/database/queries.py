import mysql.connector
from decimal import Decimal
from datetime import datetime, date
from config import Config

class DatabaseQueries:
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Establish MySQL connection"""
        try:
            self.connection = mysql.connector.connect(
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DATABASE
            )
            return True
        except Exception as e:
            print(f"Database connection error: {e}")
            return False
    
    def get_criteria_records(self, criteria_code):
        """Get all records for specific criteria"""
        if not self.connect():
            return []
        
        try:
            cursor = self.connection.cursor(dictionary=True)
            table_name = f"response_{criteria_code.replace('.', '_')}"
            query = f"SELECT * FROM {table_name}"
            cursor.execute(query)
            records = cursor.fetchall()
            cursor.close()
            
            # Convert Decimal objects to float for JSON serialization
            return self._convert_decimals(records)
        except Exception as e:
            print(f"Error fetching records: {e}")
            return []
        finally:
            if self.connection:
                self.connection.close()
    
    def _convert_decimals(self, records):
        """Convert Decimal and datetime objects for JSON serialization"""
        if not records:
            return records
        
        converted = []
        for record in records:
            converted_record = {}
            for key, value in record.items():
                if isinstance(value, Decimal):
                    converted_record[key] = float(value)
                elif isinstance(value, (datetime, date)):
                    converted_record[key] = value.isoformat()
                else:
                    converted_record[key] = value
            converted.append(converted_record)
        return converted
    
    def get_record_by_id(self, criteria_code, record_id):
        """Get specific record by ID"""
        if not self.connect():
            return None
        
        try:
            cursor = self.connection.cursor(dictionary=True)
            table_name = f"response_{criteria_code.replace('.', '_')}"
            query = f"SELECT * FROM {table_name} WHERE id = %s"
            cursor.execute(query, (record_id,))
            record = cursor.fetchone()
            cursor.close()
            return record
        except Exception as e:
            print(f"Error fetching record: {e}")
            return None
        finally:
            if self.connection:
                self.connection.close()