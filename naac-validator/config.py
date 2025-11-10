from dotenv import load_dotenv
import os

load_dotenv()

# Database Configuration
class Config:
    # MySQL Database Configuration
    MYSQL_HOST = os.getenv("MYSQL_HOST")
    MYSQL_PORT = os.getenv("MYSQL_PORT")
    MYSQL_USER = os.getenv("MYSQL_USER")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")

    # File paths
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER") or "uploads/"