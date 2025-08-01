import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const IIQAForm = db.iiqa_form;
const IIQAStaffDetails = db.iiqa_staff_details;
const IIQAStudentDetails = db.iiqa_student_details;
const IIQADepartments = db.iiqa_departments;
const IIQAProgrammeCount = db.iiqa_programme_count;
// NEEDS VALIDATION
// WHAT TO DO ABOUT INSTITUTION ID ??
// NEED TO REMOVE REDUNDANT DATA
const createIIQAForm = asyncHandler(async (req, res) => {
    // Start a transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        console.log('Request body:', req.body);
        
        // Extract and validate main form data
        const { 
            // Main form fields
            institution_id,
            session_start_year, 
            session_end_year, 
            year_filled, 
            naac_cycle, 
            desired_grade, 
            has_mou, 
            mou_file_url,
            
            // Programme count fields
            programmeCount = {},
            
            // Departments array
            departments = [],
            
            // Staff details
            staffDetails = {},
            
            // Student details
            studentDetails = {}
        } = req.body;

        // Validate required fields with specific error messages
        const requiredFields = [
            { field: institution_id, name: 'institution_id' },
            { field: session_start_year, name: 'session_start_year' },
            { field: session_end_year, name: 'session_end_year' },
            { field: year_filled, name: 'year_filled' },
            { field: naac_cycle, name: 'naac_cycle' },
            { field: desired_grade, name: 'desired_grade' },
            { field: has_mou, name: 'has_mou' }
        ];

        const missingFields = requiredFields
            .filter(item => item.field === undefined || item.field === null || item.field === '')
            .map(item => item.name);

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            throw new apiError(400, `Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate has_mou and mou_file_url relationship
        if (has_mou && !mou_file_url) {
            console.error('MOU file URL is required when has_mou is true');
            throw new apiError(400, 'MOU file URL is required when has_mou is true');
        }

        // Validate departments array
        if (!Array.isArray(departments) || departments.length === 0) {
            console.error('No departments provided');
            throw new apiError(400, 'At least one department is required');
        }

        // Validate department fields
        const departmentRequiredFields = ['department', 'program', 'university', 'affiliation_status'];
        for (const [index, dept] of departments.entries()) {
            const missingDeptFields = departmentRequiredFields
                .filter(field => !dept[field])
                .map(field => `departments[${index}].${field}`);
            
            if (missingDeptFields.length > 0) {
                console.error('Missing department fields:', missingDeptFields);
                throw new apiError(400, `Missing required department fields: ${missingDeptFields.join(', ')}`);
            }
        }
        // Create main IIQA form
        try {
            console.log("→ Checking if IIQAForm exists...");
        
            let form = await IIQAForm.findOne({
                where: {
                    institution_id,
                    session_start_year,
                    session_end_year,
                    year_filled
                },
                transaction
            });
        
            if (form) {
                console.log("→ Existing IIQAForm found. Updating...");
                await form.update({
                    naac_cycle,
                    desired_grade,
                    has_mou,
                    mou_file_url: has_mou ? mou_file_url : null
                }, { transaction });
            } else {
                console.log("→ Creating new IIQAForm...");
                form = await IIQAForm.create({
                    institution_id,
                    session_start_year,
                    session_end_year,
                    year_filled,
                    naac_cycle,
                    desired_grade,
                    has_mou,
                    mou_file_url: has_mou ? mou_file_url : null
                }, { transaction });
            }
        
            // Upsert programme count
            console.log("→ Upserting programme count...");
            await IIQAProgrammeCount.upsert({
                iiqa_form_id: form.id,
                ug: programmeCount.ug || 0,
                pg: programmeCount.pg || 0,
                post_masters: programmeCount.post_masters || 0,
                pre_doctoral: programmeCount.pre_doctoral || 0,
                doctoral: programmeCount.doctoral || 0,
                post_doctoral: programmeCount.post_doctoral || 0,
                pg_diploma: programmeCount.pg_diploma || 0,
                diploma: programmeCount.diploma || 0,
                certificate: programmeCount.certificate || 0
            }, { transaction });
        
            // Replace departments
            console.log("→ Replacing departments...");
            await IIQADepartments.destroy({ where: { iiqa_form_id: form.id }, transaction });
            await Promise.all(departments.map(dept =>
                IIQADepartments.create({
                    iiqa_form_id: form.id,
                    department: dept.department,
                    program: dept.program,
                    university: dept.university,
                    sra: dept.sra || null,
                    affiliation_status: dept.affiliation_status,
                    specialization: dept.specialization || null
                }, { transaction })
            ));
        
            // Upsert staff details
            console.log("→ Upserting staff details...");
            await IIQAStaffDetails.upsert({
                iiqa_form_id: form.id,
                perm_male: staffDetails.perm_male || 0,
                perm_female: staffDetails.perm_female || 0,
                perm_trans: staffDetails.perm_trans || 0,
                other_male: staffDetails.other_male || 0,
                other_female: staffDetails.other_female || 0,
                other_trans: staffDetails.other_trans || 0,
                non_male: staffDetails.non_male || 0,
                non_female: staffDetails.non_female || 0,
                non_trans: staffDetails.non_trans || 0
            }, { transaction });
        
            // Upsert student details
            console.log("→ Upserting student details...");
            await IIQAStudentDetails.upsert({
                iiqa_form_id: form.id,
                regular_male: studentDetails.regular_male || 0,
                regular_female: studentDetails.regular_female || 0,
                regular_trans: studentDetails.regular_trans || 0
            }, { transaction });
        
            // Final commit
            await transaction.commit();
            console.log("→ Transaction committed.");
        
            // Fetch full data
            console.log("→ Fetching full form with includes...");
            const completeForm = await IIQAForm.findByPk(form.id, {
                include: [
                    { model: IIQAProgrammeCount, as: 'iiqa_programme_counts' },
                    { model: IIQADepartments, as: 'iiqa_departments' },
                    { model: IIQAStaffDetails, as: 'iiqa_staff_details' },
                    { model: IIQAStudentDetails, as: 'iiqa_student_details' }
                ]
            });
        
            res.status(201).json(
                new apiResponse(201, completeForm, form._options.isNewRecord ? "IIQA form created" : "IIQA form updated")
            );
        
        } catch (dbError) {
            console.error('→ DB Error:', dbError);
            await transaction.rollback();
        
            if (dbError.name === 'SequelizeValidationError') {
                const errors = dbError.errors.map(err => err.message);
                console.error('→ Validation errors:', errors);
                return res.status(400).json(new apiResponse(400, {}, errors.join(', ')));
            }
        
            return res.status(500).json(new apiResponse(500, {}, "Internal Server Error"));
        }

    } catch (error) {
        console.error('Error in IIQA form submission:', error);
        throw error;
    }
});

const getSessions = asyncHandler(async (req, res) => {
        const sessions = await IIQAForm.findAll({
            attributes: ['session_start_year', 'session_end_year', 'year_filled', 'desired_grade'],
            group: ['session_start_year', 'session_end_year', 'year_filled', 'desired_grade'],
            order: [['year_filled', 'DESC']]
        });
        res.status(200).json(new apiResponse(200, sessions, "Sessions retrieved successfully"));
});
export {
    createIIQAForm,
    getSessions
}
