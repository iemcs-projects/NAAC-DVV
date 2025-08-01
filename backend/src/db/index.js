import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connectDB = () => {
    console.log(process.env.DB_HOST)
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log("Database connection pool created successfully");
        return pool;
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;