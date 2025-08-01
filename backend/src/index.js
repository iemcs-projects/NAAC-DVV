import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
try {
    connectDB()
    app.on("Error",(error)=>{ //event listener for express (study)
        console.log("Express not being able to talk with DB", error);
    })
    app.listen( PORT, ()=>{
        console.log(`Server is running on Port ${PORT}`);
    });
} catch (error) {
    console.log("MySQL Connection error", error);
    process.exit(1);
}
