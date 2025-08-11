// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import criteriaMasterRoutes from "./routes/criteriaMaster.routes.js";
import criteria1Routes from "./routes/criteria1.routes.js";
import criteria2Routes from "./routes/criteria2.routes.js";
import criteria4Routes from "./routes/criteria4.routes.js";
import criteria6Routes from "./routes/criteria6.routes.js";
import criteria5Routes from "./routes/criteria5.routes.js";
import criteria7Routes from "./routes/criteria7.routes.js";
import authRoutes from "./routes/auth.routes.js";
import iiqaRoutes from "./routes/iiqa.routes.js";
import extendedprofileRoutes from "./routes/extendedprofile.routes.js";
import scoresRoutes from "./routes/scores.routes.js";
import criteria3Routes from "./routes/criteria3.routes.js";
dotenv.config();          // Load .env vars

const app = express();    // Create Express app
// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // REMOVE 'Cookie'
  optionsSuccessStatus: 204,
  exposedHeaders: ['Set-Cookie'] // Optional, only needed for custom headers
};

app.use(cors(corsOptions));
import cookieParser from 'cookie-parser';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/v1/criteria', criteriaMasterRoutes);
app.use('/api/v1/criteria1', criteria1Routes);
app.use('/api/v1/criteria2', criteria2Routes);
app.use('/api/v1/criteria3', criteria3Routes);
app.use('/api/v1/criteria4', criteria4Routes);
app.use('/api/v1/criteria6', criteria6Routes);
app.use('/api/v1/criteria5', criteria5Routes);
app.use('/api/v1/criteria7', criteria7Routes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/iiqa', iiqaRoutes);
app.use('/api/v1/extendedprofile', extendedprofileRoutes);
app.use('/api/v1/scores', scoresRoutes);
// Health Checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    error: `Cannot ${req.method} ${req.url}`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

export default app;
