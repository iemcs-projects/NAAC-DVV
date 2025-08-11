import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const Criteria623 = db.response_6_2_3;
const Criteria632 = db.response_6_3_2;
const Criteria633 = db.response_6_3_3;
const Criteria634 = db.response_6_3_4;
const Criteria642 = db.response_6_4_2;
const Criteria653 = db.response_6_5_3;
const CriteriaMaster = db.criteria_master;
const Score = db.scores;
const IIQA = db.iiqa_form;
const IIQA_Student_Details = db.iiqa_student_details;
const IIQAStaffDetails = db.iiqa_staff_details;
const extended_profile = db.extended_profile;


// Convert criteria code to padded format (e.g., '6.2.3' -> '060203')
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


//6.2.3


const createResponse623 = asyncHandler(async (req, res) => {
  const {
    session,
    implimentation,
    area_of_e_governance,
    year_of_implementation
  } = req.body;

  // Step 1: Field validation
  if (
    session === undefined ||
    implimentation === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (implimentation < 0 || implimentation > 4) {
    throw new apiError(400, "Implementation must be between 0 and 4");
  }

  // Step 2: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '06',
      sub_criterion_id: '0602',
      sub_sub_criterion_id: '060203'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 3: Validate session window against latest IIQA
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

  // Step 4: Create or update response
  let [entry, created] = await Criteria623.findOrCreate({
    where: { session,
      area_of_e_governance,
      year_of_implementation
     },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      implimentation,
      area_of_e_governance,
      year_of_implementation
    }
  });

  if (!created) {
    await entry.update({ implimentation });
  }

  // Step 5: Return API response
  return res.status(201).json(
    new apiResponse(
      201,
      entry,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});


const score623 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("6.2.3");
  const currentYear = new Date().getFullYear();
  const session = currentYear;

  // Step 1: Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 6.2.3 not found in criteria_master");
  }

  // Step 2: Get latest response
  const response = await Criteria623.findOne({
    where: {
      criteria_code: criteria.criteria_code
    },
    order: [['id', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 6.2.3");
  }

  const implementation = Number(response.implimentation); // Get the implementation value

  let score, grade;

  // Map implementation to score and grade (0-4 scale)
  switch (implementation) {
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
      implementation,
      grade,
      message: `Grade is ${grade} (Implementation level: ${implementation})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});
 //6.3.2


 const createResponse632 = asyncHandler(async (req, res) => {
  /*
    1. Extract input from req.body
    2. Validate required fields and logical constraints
    3. Get criteria_code from criteria_master
    4. Get latest IIQA session and validate session window
    5. Create or update response in response_6_3_2 table
  */

  const {
    session,
    year,
    teacher_name,
    conference_name,
    professional_body,
    amt_of_spt_received,
  } = req.body;

  // Step 1: Field validation
  if (
    !session ||
    !year ||
    !teacher_name ||
    !conference_name ||
    !professional_body ||
    !amt_of_spt_received
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (year < 1990 || year > currentYear) {
    throw new apiError(400, "Year must be between 1990 and current year");
  }

  // Step 2: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '06',
      sub_criterion_id: '0603',
      sub_sub_criterion_id: '060302'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 3: Validate session window against IIQA
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

  // Step 4: Create or update response
  let [entry, created] = await Criteria632.findOrCreate({
    where: {
      session,
      teacher_name,
      conference_name
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      teacher_name,
      conference_name,
      professional_body,
      amt_of_spt_received
    }
  });

  if (!created) {
    await Criteria632.update({
      year,
      professional_body,
      amt_of_spt_received
    }, {
      where: {
        session,
        teacher_name,
        conference_name
      }
    });

    entry = await Criteria632.findOne({
      where: {
        session,
        teacher_name,
        conference_name
      }
    });
  }

  return res.status(201).json(
    new apiResponse(201, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const score632 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("6.3.2");

  // 1. Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // 2. Get latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "IIQA not found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5; // 5 years total (inclusive)

  // 3. Get total number of teachers from extended profile
  const extendedProfile = await extended_profile.findOne({
    order: [['id', 'DESC']],
    raw: true
  });

  if (!extendedProfile) {
    throw new apiError(404, "Extended profile not found");
  }

  // Try all possible keys
  const totalTeachers =
    parseInt(extendedProfile.full_time_teachers)

    0;

  if (isNaN(totalTeachers) || totalTeachers <= 0) {
    throw new apiError(400, "Valid total number of teachers not found or is zero");
  }

  // 4. Fetch 6.3.2 responses in that 5-year range
  const responses = await Criteria632.findAll({
    attributes: ['session', 'teacher_name'],
    where: {
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    },
    raw: true
  });

  // 5. Group unique teachers by session
  const yearlyTeachers = {};
  for (const res of responses) {
    if (!yearlyTeachers[res.session]) {
      yearlyTeachers[res.session] = new Set();
    }
    yearlyTeachers[res.session].add(res.teacher_name);
  }

  // 6. Calculate percentage per year
  const yearlyPercentages = [];
  for (const [year, teachersSet] of Object.entries(yearlyTeachers)) {
    const uniqueTeachers = teachersSet.size;
    const percentage = (uniqueTeachers / totalTeachers) * 100;
    yearlyPercentages.push({
      year: parseInt(year),
      percentage: parseFloat(percentage.toFixed(2)),
      teachersCount: uniqueTeachers,
      totalTeachers
    });
  }

  // 7. Calculate average percentage
  let averagePercentage = 0;
  if (yearlyPercentages.length > 0) {
    const totalPercentage = yearlyPercentages.reduce((sum, item) => sum + item.percentage, 0);
    averagePercentage = parseFloat((totalPercentage / yearlyPercentages.length).toFixed(2));
  }

  // 8. Calculate grade
  let grade;
  if (averagePercentage >= 50) grade = 4;
  else if (averagePercentage >= 40) grade = 3;
  else if (averagePercentage >= 20) grade = 2;
  else if (averagePercentage >= 5) grade = 1;
  else grade = 0;

  // 9. Upsert into Score table
  let entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session
    }
  });

  if (!entry) {
    entry = await Score.create({
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session,
      cycle_year: 1
    });
  } else {
    await entry.update({
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      averagePercentage,
      grade,
      yearlyBreakdown: yearlyPercentages,
      totalTeachers,
      message: `Average ${averagePercentage}% of teachers received support over the last 5 years`
    }, "Score 6.3.2 calculated and updated successfully")
  );
});


//6.3.3

const createResponse633 = asyncHandler(async (req, res) => {
  const {
    session,
    from_to_date,
    title_of_prof_dev,
    title_of_add_training
  } = req.body;

  // Step 1: Field validation
  if (!session || !from_to_date || !title_of_prof_dev || !title_of_add_training) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  // Step 2: Prevent duplicate entries
  const duplicate = await Criteria633.findOne({
    where: { session, from_to_date, title_of_prof_dev, title_of_add_training }
  });

  if (duplicate) {
    throw new apiError(409, "Entry already exists for this session with the same date and titles");
  }

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '06',
      sub_criterion_id: '0603',
      sub_sub_criterion_id: '060303'
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

  // Step 5: Create new entry
  const newEntry = await Criteria633.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    from_to_date,
    title_of_prof_dev,
    title_of_add_training
  });

  return res.status(201).json(
    new apiResponse(201, newEntry, "Response created successfully")
  );
});

const score633 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("6.3.3");

  // 1. Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // 2. Get latest IIQA session range
  const currentIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!currentIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const startYear = currentIIQA.session_end_year - 4; // 5 years total
  const endYear = currentIIQA.session_end_year;

  if (session < startYear || session > endYear) {
    throw new apiError(400, "Session must be between the latest IIQA session and the current year");
  }

  // 3. Fetch all responses from the last 5 years
  const responses = await Criteria633.findAll({
    attributes: ['title_of_prof_dev', 'title_of_add_training', 'session'],
    where: {
      criteria_code: criteria.criteria_code,
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    },
    raw: true
  });

  if (!responses.length) {
    throw new apiError(404, "No responses found for Criteria 6.3.3 in the session range");
  }

  // 4. Count total valid entries (where either title is provided)
  let totalValidEntries = 0;
  responses.forEach(response => {
    if (response.title_of_prof_dev || response.title_of_add_training) {
      totalValidEntries++;
    }
  });

  // 5. Calculate score (total valid entries / 5)
  const score = (totalValidEntries / 5).toFixed(2);

  // 6. Calculate grade
  let grade;
  if (score >= 50) grade = 4;
  else if (score >= 40) grade = 3;
  else if (score >= 20) grade = 2;
  else if (score >= 5) grade = 1;
  else grade = 0;

  // 7. Create or update score
  let entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session
    }
  });

  if (!entry) {
    entry = await Score.create({
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session,
      cycle_year: 1
    });
  } else {
    await Score.update({
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade
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
      score,
      grade,
      totalValidEntries,
      message: `Score calculated successfully with ${totalValidEntries} valid entries over 5 years`
    }, "Score 6.3.3 calculated and updated successfully")
  );
});


//6.3.4

const createResponse634 = asyncHandler(async (req, res) => {
  const {
    session,
    teacher_name,
    program_title,
    from_to_date
  } = req.body;

  // Step 1: Field validation
  if (!session || !teacher_name || !program_title || !from_to_date) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  // Step 2: Prevent duplicates — same session + teacher + program_title
  const duplicate = await Criteria634.findOne({
    where: { session, teacher_name, program_title }
  });

  if (duplicate) {
    throw new apiError(409, "Entry already exists for this teacher, session, and program");
  }

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '06',
      sub_criterion_id: '0603',
      sub_sub_criterion_id: '060304'
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

  // Step 5: Create new entry
  const newEntry = await Criteria634.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    teacher_name,
    program_title,
    from_to_date
  });

  return res.status(201).json(
    new apiResponse(201, newEntry, "Response created successfully")
  );
});


const score634 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("6.3.4");

  // 1. Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // 2. Get latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "IIQA not found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5; // 5 years total (inclusive)

  // 3. Get total number of teachers from extended profile
  const extendedProfile = await extended_profile.findOne({
    order: [['id', 'DESC']],
    raw: true
  });

  if (!extendedProfile) {
    throw new apiError(404, "Extended profile not found");
  }

  const totalTeachers = parseInt(extendedProfile.full_time_teachers) || 0;

  if (isNaN(totalTeachers) || totalTeachers <= 0) {
    throw new apiError(400, "Valid total number of teachers not found or is zero");
  }

  // 4. Fetch 6.3.4 responses in that 5-year range
  const responses = await Criteria634.findAll({
    attributes: ['session', 'teacher_name'],
    where: {
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    },
    raw: true
  });

  // 5. Group unique teachers by session
  const yearlyTeachers = {};
  for (const res of responses) {
    if (!yearlyTeachers[res.session]) {
      yearlyTeachers[res.session] = new Set();
    }
    yearlyTeachers[res.session].add(res.teacher_name);
  }

  // 6. Calculate percentage per year
  const yearlyPercentages = [];
  for (const [year, teachersSet] of Object.entries(yearlyTeachers)) {
    const uniqueTeachers = teachersSet.size;
    const percentage = (uniqueTeachers / totalTeachers) * 100;
    yearlyPercentages.push({
      year: parseInt(year),
      percentage: parseFloat(percentage.toFixed(2)),
      teachersCount: uniqueTeachers,
      totalTeachers
    });
  }

  // 7. Calculate average percentage over 5 years
  let averagePercentage = 0;
  if (yearlyPercentages.length > 0) {
    const totalPercentage = yearlyPercentages.reduce((sum, item) => sum + item.percentage, 0);
    averagePercentage = parseFloat((totalPercentage / 5).toFixed(2)); // Divide by 5 for 5-year average
  }

  // 8. Calculate grade
  let grade;
  if (averagePercentage >= 50) grade = 4;
  else if (averagePercentage >= 40) grade = 3;
  else if (averagePercentage >= 20) grade = 2;
  else if (averagePercentage >= 5) grade = 1;
  else grade = 0;

  // 9. Upsert into Score table
  let entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session
    }
  });

  if (!entry) {
    entry = await Score.create({
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session,
      cycle_year: 1
    });
  } else {
    await entry.update({
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade
    });
  }

  return res.status(200).json(
    new apiResponse(200, {
      averagePercentage,
      grade,
      yearlyBreakdown: yearlyPercentages,
      totalTeachers,
      message: `Average ${averagePercentage}% of teachers received support over the last 5 years`
    }, "Score 6.3.4 calculated and updated successfully")
  );
});


//6.4.2

const createResponse642 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    donor_name,
    grant_amount_lakhs
  } = req.body;

  // Step 1: Field validation
  if (!session || !year || !donor_name || grant_amount_lakhs === undefined) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear || year < 1990 || year > currentYear) {
    throw new apiError(400, "Year and session must be between 1990 and current year");
  }

  if (grant_amount_lakhs < 0) {
    throw new apiError(400, "Grant amount cannot be negative");
  }

  // Step 2: Prevent duplicates — same session + year + donor
  const duplicate = await Criteria642.findOne({
    where: { session, year, donor_name }
  });

  if (duplicate) {
    throw new apiError(409, "Entry already exists for this session, year, and donor");
  }

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '06',
      sub_criterion_id: '0604',
      sub_sub_criterion_id: '060402'
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

  // Step 5: Create new entry
  const newEntry = await Criteria642.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    year,
    donor_name,
    grant_amount_lakhs
  });

  return res.status(201).json(
    new apiResponse(201, newEntry, "Response created successfully")
  );
});

const score642 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("6.4.2");

  // 1. Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // 2. Get latest IIQA session range
  const currentIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!currentIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const startYear = currentIIQA.session_end_year - 4; // 5 years total
  const endYear = currentIIQA.session_end_year;

  if (session < startYear || session > endYear) {
    throw new apiError(400, "Session must be between the latest IIQA session and the current year");
  }

  // 3. Fetch all grant amounts from the last 5 years
  const responses = await Criteria642.findAll({
    attributes: ['grant_amount_lakhs', 'session'],
    where: {
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      },
      grant_amount_lakhs: {
        [Sequelize.Op.ne]: null // Only include records with non-null grant amounts
      }
    },
    raw: true
  });

  // 4. Calculate total grant amount across all years
  let totalGrantAmount = 0;
  responses.forEach(response => {
    if (response.grant_amount_lakhs) {
      totalGrantAmount += parseFloat(response.grant_amount_lakhs) || 0;
    }
  });

  // 5. Calculate average grant amount per year
  const averageGrantPerYear = (totalGrantAmount / 5).toFixed(2);

  // 6. Calculate score based on the average grant amount
  let score;
  let grade;
  
  if (averageGrantPerYear >= 100) {
    score = 4;
    grade = 4;
  } else if (averageGrantPerYear >=80 && averageGrantPerYear < 100) {
    score = 3;
    grade = 3;
  } else if (averageGrantPerYear >= 60 && averageGrantPerYear < 80) {
    score = 2;
    grade = 2;
  } else if (averageGrantPerYear >=30 && averageGrantPerYear < 60) {
    score = 1;
    grade = 1;
  } else {
    score = 0;
    grade = 0;
  }

  // 7. Create or update score
  let entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session
    }
  });

  if (!entry) {
    entry = await Score.create({
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session,
      cycle_year: 1
    });
  } else {
    await Score.update({
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade
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
      totalGrantAmount: parseFloat(totalGrantAmount.toFixed(2)),
      averageGrantPerYear: parseFloat(averageGrantPerYear),
      score,
      grade,
      message: `Average grant amount of ₹${averageGrantPerYear} lakhs per year over 5 years`
    }, "Score 6.4.2 calculated and updated successfully")
  );
});


//6.5.3


const createResponse653 = asyncHandler(async (req, res) => {
  const {
    session,
    initiative_type,
    year,
    reg_meetings_of_the_IQAC_head,
    conf_seminar_workshops_on_quality_edu,
    collab_quality_initiatives,
    participation_in_NIRF,
    from_to_date,
    other_quality_audit,
  } = req.body;

  // Step 1: Validate input fields
  if (
    session === undefined ||
    initiative_type === undefined ||
    year === undefined ||
    reg_meetings_of_the_IQAC_head === undefined ||
    conf_seminar_workshops_on_quality_edu === undefined ||
    collab_quality_initiatives === undefined ||
    participation_in_NIRF === undefined ||
    from_to_date === undefined ||
    other_quality_audit === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const currentYear = new Date().getFullYear();
  if (session < 1990 || session > currentYear || year < 1990 || year > currentYear) {
    throw new apiError(400, "Session and year must be between 1990 and current year");
  }

  if (initiative_type < 0 || initiative_type > 4) {
    throw new apiError(400, "Initiative type must be between 0 and 4");
  }

  // Step 2: Get Criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '06',
      sub_criterion_id: '0605',
      sub_sub_criterion_id: '060503'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 3: Validate session range using latest IIQA
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

  // Step 4: Update or Create Entry
  let entry;
  const existingRecord = await Criteria653.findOne({ where: { session } });

  if (existingRecord) {
    await Criteria653.update(
      { initiative_type },
      { where: { session } }
    );
    entry = await Criteria653.findOne({ where: { session } });
  } else {
    entry = await Criteria653.create({
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      initiative_type,
      year,
      reg_meetings_of_the_IQAC_head,
      conf_seminar_workshops_on_quality_edu,
      collab_quality_initiatives,
      participation_in_NIRF,
      from_to_date,
      other_quality_audit,
    });
  }

  return res.status(201).json(
    new apiResponse(201, entry, existingRecord ? "Response updated successfully" : "Response created successfully")
  );
});

const score653 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("6.5.3");
  const currentYear = new Date().getFullYear();
  const session = currentYear;

  // Step 1: Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 6.5.3 not found in criteria_master");
  }

  // Step 2: Get latest response
  const response = await Criteria653.findOne({
    where: {
      criteria_code: criteria.criteria_code
    },
    order: [['id', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 6.5.3");
  }

  const initiativeType = Number(response.initiative_type); // Get the initiative_type value

  let score, grade;

  // Map initiative_type to score and grade (0-4 scale)
  // The mapping is direct since initiative_type is already in 0-4 scale
  switch (initiativeType) {
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
      initiativeType,
      grade,
      message: `Grade is ${grade} (Initiative type: ${initiativeType})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const getResponsesByCriteriaCode = asyncHandler(async (req, res) => {
  const { criteriaCode } = req.params;

  const responses = await Criteria6.findAll({
    where: { criteria_code: criteriaCode }
  });

  return res.status(200).json(
    new apiResponse(200, responses, "Responses retrieved successfully")
  );
});

const getAllCriteria6 = asyncHandler(async (req, res) => {
  const responses = await Criteria6.findAll();

  return res.status(200).json(
    new apiResponse(200, responses, "Responses retrieved successfully")
  );
});

export { getResponsesByCriteriaCode,getAllCriteria6, createResponse623, createResponse632, createResponse633, createResponse634, createResponse642, createResponse653, score623, score632, score633,score634,score642,score653 };