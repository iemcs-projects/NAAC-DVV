import { upload, uploadFile } from "../controllers/upload.controller.js";
import verifyToken from '../middlewares/auth.middlewares.js';
import express from 'express';
const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), uploadFile);


export default router;
