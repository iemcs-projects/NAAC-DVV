
import path from "path";
import fs from "fs";
import multer from "multer";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import db from "../models/index.js";

const convertToPaddedFormat = (code) => {
    // First remove any dots, then split into individual characters
    const parts = code.replace(/\./g, '').split('');
    // Pad each part to 2 digits and join
    return parts.map(part => part.padStart(2, '0')).join('');
};

// Configure local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads")); // designated folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// Controller
export const uploadFile = asyncHandler(async (req, res) => {
    const uploadPath = path.join(process.cwd(), "uploads");
  
    try {
      const session = req.body.session;
      const criteriaCode = req.params.criteriaCode;
      const uploadedBy = req.user?.id;
  
      if (!req.file) {
        throw new apiError(400, "No file uploaded");
      }
      if (!criteriaCode || !session) {
        throw new apiError(400, "Missing required fields: criteriaCode, session");
      }
  
      // Step 1: Find matching criteria_master
      const paddedCriteriaCode = convertToPaddedFormat(criteriaCode);
      const criteriaMaster = await db.criteria_master.findOne({
        where: { sub_sub_criterion_id: paddedCriteriaCode },
      });
  
      if (!criteriaMaster) {
        throw new apiError(404, `Criteria not found for code: ${criteriaCode}`);
      }
  
      // Step 2: Build file URL
      const fileUrl = `/uploads/${req.file.filename}`;
  
      // Step 3: Insert into file_uploads
      const record = await db.file_uploads.create({
        criteria_code: criteriaMaster.criteria_code,
        criteria_master_id: criteriaMaster.id,
        session,
        file_url: fileUrl,
        uploaded_by: uploadedBy || null,
        uploaded_at: new Date(),
      });
  
      return res
        .status(201)
        .json(new apiResponse(201, record, "File uploaded successfully"));
    } catch (error) {
      console.error("File upload failed:", error);
  
      // Cleanup file if DB insert or validation failed
      if (req.file) {
        try {
          fs.unlinkSync(path.join(uploadPath, req.file.filename));
        } catch (unlinkErr) {
          console.error("Failed to cleanup uploaded file:", unlinkErr);
        }
      }
  
      if (error.name === "SequelizeValidationError") {
        throw new apiError(400, "Database validation failed: " + error.message);
      }
      if (error.name === "SequelizeForeignKeyConstraintError") {
        throw new apiError(400, "Invalid foreign key reference");
      }
  
      throw new apiError(500, "Unexpected server error during file upload");
    }
  });
  
