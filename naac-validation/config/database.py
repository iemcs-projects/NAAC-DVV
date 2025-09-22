"""
Database configuration and connection for NAAC validation system
Direct MySQL integration to fetch records for validation
"""
import mysql.connector
from mysql.connector import Error
import logging
import os
from typing import Dict, Any, Optional, List
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration class"""
    
    def __init__(self):
        # Load environment variables from .env file
        from dotenv import load_dotenv
        load_dotenv()
        
        # Get values from environment, with fallback to your specific config
        self.host = os.getenv('DB_HOST') or 'localhost'
        self.port = int(os.getenv('DB_PORT') or '3306')
        self.database = os.getenv('DB_NAME') or 'Naac_Dvv'
        self.username = os.getenv('DB_USER') or 'root'
        self.password = os.getenv('DB_PASSWORD') or 'MySQL@321'
        
    def get_connection_config(self) -> Dict[str, Any]:
        """Get database connection configuration"""
        return {
            'host': self.host,
            'port': self.port,
            'database': self.database,
            'user': self.username,
            'password': self.password,
            'autocommit': True,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }

class NAACDatabase:
    """Database interface for NAAC validation system"""
    
    def __init__(self):
        self.config = DatabaseConfig()
        self._test_connection()
    
    def _test_connection(self):
        """Test database connection on initialization"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                logger.info("[SUCCESS] Database connection successful")
        except Error as e:
            logger.error(f"❌ Database connection failed: {str(e)}")
            raise
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        connection = None
        try:
            connection = mysql.connector.connect(**self.config.get_connection_config())
            yield connection
        except Error as e:
            logger.error(f"Database error: {str(e)}")
            raise
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    def get_criteria_record(self, criteria_code: str, record_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific record for validation by criteria and record ID
        
        Args:
            criteria_code: NAAC criteria code (e.g., "3.1.1")
            record_id: Database record ID (sl_no)
            
        Returns:
            Dictionary with record data or None if not found
        """
        
        # Map criteria codes to table names and internal codes
        criteria_mapping = {
            "2.1.1": {"table": "response_2_1_1", "code": "020101"},
            "3.1.1": {"table": "response_3_1_1", "code": "030301030101"},
            "3.2.1": {"table": "response_3_2_1", "code": "030201"},
            "3.2.2": {"table": "response_3_2_2", "code": "030202"},
            "3.3.1": {"table": "response_3_3_1", "code": "030301"},
            "3.4.1": {"table": "response_3_4_1", "code": "030401"}
        }
        
        if criteria_code not in criteria_mapping:
            logger.error(f"Unsupported criteria code: {criteria_code}")
            return None
        
        mapping = criteria_mapping[criteria_code]
        table_name = mapping["table"]
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                # Get all columns for the record
                query = f"""
                    SELECT * FROM {table_name} 
                    WHERE sl_no = %s 
                    ORDER BY submitted_at DESC 
                    LIMIT 1
                """
                
                cursor.execute(query, (record_id,))
                record = cursor.fetchone()
                
                if record:
                    logger.info(f"[SUCCESS] Found record {record_id} for criteria {criteria_code}")
                    return record
                else:
                    logger.warning(f"⚠️ No record found with sl_no {record_id} for criteria {criteria_code}")
                    return None
                    
        except Error as e:
            logger.error(f"Database query error: {str(e)}")
            return None
    
    def get_records_by_criteria(self, criteria_code: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent records for a specific criteria
        
        Args:
            criteria_code: NAAC criteria code
            limit: Maximum number of records to return
            
        Returns:
            List of record dictionaries
        """
        
        criteria_mapping = {
            "2.1.1": {"table": "response_2_1_1", "code": "020101"},
            "3.1.1": {"table": "response_3_1_1", "code": "030301030101"},
            "3.2.1": {"table": "response_3_2_1", "code": "030201"},
            "3.2.2": {"table": "response_3_2_2", "code": "030202"},
            "3.3.1": {"table": "response_3_3_1", "code": "030301"},
            "3.4.1": {"table": "response_3_4_1", "code": "030401"}
        }
        
        if criteria_code not in criteria_mapping:
            return []
        
        table_name = criteria_mapping[criteria_code]["table"]
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = f"""
                    SELECT * FROM {table_name} 
                    ORDER BY submitted_at DESC 
                    LIMIT %s
                """
                
                cursor.execute(query, (limit,))
                records = cursor.fetchall()
                
                logger.info(f"[SUCCESS] Retrieved {len(records)} records for criteria {criteria_code}")
                return records
                
        except Error as e:
            logger.error(f"Database query error: {str(e)}")
            return []
    
    def search_records(self, criteria_code: str, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search records by various parameters
        
        Args:
            criteria_code: NAAC criteria code
            search_params: Dictionary with search parameters
            
        Returns:
            List of matching records
        """
        
        criteria_mapping = {
            "3.1.1": {"table": "response_3_1_1", "fields": [
                "name_of_principal_investigator", "department_of_principal_investigator",
                "name_of_project", "name_of_funding_agency", "year_of_award"
            ]},
            "3.2.1": {"table": "response_3_2_1", "fields": [
                "paper_title", "author_names", "journal_name", "year_of_publication"
            ]}
        }
        
        if criteria_code not in criteria_mapping:
            return []
        
        mapping = criteria_mapping[criteria_code]
        table_name = mapping["table"]
        
        # Build dynamic query based on search parameters
        conditions = []
        values = []
        
        for key, value in search_params.items():
            if key in mapping["fields"] and value:
                conditions.append(f"{key} LIKE %s")
                values.append(f"%{value}%")
        
        if not conditions:
            return []
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = f"""
                    SELECT * FROM {table_name} 
                    WHERE {' AND '.join(conditions)}
                    ORDER BY submitted_at DESC
                    LIMIT 20
                """
                
                cursor.execute(query, values)
                records = cursor.fetchall()
                
                logger.info(f"[SUCCESS] Found {len(records)} matching records for criteria {criteria_code}")
                return records
                
        except Error as e:
            logger.error(f"Database search error: {str(e)}")
            return []
    
    def get_database_status(self) -> Dict[str, Any]:
        """Get database connection status and statistics"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                # Get table statistics
                tables = ["response_2_1_1", "response_3_1_1", "response_3_2_1", 
                         "response_3_2_2", "response_3_3_1", "response_3_4_1"]
                
                table_stats = {}
                for table in tables:
                    try:
                        cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                        result = cursor.fetchone()
                        table_stats[table] = result["count"]
                    except Error:
                        table_stats[table] = "error"
                
                return {
                    "status": "connected",
                    "host": self.config.host,
                    "database": self.config.database,
                    "table_counts": table_stats
                }
                
        except Error as e:
            return {
                "status": "error",
                "error": str(e)
            }

# Global database instance
db = NAACDatabase()