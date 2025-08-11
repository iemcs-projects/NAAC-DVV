import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const Criteria113 = db.response_1_1_3;
const Criteria121 = db.response_1_2_1;
const Criteria122 = db.response_1_2_2;
const Criteria123 = db.response_1_2_3;
const Criteria132 = db.response_1_3_2;
const Criteria133 = db.response_1_3_3;
const Criteria141 = db.response_1_4_1;
const Criteria142 = db.response_1_4_2;
const CriteriaMaster = db.criteria_master;
const Score = db.scores;
const IIQA = db.iiqa_form;
const IIQAProgrammeCount = db.iiqa_programme_count;
const IIQA_Student_Details = db.iiqa_student_details;
const IIQAStaffDetails = db.iiqa_staff_details;
const extended_profile = db.extended_profile;


// Convert criteria code to padded format (e.g., '1.1.3' -> '010103')
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

/**
 * @description Get responses by criteria code
 * @route GET /api/v1/criteria1/responses/:criteriaCode
 * @access Private
 */
const getResponsesByCriteriaCode = asyncHandler(async (req, res) => {
    try {
        const { criteriaCode } = req.params;
        
        if (!criteriaCode) {
            throw new apiError(400, 'Criteria code is required');
        }

        // Convert criteria code to padded format if needed
        const paddedCriteriaCode = convertToPaddedFormat(criteriaCode);

        // Find the criteria model based on the criteria code
        let criteriaModel;
        switch(criteriaCode) {
            case '1.1.3':
                criteriaModel = Criteria113;
                break;
            case '1.2.1':
                criteriaModel = Criteria121;
                break;
            case '1.2.2':
                criteriaModel = Criteria122;
                break;
            case '1.2.3':
                criteriaModel = Criteria123;
                break;
            case '1.3.2':
                criteriaModel = Criteria132;
                break;
            case '1.3.3':
                criteriaModel = Criteria133;
                break;
            case '1.4.1':
                criteriaModel = Criteria141;
                break;
            case '1.4.2':
                criteriaModel = Criteria142;
                break;
            default:
                throw new apiError(400, 'Invalid criteria code');
        }

        // Get latest IIQA session range
        const latestIIQA = await IIQA.findOne({
            attributes: ['session_end_year'],
            order: [['created_at', 'DESC']]
        });

        if (!latestIIQA) {
            throw new apiError(404, 'No IIQA form found');
        }

        const endYear = latestIIQA.session_end_year;
        const startYear = endYear - 5; // Last 5 years data

        // Find all responses for the given criteria code within the session range
        const responses = await criteriaModel.findAll({
            where: {
                criteria_code: paddedCriteriaCode,
                session: { [Sequelize.Op.between]: [startYear, endYear] }
            },
            order: [['session', 'DESC'], ['year', 'DESC']]
        });

        if (!responses || responses.length === 0) {
            return res.status(200).json(
                new apiResponse(200, [], 'No responses found for the given criteria code')
            );
        }

        return res.status(200).json(
            new apiResponse(200, responses, 'Responses fetched successfully')
        );

    } catch (error) {
        console.error('Error in getResponsesByCriteriaCode:', error);
        throw new apiError(error.statusCode || 500, error.message || 'Error fetching responses by criteria code');
    }
});

const createResponse113 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    teacher_name,
    body_name,
    option_selected
  } = req.body;

  // Step 1: Field validation
  if (
    !session || !year || !teacher_name || !body_name ||
    option_selected === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (
    session < 1990 || session > currentYear ||
    year < 1990 || year > currentYear
  ) {
    throw new apiError(400, "Year and session must be between 1990 and current year");
  }

  if (option_selected < 0 || option_selected > 4) {
    throw new apiError(400, "Option selected must be between 0 and 4");
  }

  // Step 2: Prevent duplicates — same session + year + teacher_name + body_name
  // (We won't throw here, because findOrCreate will handle updating)
  // But you can keep extra logic here if needed for validation.

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0101',
      sub_sub_criterion_id: '010103'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 4: Validate session window against latest IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 5: Create or update response
  let [entry, created] = await Criteria113.findOrCreate({
    where: {
      session,
      year,
      teacher_name,
      body_name
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      teacher_name,
      body_name,
      option_selected
    }
  });

  if (!created) {
    await entry.update({ option_selected });
  }

  return res.status(201).json(
    new apiResponse(
      201,
      entry,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});


const score113 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("1.1.3");
  const currentYear = new Date().getFullYear();
  const sessionYear = currentYear;

  // Step 1: Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.1.3 not found in criteria_master");
  }

  // Step 2: Get latest IIQA session range
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  // Step 3: Count unique teachers from Criteria113
  const teacherCounts = await Criteria113.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('teacher_name'))), 'unique_teachers']
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: { [Sequelize.Op.between]: [startYear, endYear] }
    },
    raw: true
  });

  const totalUniqueTeachers = teacherCounts[0]?.unique_teachers || 0;
  console.log("Total unique teachers:", totalUniqueTeachers);

  // Step 4: Score and grade logic
  let score, grade;

  if (totalUniqueTeachers >= 30) {
    score = 4;
    grade = 4;
  } else if (totalUniqueTeachers >= 20) {
    score = 3;
    grade = 3;
  } else if (totalUniqueTeachers >= 10) {
    score = 2;
    grade = 2;
  } else if (totalUniqueTeachers >= 5) {
    score = 1;
    grade = 1;
  } else {
    score = 0;
    grade = 0;
  }

  // Step 5: Insert or update score (like score211)
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: sessionYear
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: sessionYear,
      year: currentYear,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: sessionYear,
      year: currentYear,
      cycle_year: 1
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: sessionYear
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: sessionYear
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      score,
      totalUniqueTeachers,
      grade
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});



const createResponse121 = asyncHandler(async (req, res) => {
  /*
    1. Extract input from req.body
    2. Validate required fields and logical constraints
    3. Check if programme_name or programme_code already exists for the same year and session
    4. Get criteria_code from criteria_master
    5. Get latest IIQA session and validate session window
    6. Create or update response in response_1_2_1 table
  */

  const {
    session,
    programme_code,
    programme_name,
    year_of_introduction,
    status_of_implementation_of_CBCS,
    year_of_implementation_of_CBCS,
    year_of_revision,
    prc_content_added
  } = req.body;

  // Step 1: Field validation
  if (
    !session || !programme_name || !programme_code ||
    !year_of_introduction || status_of_implementation_of_CBCS === undefined || !year_of_implementation_of_CBCS  || !year_of_revision || prc_content_added === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (
    session < 1990 || session > currentYear
  ) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (year_of_introduction < 1990 || year_of_implementation_of_CBCS < 1990 || year_of_revision < 1990) {
    throw new apiError(400, "Year of introduction, implementation of CBCS and revision must be between 1990 and current year");
  }

  if (year_of_introduction > currentYear || year_of_implementation_of_CBCS > currentYear || year_of_revision > currentYear) {
    throw new apiError(400, "Year of introduction, implementation of CBCS and revision must be between 1990 and current year");
  }

  // Step 2: Check for existing programme_name or programme_code in same session/year
  const existingRecord = await Criteria121.findOne({
    where: {
      session,
      [Sequelize.Op.or]: [
        { programme_code },
        { programme_name }
      ]
    }
  });

  if (existingRecord) {
    if (existingRecord.programme_name === programme_name) {
      throw new apiError(400, "Programme name already exists for this session and year");
    } else {
      throw new apiError(400, "Programme code already exists for this session and year");
    }
  }

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0102',
      sub_sub_criterion_id: '010201'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 4: Validate session window against IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, "Session must be between ${startYear} and ${endYear}");
  }

  // Step 5: Create or update response
  let [entry, created] = await Criteria121.findOrCreate({
    where: {
      session,
      programme_code,
      programme_name
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      programme_code,
      programme_name,
      year_of_introduction,
      status_of_implementation_of_CBCS,
      year_of_implementation_of_CBCS,
      year_of_revision,
      prc_content_added
    }
  });

  if (!created) {
    await Criteria121.update({
      year_of_introduction,
      status_of_implementation_of_CBCS,
      year_of_implementation_of_CBCS,
      year_of_revision,
      prc_content_added
    }, {
      where: {
        session,
        programme_code,
        programme_name
      }
    });

    entry = await Criteria121.findOne({
      where: {
        session,
        programme_code,
        programme_name
      }
    });
  }

  return res.status(201).json(
    new apiResponse(201, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const score121 = asyncHandler(async (req, res) => {
  /*
  1. Get current session (year)
  2. Get criteria from criteria master with sub-sub-criterion id 1.1.2
  3. Get latest IIQA session range
  4. Check if session is between the latest IIQA session and current year
  5. Fetch all responses for CBCS implementation status
  6. Count total programs and programs with CBCS implemented
  7. Calculate score as (CBCS programs / total programs)
  8. Create or update score in the score table
  9. Return the score
  */

  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.2.1");
  
  // Step 1: Get corresponding criteria from master
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.2.1 not found in criteria_master");
  }

  // Step 2: Get latest IIQA session range
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5; // Considering last 5 years data

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 3: Fetch CBCS implementation data
  const responses = await Criteria121.findAll({
    attributes: [
      'session',
      'programme_code',
      'programme_name',
      'status_of_implementation_of_CBCS'
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    }
  });

  if (!responses.length) {
    throw new apiError(404, "No program data found in the session range");
  }

  // Step 4: Count total programs and programs with CBCS implemented
  const totalPrograms = responses.length;
  const cbcsImplementedPrograms = responses.filter(
    program => program.status_of_implementation_of_CBCS === 'YES'
  ).length;

  // Calculate score (percentage of programs with CBCS implemented)
  const score = totalPrograms > 0 ? (cbcsImplementedPrograms / totalPrograms) * 100 : 0;

  let grade;
  if (score >= 25) grade = 4;
  else if (score >= 15) grade = 3;
  else if (score >= 5) grade = 2;
  else if (score >= 1) grade = 1;
  else grade = 0;
  // Step 5: Insert or update score
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      score: entry.score_sub_sub_criteria,
      grade: entry.sub_sub_cr_grade,
      totalPrograms,
      cbcsImplementedPrograms,
      criteria_code: criteria.criteria_code,
      session
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});


const createResponse122_123 = asyncHandler(async (req, res) => {
  const {
    session,
    program_name,
    course_code,
    year_of_offering,
    no_of_times_offered,
    duration,
    no_of_students_enrolled,
    no_of_students_completed
  } = req.body;

  // Step 1: Validate required fields
  if (
    !program_name ||
    !course_code ||
    year_of_offering == null ||
    no_of_times_offered == null ||
    duration == null ||
    no_of_students_enrolled == null ||
    no_of_students_completed == null
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();

  if (year_of_offering < 1990 || year_of_offering > currentYear) {
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
  const expectedCriteriaIds = ['010202', '010203'];

  const criteriaList = await CriteriaMaster.findAll({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0102',
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
    '010202': { model: Criteria122, name: '1.2.2' },
    '010203': { model: Criteria123, name: '1.2.3' },
  };

  const transaction = await db.sequelize.transaction();

  try {
    const responses = [];

    for (const criteria of criteriaList) {
      const { model: Model, name } = modelMap[criteria.sub_sub_criterion_id];
      if (!Model) continue;

      // Find or create entry
      const [entry, created] = await Model.findOrCreate({
        where: {
          session,
          year_of_offering,
          program_name,
          course_code
        },
        defaults: {
          id: criteria.id,
          criteria_code: criteria.criteria_code,
          session,
          year_of_offering,
          program_name,
          course_code,
          no_of_times_offered,
          duration,
          no_of_students_enrolled,
          no_of_students_completed
        },
        transaction
      });

      // If entry existed, update fields
      if (!created) {
        await Model.update({
          no_of_times_offered,
          duration,
          no_of_students_enrolled,
          no_of_students_completed
        }, {
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


const score122 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.2.2");

  // Step 1: Get criteria master entry
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.2.2 not found in criteria_master");
  }

  // Step 2: Get latest IIQA form
  const latestIIQA = await IIQA.findOne({
    attributes: ['id', 'session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const iiqa_form_id = latestIIQA.id;
  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 4; // Last 5 years (inclusive)

  const yearlyPercentages = [];

  for (let year = startYear; year <= endYear; year++) {
    // a. Certificate students from 1.2.2
    const certPrograms = await Criteria122.findOne({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('no_of_students_enrolled')), 'total_students']],
      where: {
        criteria_code: criteria.criteria_code,
        year_of_offering: year
      },
      raw: true
    });

    const certStudents = parseInt(certPrograms?.total_students || 0);

    // b. Total students from iiqa_programme_count for that IIQA
    const programmeCount = await db.iiqa_programme_count.findOne({
      where: { iiqa_form_id },
      raw: true
    });

    const totalStudents =
      (programmeCount?.ug || 0) +
      (programmeCount?.pg || 0) +
      (programmeCount?.post_masters || 0) +
      (programmeCount?.pre_doctoral || 0) +
      (programmeCount?.doctoral || 0) +
      (programmeCount?.post_doctoral || 0) +
      (programmeCount?.pg_diploma || 0) +
      (programmeCount?.diploma || 0) +
      (programmeCount?.certificate || 0);

    const percentage = totalStudents === 0 ? 0 : (certStudents / totalStudents) * 100;

    yearlyPercentages.push(+percentage.toFixed(2));
  }

  const avgPercentage = yearlyPercentages.length > 0
    ? +(yearlyPercentages.reduce((sum, p) => sum + p, 0) / yearlyPercentages.length).toFixed(2)
    : 0;

  // Scoring
  let grade = 0;
  if (avgPercentage >= 50) grade = 4;
  else if (avgPercentage >= 35) grade = 3;
  else if (avgPercentage >= 20) grade = 2;
  else if (avgPercentage >= 10) grade = 1;

  // Save to score table
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: currentYear
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: avgPercentage,
      sub_sub_cr_grade: grade,
      session: currentYear
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: avgPercentage,
      sub_sub_cr_grade: grade
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      score: entry.score_sub_sub_criteria,
      sub_sub_cr_grade: entry.sub_sub_cr_grade,
      yearlyPercentages,
      criteria_code: criteria.criteria_code,
      session: currentYear
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const score123 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.2.3");

  // Step 1: Get criteria master
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.2.3 not found in criteria_master");
  }

  // Step 2: Get latest IIQA form
  const latestIIQA = await IIQA.findOne({
    attributes: ['id', 'session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const iiqa_form_id = latestIIQA.id;
  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 4; // 5 years

  // Step 3: Get total students from iiqa_programme_count (latest IIQA)
  const programmeCount = await IIQAProgrammeCount.findOne({
    where: { iiqa_form_id },
    raw: true
  });

  const totalStudents =
    (programmeCount?.ug || 0) +
    (programmeCount?.pg || 0) +
    (programmeCount?.post_masters || 0) +
    (programmeCount?.pre_doctoral || 0) +
    (programmeCount?.doctoral || 0) +
    (programmeCount?.post_doctoral || 0) +
    (programmeCount?.pg_diploma || 0) +
    (programmeCount?.diploma || 0) +
    (programmeCount?.certificate || 0);

  if (totalStudents === 0) {
    throw new apiError(400, "Valid total number of students not found or is zero");
  }

  // Step 4: Calculate yearly percentages
  const yearlyPercentages = [];

  for (let year = startYear; year <= endYear; year++) {
    const addonPrograms = await Criteria123.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('no_of_students_enrolled')), 'total_students']
      ],
      where: {
        criteria_code: criteria.criteria_code,
        year_of_offering: year
      },
      raw: true
    });

    const addonStudents = parseInt(addonPrograms?.total_students || 0);
    const percentage = (addonStudents / totalStudents) * 100;
    yearlyPercentages.push(+percentage.toFixed(2));
  }

  const avgPercentage = yearlyPercentages.length > 0
    ? +(yearlyPercentages.reduce((sum, p) => sum + p, 0) / yearlyPercentages.length).toFixed(2)
    : 0;

  // Step 5: Grade based on average percentage
  let grade = 0;
  if (avgPercentage >= 50) grade = 4;
  else if (avgPercentage >= 35) grade = 3;
  else if (avgPercentage >= 20) grade = 2;
  else if (avgPercentage >= 10) grade = 1;

  // Step 6: Insert or update score
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: currentYear
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: avgPercentage,
      sub_sub_cr_grade: grade,
      session: currentYear
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: avgPercentage,
      sub_sub_cr_grade: grade
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      score: entry.score_sub_sub_criteria,
      sub_sub_cr_grade: entry.sub_sub_cr_grade,
      yearlyPercentages,
      criteria_code: criteria.criteria_code,
      session: currentYear
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse132 = asyncHandler(async (req, res) => {
  const {
    session,
    program_name,
    program_code,
    course_name,
    course_code,
    year_of_offering,
    student_name
  } = req.body;

  // Validation
  if (
    !session || !program_name || !program_code ||
    !course_name || !course_code || year_of_offering === undefined || student_name === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (year_of_offering < 1990 || year_of_offering > currentYear) {
    throw new apiError(400, "Year of offering must be between 1990 and current year");
  }

  if (student_name === undefined) {
    throw new apiError(400, "Student name cannot be undefined");
  }

  // Check criteria master
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0103',
      sub_sub_criterion_id: '010302'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Validate session window against IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Optional: check if exact same record exists already (including student_name)
  // If you want to allow duplicates fully, comment out this block
  const duplicateRecord = await Criteria132.findOne({
    where: {
      session,
      program_name,
      program_code,
      course_name,
      course_code,
      year_of_offering,
      student_name
    }
  });

  if (duplicateRecord) {
    throw new apiError(400, "This student record already exists for the given program and session");
  }

  // Create new record every time (no update)
  const newEntry = await Criteria132.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    program_name,
    program_code,
    course_name,
    course_code,
    year_of_offering,
    student_name
  });

  return res.status(201).json(
    new apiResponse(201, newEntry, "Response created successfully")
  );
});

const score132 = asyncHandler(async (req, res) => {
  /*
  1. Get current session (year)
  2. Get criteria from criteria master with sub-sub-criterion id 1.3.2
  3. Get latest IIQA session range
  4. For each year in the last 5 years:
     a. Get count of unique courses with experiential learning (criteria 1.3.2)
     b. Get total number of courses across all programs (from IIQA or manually set)
     c. Calculate percentage for the year
  5. Calculate average percentage over 5 years
  6. Create or update score in the score table
  7. Return the score
  */

  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.3.2");

  // Step 1: Get corresponding criteria from master
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.3.2 not found in criteria_master");
  }

  // Step 2: Get latest IIQA session range
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5; // Last 5 years data

  // Step 3: Calculate percentages for each year
  const yearlyPercentages = [];

  for (let year = startYear; year <= endYear; year++) {
    // Get count of unique courses with experiential learning (criteria 1.3.2)
    const expLearningCourses = await Criteria132.count({
      distinct: true,
      col: 'course_code',
      where: {
        criteria_code: criteria.criteria_code,
        year_of_offering: year
      }
    });

    // Placeholder: Replace with actual total courses logic
    const totalCourses = 100; // TODO: replace with real value from IIQA or config

    const percentage = totalCourses > 0 ? (expLearningCourses / totalCourses) * 100 : 0;
    yearlyPercentages.push(percentage);
  }

  // Step 4: Average percentage over 5 years
  const avgPercentage = yearlyPercentages.length > 0
    ? yearlyPercentages.reduce((sum, p) => sum + p, 0) / yearlyPercentages.length
    : 0;

    let grade;
  if (avgPercentage >= 35) grade = 4;
  else if (avgPercentage >= 20) grade = 3;
  else if (avgPercentage >= 10) grade = 2;
  else if (avgPercentage >= 5) grade = 1;
  else grade = 0;
  // Step 5: Insert or update score
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: currentYear
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: avgPercentage,
      sub_sub_cr_grade: grade,
      session: currentYear
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: avgPercentage,
      sub_sub_cr_grade: grade,
      session: currentYear
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      score: entry.score_sub_sub_criteria,
      sub_sub_cr_grade: entry.sub_sub_cr_grade,
      yearlyPercentages,
      criteria_code: criteria.criteria_code,
      session: currentYear
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse133 = asyncHandler(async (req, res) => {
  /*
    1. Extract input from req.body
    2. Validate required fields and logical constraints
    3. Check if student already submitted for same program and session
    4. Get criteria_code from criteria_master
    5. Get latest IIQA session and validate session window
    6. Create a new response in Criteria133 table
  */

  const {
    session,
    program_name,
    program_code,
    student_name
  } = req.body;

  // Step 1: Field validation
  if (
    !session || !program_name || !program_code ||
    student_name === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  // Step 2: Check for existing submission by same student for same program and session
  const existingRecord = await Criteria133.findOne({
    where: {
      session,
      program_name,
      student_name
    }
  });

  if (existingRecord) {
    throw new apiError(400, "This student has already submitted for this program in the given session");
  }

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0103',
      sub_sub_criterion_id: '010303'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 4: Validate session window against IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 5: Create new response
  const entry = await Criteria133.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    program_name,
    program_code,
    student_name
  });

  return res.status(201).json(
    new apiResponse(201, entry, "Response created successfully")
  );
});

const score133 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.3.3");
  
  // Get criteria from master
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.3.3 not found in criteria_master");
  }

  // Get latest IIQA session range
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5; // Last 5 years data

  // Get count of unique students who went for higher studies for each year
  const higherStudiesCounts = await Criteria133.findAll({
    attributes: [
      'session',
      [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('student_name'))), 'unique_students']
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: { [Sequelize.Op.between]: [startYear, endYear] }
    },
    group: ['session'],
    raw: true
  });

  // Get total students from extended_profile for each year
  const extendedProfiles = await extended_profile.findAll({
    where: { year: { [Sequelize.Op.between]: [startYear, endYear] } },
    attributes: ['year', 'total_students'],
    raw: true
  });

  // Calculate total higher studies students and total students over 5 years
  let totalHigherStudies = 0;
  let totalStudents = 0;
  const yearlyData = [];

  for (let year = startYear; year <= endYear; year++) {
    const higherStudies = higherStudiesCounts.find(h => h.session === year);
    const extendedProfile = extendedProfiles.find(e => e.year === year);
    
    const higherStudiesCount = higherStudies ? parseInt(higherStudies.unique_students) : 0;
    const studentCount = extendedProfile ? parseInt(extendedProfile.total_students) : 0;
    
    totalHigherStudies += higherStudiesCount;
    totalStudents += studentCount;
    
    yearlyData.push({
      year,
      higherStudiesStudents: higherStudiesCount,
      totalStudents: studentCount
    });
  }

  // Calculate overall percentage
  const percentage = totalStudents > 0 ? (totalHigherStudies / totalStudents) * 100 : 0;

  let grade;
  if (percentage >= 80) grade = 4;
  else if (percentage >= 60) grade = 3;
  else if (percentage >= 40) grade = 2;
  else if (percentage >= 20) grade = 1;
  else grade = 0;
  // Insert or update score
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: currentYear
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: percentage,
      sub_sub_cr_grade: grade,
      session: currentYear
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: percentage,
      sub_sub_cr_grade: grade,
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      score: entry.score_sub_sub_criteria,
      totalHigherStudies,
      totalStudents,
      yearlyData,
      criteria_code: criteria.criteria_code,
      session: currentYear
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse141 = asyncHandler(async (req, res) => {
  const {
    session,
    option_selected,
  } = req.body;

  console.log("Received option_selected:", option_selected); // Debug

  // Validation
  if (
    session === undefined ||
    option_selected === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (
    session < 1990 || session > currentYear
  ) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (option_selected < 0 || option_selected > 4) {
    throw new apiError(400, "Option selected must be between 0 and 4");
  }

  // Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0104',
      sub_sub_criterion_id: '010401'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Validate session window against IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['id', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Find existing record by session only
  const existingRecord = await Criteria141.findOne({
    where: {
      session
    }
  });

  let entry;

  if (existingRecord) {
    await Criteria141.update(
      { option_selected },
      { where: { session } }
    );

    entry = await Criteria141.findOne({ where: { session } });
  } else {
    entry = await Criteria141.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      option_selected
    });
  }

  console.log("Saved option_selected:", entry.option_selected);

  return res.status(201).json(
    new apiResponse(201, entry, existingRecord ? "Response updated successfully" : "Response created successfully")
  );
});

const score141 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("1.4.1");
  const currentYear = new Date().getFullYear();
  const session = currentYear;


  // Step 1: Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.4.1 not found in criteria_master");
  }

  // Step 2: Get latest response
  const response = await Criteria141.findOne({
    where: {
      criteria_code: criteria.criteria_code
    },
    order: [['id', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 1.4.1");
  }

  const optionSelected = Number(response.option_selected); // Convert to number

  let score, grade;

  // Fix: use numeric cases
  switch (optionSelected) {
    case 4:
      score = 4;
      grade = 4;
      break;
    case 3:
      score = 3;
      grade = 3;
      break;
    case 2:
      score = 2;
      grade = 2;
      break;
    case 1:
      score = 1;
      grade = 1;
      break;
    case 0:
    default:
      score = 0;
      grade = 0;
  }

  // Step 3: Create or update score entry
  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: currentYear,
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year']
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      optionSelected,
      grade,
      message: `Grade is ${grade} (Selected option: ${optionSelected})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse142 = asyncHandler(async (req, res) => {
  const {
    session,
    option_selected,
  } = req.body;

  // Validate required fields
  if (session === undefined || option_selected === undefined) {
    throw new apiError(400, "Missing required fields");
  }

  // Validate session is integer
  if (!Number.isInteger(session)) {
    throw new apiError(400, "Session must be an integer");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, `Session must be between 1990 and ${currentYear}`);
  }

  if (option_selected < 0 || option_selected > 4) {
    throw new apiError(400, "Option selected must be between 0 and 4");
  }

  // Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '01',
      sub_criterion_id: '0104',
      sub_sub_criterion_id: '010402'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Validate session window against IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Check if a record exists for this session
  const existingRecord = await Criteria142.findOne({
    where: { session }
  });

  if (existingRecord) {
    // Update the existing record's option_selected to the new one
    await Criteria142.update(
      { option_selected },
      { where: { session } }
    );

    const updatedRecord = await Criteria142.findOne({ where: { session } });

    return res.status(200).json(
      new apiResponse(200, updatedRecord, "Response updated successfully")
    );
  } else {
    // Create new record
    const newRecord = await Criteria142.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      option_selected
    });

    return res.status(201).json(
      new apiResponse(201, newRecord, "Response created successfully")
    );
  }
});

const score142 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("1.4.2");
  const currentYear = new Date().getFullYear();
  const sessionDate = currentYear;

  // Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 1.4.2 not found in criteria_master");
  }

  // Get the latest response for this criteria
  const response = await Criteria142.findOne({
    where: {
      criteria_code: criteria.criteria_code
    },
    order: [['session', 'DESC']], // Use session instead of created_at
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 1.4.2");
  }

  const optionSelected = response.option_selected;
  let score, grade;

  // Map option to score and grade
  switch(optionSelected) {
    case 4:
      score = 4;
      grade = 4;
      break;
    case 3:
      score = 3;
      grade = 3;
      break;
    case 2:
      score = 2;
      grade = 2;
      break;
    case 1:
      score = 1;
      grade = 1;
      break;
    case 0:
    default:
      score = 0;
      grade = 0;
  }

  // Create or update score entry
  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: sessionDate,
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year']
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      optionSelected,
      grade,
      message: `Grade is ${grade} (Selected option: ${optionSelected})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});


 


export { createResponse133,
  createResponse132,
  createResponse122_123,
  createResponse121,
  createResponse113,
  createResponse141,
  createResponse142,
  getResponsesByCriteriaCode,
   score113,
   score122,
   score133,
   score121,
   score123,
   score132,
   score141,
   score142,
  

};