
import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const Criteria511 = db.response_5_1_1;
const Criteria512 = db.response_5_1_2;
const Criteria513 = db.response_5_1_3;
const Criteria514 = db.response_5_1_4;
const Criteria521 = db.response_5_2_1;
const Criteria522 = db.response_5_2_2;
const Criteria523 = db.response_5_2_3;
const Criteria531 = db.response_5_3_1;
const Criteria533 = db.response_5_3_3;
const Score = db.scores;
const IIQA = db.iiqa_form;
const IIQA_Student_Details = db.iiqa_student_details;
const IIQAStaffDetails = db.iiqa_staff_details;
const extended_profile = db.extended_profile;
const CriteriaMaster = db.criteria_master;

// Helper function to convert criteria code to padded format
const convertToPaddedFormat = (code) => {
  // First remove any dots, then split into individual characters
  const parts = code.replace(/\./g, '').split('');
  // Pad each part to 2 digits and join
  return parts.map(part => part.padStart(2, '0')).join('');
};

// Helper function to calculate total number of teachers
const getTeacherCount = async () => {
  const response = await IIQAStaffDetails.findAll({
    order: [['id', 'DESC']], // Get the most recent record first
    limit: 1 // Only get the latest record
  });

  if (!response || response.length === 0) {
    console.log("No teacher details found");
    return 0;
  }

  const latestRecord = response[0].dataValues;
  const totalTeachers = 
    (latestRecord.perm_male || 0) + 
    (latestRecord.perm_female || 0) + 
    (latestRecord.perm_trans || 0) + 
    (latestRecord.other_male || 0) + 
    (latestRecord.other_female || 0) + 
    (latestRecord.other_trans || 0);


  console.log("Total teachers:", totalTeachers);
  return totalTeachers;
};

// Helper function to calculate total number of students
const getTotalStudents = async () => {
  const responses = await IIQA_Student_Details.findAll({
    order: [['id', 'DESC']], // Get the most recent record first
    limit: 1 // Only get the latest record
  });

  if (!responses || responses.length === 0) {
    console.log("No student details found");
    return 0;
  }

  const latestRecord = responses[0].dataValues;
  const totalStudents = 
    (latestRecord.regular_male || 0) + 
    (latestRecord.regular_female || 0) + 
    (latestRecord.regular_trans || 0);

  console.log("Total students:", totalStudents);
  return totalStudents;
};

const getResponsesByCriteriaCode = asyncHandler(async (req, res) => {
  const { criteriaCode } = req.params;
  const { session } = req.query;

  if (!criteriaCode) {
    throw new apiError(400, "Missing criteria code");
  }

  const paddedCriteriaCode = convertToPaddedFormat(criteriaCode);
  const dbName = `response_${criteriaCode.replace(/\./g, '_')}`;

  // Step 1: Get criteria master
  const criteriaMaster = await db.criteria_master.findOne({
    where: { sub_sub_criterion_id: paddedCriteriaCode }
  });

  if (!criteriaMaster) {
    throw new apiError(404, `Criteria not found for code: ${criteriaCode}`);
  }

  // Step 2: Prepare where clause
  const whereClause = {
    criteria_code: criteriaMaster.criteria_code,
    ...(session && { session })  // Only include session if it's passed
  };
 console.log("DB Name",db[dbName])
  console.log("Database name:", dbName);
  console.log("Where clause:", whereClause);

  // Step 3: Fetch responses
try {
    const responses = await db[dbName].findAll({
      where: whereClause,
    });
    console.log("Query results:", responses);
    return res.status(200).json(
      new apiResponse(200, responses, 'Responses retrieved successfully')
    );
} catch (error) {
  console.log(error)
  throw new apiError(500, "Failed to fetch responses");
}
});

// 5.1.1&5.1.2

const createResponse511_512 = asyncHandler(async (req, res) => {
    const {
      session,
      year,
      scheme_name,
      gov_students_count,
      gov_amount,
      non_gov_students_count,
      non_gov_amount,
      total_students_count,
      inst_students_count,
      inst_amount,
    } = req.body;
  
    // Step 1: Validate required fields
    if (
      !year ||
      !scheme_name ||
      gov_students_count == null ||
      gov_amount == null ||
      non_gov_students_count == null ||
      non_gov_amount == null ||
      total_students_count == null ||
      inst_students_count == null ||
      inst_amount == null
    ) {
      throw new apiError(400, "Missing required fields");
    }
  
    const currentYear = new Date().getFullYear();
  
    if (year < 1990 || year > currentYear) {
      throw new apiError(400, "Year of offering must be between 1990 and current year");
    }
  
    if (session < 1990 || session > currentYear) {
      throw new apiError(400, "Session must be between 1990 and current year");
    }
  
    // Step 2: Validate session within latest IIQA range
    const latestIIQA = await IIQA.findOne({
      attributes: ["session_end_year"],
      order: [["created_at", "DESC"]],
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA form found");
    }
  
    const endYear = latestIIQA.session_end_year;
    const startYear = endYear - 5;
  
    if (session < startYear || session > endYear) {
      throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
    }
  
    // Step 3: Fetch criteria, ensuring required are present
    const expectedCriteriaIds = ['050101', '050102'];
  
    const criteriaList = await CriteriaMaster.findAll({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0501',
        sub_sub_criterion_id: { [Sequelize.Op.in]: expectedCriteriaIds }
      },
      raw: true
    });
  
    // Validate that all expected criteria were found
    const foundIds = criteriaList.map(c => c.sub_sub_criterion_id);
    const missing = expectedCriteriaIds.filter(id => !foundIds.includes(id));
  
    if (missing.length > 0) {
      throw new apiError(404, `Missing criteria: ${missing.join(', ')}`);
    }
  
    const modelMap = {
      '050101': { model: Criteria511, name: '5.1.1' },
      '050102': { model: Criteria512, name: '5.1.2' },
    };
  
    const transaction = await db.sequelize.transaction();
  
    try {
      const responses = [];
  
      for (const criteria of criteriaList) {
        const { model: Model, name } = modelMap[criteria.sub_sub_criterion_id];
        if (!Model) continue;
  
        // Define a unique identifier for findOrCreate
        const whereClause = {
          session,
          year,
          scheme_name,
        };
  
        const defaults = {
          id: criteria.id,
          criteria_code: criteria.criteria_code,
          gov_students_count,
          gov_amount,
          non_gov_students_count,
          non_gov_amount,
          total_students_count,
          inst_students_count,
          inst_amount,
        };
  
        const [entry, created] = await Model.findOrCreate({
          where: whereClause,
          defaults,
          transaction
        });
  
        if (!created) {
          // Update the entry with the latest values
          await Model.update(defaults, {
            where: { id: entry.id },
            transaction
          });
        }
  
        responses.push({
          criteria: name,
          entry,
          created,
          message: created ? "Entry created successfully" : "Entry updated successfully"
        });
      }
  
      await transaction.commit();
  
      return res.status(200).json(
        new apiResponse(200, { responses }, "Operation completed successfully")
      );
  
    } catch (error) {
      if (transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      throw error;
    }
  });
  
  

//5.1.3

const createResponse513 = asyncHandler(async (req, res) => {
    const {
      session,
      program_name,
      implementation_date,
      students_enrolled,
      agency_name,
    } = req.body;
  
    // Step 1: Field validation (handle 0 values properly)
    if (
      session == null ||
      !program_name ||
      !implementation_date ||
      students_enrolled == null ||
      !agency_name
    ) {
      throw new apiError(400, "Missing required fields");
    }
  
    const currentYear = new Date().getFullYear();
  
    if (session < 1990 || session > currentYear) {
      throw new apiError(400, "Session must be between 1990 and the current year");
    }
  
    if (students_enrolled < 0) {
      throw new apiError(400, "Number of students enrolled cannot be negative");
    }
  
    // Step 2: Check for existing entry (prevent duplicates)
    const existingEntry = await Criteria513.findOne({
      where: {
        session,
        program_name,
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "An entry already exists for this session and program name");
    }
  
    // Step 3: Fetch the relevant criteria from CriteriaMaster
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0501',
        sub_sub_criterion_id: '050103'
      }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria details not found");
    }
  
    // Step 4: Validate session range against latest IIQA
    const latestIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA data found");
    }
  
    const iiqaEndYear = latestIIQA.session_end_year;
    const iiqaStartYear = iiqaEndYear - 5;
  
    if (session < iiqaStartYear || session > iiqaEndYear) {
      throw new apiError(
        400,
        `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
      );
    }
  
    // Step 5: Create the new entry
    const newEntry = await Criteria513.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      program_name,
      implementation_date,
      students_enrolled,
      agency_name,
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });
  


//5.1.4

const createResponse514 = asyncHandler(async (req, res) => {
    const {
      session,
      year,
      activity_name,
      students_participated,
    } = req.body;
  
    // Step 1: Field validation (handle 0 values properly)
    if (
      session == null ||
      !year ||
      !activity_name ||
      students_participated == null
    ) {
      throw new apiError(400, "Missing required fields");
    }
  
    const currentYear = new Date().getFullYear();
  
    if (session < 1990 || session > currentYear) {
      throw new apiError(400, "Session must be between 1990 and the current year");
    }
  
    if (students_participated < 0) {
      throw new apiError(400, "Number of students enrolled cannot be negative");
    }
  
    // Step 2: Check for existing entry (prevent duplicates)
    const existingEntry = await Criteria514.findOne({
      where: {
        session,
        year,
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "An entry already exists for this session and program name");
    }
  
    // Step 3: Fetch the relevant criteria from CriteriaMaster
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0501',
        sub_sub_criterion_id: '050104'
      }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria details not found");
    }
  
    // Step 4: Validate session range against latest IIQA
    const latestIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA data found");
    }
  
    const iiqaEndYear = latestIIQA.session_end_year;
    const iiqaStartYear = iiqaEndYear - 5;
  
    if (session < iiqaStartYear || session > iiqaEndYear) {
      throw new apiError(
        400,
        `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
      );
    }
  
    // Step 5: Create the new entry
    const newEntry = await Criteria514.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      activity_name,
      students_participated
      
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });


//5.2.1

const createResponse521 = asyncHandler(async (req, res) => {
    const {
      session,
      year,
      student_name_contact,
      program_graduated_from,
      employer_details,
      pay_package_inr,
    } = req.body;
  
    // Step 1: Field validation (handle 0 values properly)
    if (
      session == null ||
      !year ||
      !student_name_contact ||
      !program_graduated_from ||
      !employer_details ||
      !pay_package_inr
    ) {
      throw new apiError(400, "Missing required fields");
    }
  
    const currentYear = new Date().getFullYear();
  
    if (session < 1990 || session > currentYear) {
      throw new apiError(400, "Session must be between 1990 and the current year");
    }
    
    if (year < 1990 || year > currentYear) {
      throw new apiError(400, "Year must be between 1990 and the current year");
    }
  
    if (pay_package_inr < 0) {
      throw new apiError(400, "Pay package cannot be negative");
    }
  
    // Step 2: Check for existing entry (prevent duplicates)
    const existingEntry = await Criteria521.findOne({
      where: {
        session,
        year,
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "An entry already exists for this session and program name");
    }
  
    // Step 3: Fetch the relevant criteria from CriteriaMaster
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0502',
        sub_sub_criterion_id: '050201'
      }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria details not found");
    }
  
    // Step 4: Validate session range against latest IIQA
    const latestIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA data found");
    }
  
    const iiqaEndYear = latestIIQA.session_end_year;
    const iiqaStartYear = iiqaEndYear - 5;
  
    if (session < iiqaStartYear || session > iiqaEndYear) {
      throw new apiError(
        400,
        `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
      );
    }
  
    // Step 5: Create the new entry
    const newEntry = await Criteria521.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      student_name_contact,
      program_graduated_from,
      employer_details,
      pay_package_inr,
      
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });

        


//5.2.2

const createResponse522 = asyncHandler(async (req, res) => {
    const {
      session,
      year,
      student_name,
      program_graduated_from,
      institution_joined,
      program_admitted_to,
    } = req.body;
  
    if (
      session == null ||
      year == null ||
      !student_name ||
      !program_graduated_from ||
      !institution_joined ||
      !program_admitted_to
    ) {
      throw new apiError(400, "Missing required fields");
    }
  
    const currentYear = new Date().getFullYear();
  
    if (session < 1990 || session > currentYear) {
      throw new apiError(400, "Session must be between 1990 and the current year");
    }
  
    if (year < 1990 || year > currentYear) {
      throw new apiError(400, "Year must be between 1990 and the current year");
    }
  
    const existingEntry = await Criteria522.findOne({
      where: {
        session,
        year,
        student_name
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "An entry already exists for this student in this session and year");
    }
  
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0502',
        sub_sub_criterion_id: '050202'
      }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria details not found");
    }
  
    const latestIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA data found");
    }
  
    const iiqaEndYear = latestIIQA.session_end_year;
    const iiqaStartYear = iiqaEndYear - 5;
  
    if (session < iiqaStartYear || session > iiqaEndYear) {
      throw new apiError(
        400,
        `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
      );
    }
  
    const newEntry = await Criteria522.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      student_name,
      program_graduated_from,
      institution_joined,
      program_admitted_to
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });
  



//5.2.3
 
const createResponse523 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    registeration_number,
    exam_net,
    exam_slet,
    exam_gate,
    exam_gmat,
    exam_cat,
    exam_gre,
    exam_jam,
    exam_ielts,
    exam_toefl,
    exam_civil_services,
    exam_state_services,
    exam_other,
  } = req.body;

  // Helper: check valid YES/NO string
  const isValidAnswer = (val) =>
    typeof val === "string" && ["YES", "NO"].includes(val.toUpperCase());

  if (
    session == null ||
    year == null ||
    !registeration_number ||
    !isValidAnswer(exam_net) ||
    !isValidAnswer(exam_slet) ||
    !isValidAnswer(exam_gate) ||
    !isValidAnswer(exam_gmat) ||
    !isValidAnswer(exam_cat) ||
    !isValidAnswer(exam_gre) ||
    !isValidAnswer(exam_jam) ||
    !isValidAnswer(exam_ielts) ||
    !isValidAnswer(exam_toefl) ||
    !isValidAnswer(exam_civil_services) ||
    !isValidAnswer(exam_state_services) ||
    !isValidAnswer(exam_other)
  ) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();

  if (session < 1990 || session > currentYear || year < 1990 || year > currentYear) {
    throw new apiError(400, "Year and session must be between 1990 and the current year");
  }

  const existingEntry = await Criteria523.findOne({
    where: {
      session,
      year: new Date(`${year}-01-01`),
      registeration_number,
    },
  });

  if (existingEntry) {
    throw new apiError(
      409,
      "An entry already exists for this registration number in the same session and year"
    );
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: "05",
      sub_criterion_id: "0502",
      sub_sub_criterion_id: "050203",
    },
  });

  if (!criteria) {
    throw new apiError(404, "Criteria details not found");
  }

  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA data found");
  }

  const iiqaEndYear = latestIIQA.session_end_year;
  const iiqaStartYear = iiqaEndYear - 5;

  if (session < iiqaStartYear || session > iiqaEndYear) {
    throw new apiError(
      400,
      `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
    );
  }

  // Create date for year field (Jan 1st)
  const yearDate = new Date(`${year}-01-01`);

  const newEntry = await Criteria523.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    year: yearDate,
    registeration_number,
    exam_net: exam_net.toUpperCase(),
    exam_slet: exam_slet.toUpperCase(),
    exam_gate: exam_gate.toUpperCase(),
    exam_gmat: exam_gmat.toUpperCase(),
    exam_cat: exam_cat.toUpperCase(),
    exam_gre: exam_gre.toUpperCase(),
    exam_jam: exam_jam.toUpperCase(),
    exam_ielts: exam_ielts.toUpperCase(),
    exam_toefl: exam_toefl.toUpperCase(),
    exam_civil_services: exam_civil_services.toUpperCase(),
    exam_state_services: exam_state_services.toUpperCase(),
    exam_other: exam_other.toUpperCase(),
  });

  return res
    .status(201)
    .json(new apiResponse(201, newEntry, "Response created successfully"));
});


  
 //5.3.1


 const createResponse531 = asyncHandler(async (req, res) => {
    const {
      session,
      year,
      award_name,
      team_or_individual,
      level,
      activity_type,
      student_name
    } = req.body;
  
    if (
      session == null ||
      year == null ||
      !award_name ||
      !team_or_individual ||
      !level ||
      !activity_type ||
      !student_name
    ) {
      throw new apiError(400, "Missing required fields");
    }
  
    const currentYear = new Date().getFullYear();
  
    if (session < 1990 || session > currentYear || year < 1990 || year > currentYear) {
      throw new apiError(400, "Year and session must be between 1990 and the current year");
    }
  
    const existingEntry = await Criteria531.findOne({
      where: {
        session,
        year,
        student_name,
        award_name
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "An entry already exists for this student and award in the given year and session");
    }
  
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0503', // Fixed space issue
        sub_sub_criterion_id: '050301'
      }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria details not found");
    }
  
    const latestIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA data found");
    }
  
    const iiqaEndYear = latestIIQA.session_end_year;
    const iiqaStartYear = iiqaEndYear - 5;
  
    if (session < iiqaStartYear || session > iiqaEndYear) {
      throw new apiError(
        400,
        `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
      );
    }
  
    const newEntry = await Criteria531.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      award_name,
      team_or_individual,
      level,
      activity_type,
      student_name
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });
  


//5.3.3

const createResponse533 = asyncHandler(async (req, res) => {
    const {
      session,
      event_date,
      event_name,
      student_name,
    } = req.body;
  
    // Step 1: Basic field validation
    if (!session || !event_date || !event_name || !student_name) {
      throw new apiError(400, "All fields are required");
    }
  
    const currentYear = new Date().getFullYear();
  
    // Step 2: Year validation
    if (
      session < 1990 || session > currentYear ||
      event_date < 1990 || event_date > currentYear
    ) {
      throw new apiError(400, "Session and Event Date must be between 1990 and the current year");
    }
  
    // Step 3: Duplicate check
    const existingEntry = await Criteria533.findOne({
      where: {
        session,
        event_date,
        event_name,
        student_name
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "Entry already exists for this student and event in the given session");
    }
  
    // Step 4: Fetch Criteria ID from master
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0503',
        sub_sub_criterion_id: '050303'
      }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria details not found");
    }
  
    // Step 5: Validate session against IIQA window
    const latestIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!latestIIQA) {
      throw new apiError(404, "No IIQA data found");
    }
  
    const iiqaEndYear = latestIIQA.session_end_year;
    const iiqaStartYear = iiqaEndYear - 5;
  
    if (session < iiqaStartYear || session > iiqaEndYear) {
      throw new apiError(
        400,
        `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
      );
    }
  
    // Step 6: Create entry
    const newEntry = await Criteria533.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      event_date,
      event_name,
      student_name
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });
  


  export {
    createResponse511_512,
    createResponse513,
    createResponse514,
    createResponse521,
    createResponse522,
    createResponse523,
    createResponse531,
    createResponse533,
    getResponsesByCriteriaCode
  };