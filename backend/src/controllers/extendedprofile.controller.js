import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const ExtendedProfile = db.extended_profile;
const IIQAForm = db.iiqa_form;
// NEEDS VALIDATION
// WHAT TO DO ABOUT INSTITUTION ID ??
const createExtendedProfile = asyncHandler(async (req, res) => {
    try {
        // Get current year
        console.log("2. Request body:", JSON.stringify(req.body, null, 2));
        
        // Extract all fields from request body
        const {
            year,
            number_of_courses_offered,
            total_students,
            reserved_category_seats,
            outgoing_final_year_students,
            full_time_teachers,
            sanctioned_posts,
            total_classrooms,
            total_seminar_halls,
            total_computers,
            expenditure_in_lakhs
        } = req.body;

        // Find latest IIQA form
        console.log("4. Searching for latest IIQA form");
        const latestIIQA = await IIQAForm.findOne({
            attributes: ['id', 'session_end_year', 'year_filled'],  // ✅ include 'id' here
            order: [['created_at', 'DESC']]
        });
        
        if (!latestIIQA) {
            throw new apiError(404, "No IIQA form found");
        }
        
        console.log("5. Found IIQA form:", latestIIQA ? "Yes" : "No");
        console.log("IIQA form details:", {
            id: latestIIQA.id,
            session_end_year: latestIIQA.session_end_year,
            year_filled: latestIIQA.year_filled
        });
        
        // Validate year
        if (latestIIQA.year_filled!== year) {
            throw new apiError(400, `IIQA form year (${latestIIQA.year_filled}) does not match current year (${year})`);
        }
        
        // Use the existing iiqaForm.id directly in the create call

        // Create extended profile
        const profile = await ExtendedProfile.create({
            iiqa_form_id: latestIIQA.id,
            year: year,
            number_of_courses_offered,
            total_students,
            reserved_category_seats,
            outgoing_final_year_students,
            full_time_teachers,
            sanctioned_posts,
            total_classrooms,
            total_seminar_halls,
            total_computers,
            expenditure_in_lakhs
        }, {
            fields: [
                'iiqa_form_id',
                'year',
                'number_of_courses_offered',
                'total_students',
                'reserved_category_seats',
                'outgoing_final_year_students',
                'full_time_teachers',
                'sanctioned_posts',
                'total_classrooms',
                'total_seminar_halls',
                'total_computers',
                'expenditure_in_lakhs'
            ]
        });

        return res.status(201).json(
            new apiResponse(201, profile, "Extended profile created successfully")
        );

    } catch (error) {
        console.error('Error creating extended profile:', {
            error: error.message,
            stack: error.stack,
            type: error.name,
            details: {
                reqBody: req.body,
                errorFields: error.fields,
                errorName: error.name,
                errorOriginal: error.original
            }
        });

        // Handle specific errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            throw new apiError(400, `Validation errors: ${validationErrors.join(', ')}`);
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new apiError(400, 'A profile already exists for this institution and year');
        }

        // For other errors, rethrow with a more generic message
        throw new apiError(500, "An error occurred while creating the extended profile");
    }
});

export {
    createExtendedProfile
};