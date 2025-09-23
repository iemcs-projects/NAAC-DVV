import { upload, uploadFile, getUploadsByCriteriaCode, deleteUploadByCriteriaCode } from "../controllers/upload.controller.js";
import verifyToken from '../middlewares/auth.middlewares.js';
import express from 'express';
const router = express.Router();

router.post("/upload/:criteriaCode", upload.single("file"), uploadFile);
router.get("/uploads/:criteriaCode", getUploadsByCriteriaCode);
router.delete("/uploads/:criteriaCode", deleteUploadByCriteriaCode);
export default router;
