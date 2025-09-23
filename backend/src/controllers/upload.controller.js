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
  
// New: GET uploads by criteria code (optional session, with pagination)
export const getUploadsByCriteriaCode = asyncHandler(async (req, res) => {
  const { criteriaCode } = req.params;
  const { session, page = 1, limit = 50 } = req.query;

  if (!criteriaCode) {
    throw new apiError(400, "Missing criteriaCode");
  }

  // Lookup criteria_master by padded sub_sub_criterion_id
  const padded = convertToPaddedFormat(criteriaCode);
  const criteriaMaster = await db.criteria_master.findOne({
    where: { sub_sub_criterion_id: padded },
  });

  if (!criteriaMaster) {
    throw new apiError(404, `Criteria not found for code: ${criteriaCode}`);
  }

  const where = {
    criteria_code: criteriaMaster.criteria_code,
    ...(session ? { session: Number(session) } : {}),
  };

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(200, Number(limit) || 50));
  const offset = (pageNum - 1) * pageSize;

  const { rows, count } = await db.file_uploads.findAndCountAll({
    where,
    order: [["uploaded_at", "DESC"]],
    limit: pageSize,
    offset,
  });

  return res.status(200).json(
    new apiResponse(200, {
      items: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(count / pageSize) || 1,
      },
      meta: {
        criteria_code: criteriaMaster.criteria_code,
        criteria_master_id: criteriaMaster.id,
        sub_sub_criterion_id: criteriaMaster.sub_sub_criterion_id,
      }
    }, "Uploads retrieved successfully")
  );
});

// New: DELETE upload by id
export const deleteUploadByCriteriaCode = asyncHandler(async (req, res) => {
  const { criteriaCode } = req.params;

  if (!criteriaCode) {
    throw new apiError(400, "Missing upload id");
  }

  const record = await db.file_uploads.findOne({ where: { criteria_code: criteriaCode } });
  if (!record) {
    throw new apiError(404, "Upload not found");
  }

  // Attempt to remove file from disk
  try {
    if (record.file_url) {
      // file_url like '/uploads/<filename>'
      const filename = path.basename(record.file_url);
      const filePath = path.join(process.cwd(), "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error("Failed to delete physical file:", err);
    // Continue even if file removal fails
  }

  await db.file_uploads.destroy({ where: { criteria_code: criteriaCode } });

  return res.status(200).json(
    new apiResponse(200, { criteriaCode }, "Upload deleted successfully")
  );
});
