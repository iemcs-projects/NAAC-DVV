
import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const Criteria211 = db.response_2_1_1;
const Criteria212 = db.response_2_1_2;
// const Criteria241243222233 = db.response_2_4_1_2_4_3_2_2_2_2_3_3;
const Criteria241 = db.response_2_4_1;
const Criteria243 = db.response_2_4_3;
const Criteria222 = db.response_2_2_2;
const Criteria233 = db.response_2_3_3;
const Criteria242 = db.response_2_4_2;
const Criteria263 = db.response_2_6_3;
const Criteria271 = db.response_2_7_1;
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




const updateResponse211 = asyncHandler(async (req, res) => {
  const { sl_no } = req.params;
  const {
    session,
    year,
    programme_name,
    programme_code,
    no_of_seats,
    no_of_students
  } = req.body;

  if (
    !session || !year || !programme_name || !programme_code ||
    no_of_seats === undefined || no_of_students === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const row = await Criteria211.findOne({ where: { sl_no } });

  if (!row) {
    throw new apiError(404, "Row not found");
  }

  // Check that session and year match (for extra safety)
  if (row.session !== session || row.year !== year) {
    throw new apiError(400, "Session/year mismatch — cannot update this row");
  }

  // Optional: session bounds check using IIQA form
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

  // Proceed with update
  await Criteria211.update({
    programme_name,
    programme_code,
    no_of_seats,
    no_of_students
  }, {
    where: { sl_no }
  });

  const updated = await Criteria211.findOne({ where: { sl_no } });

  return res.status(200).json(
    new apiResponse(200, updated, "Row updated successfully")
  );
});



const score211 = asyncHandler(async (req, res) => {
  /*
1. session is curent year 
2. get criteria from criteria master with the sub sub criterion id 
3. get latest IIQA session range
4.  check if session is between the latest IIQA session and the current year
5. fetch all responses for the criteria code and session range
6. group by year and calculate total seats and students
7. calculate score
8. create or update score and return score in score table
9. return score
*/
const session = new Date().getFullYear();
const criteria_code = convertToPaddedFormat("2.1.1");

const criteria = await CriteriaMaster.findOne({
  where: { sub_sub_criterion_id: criteria_code }
});

if (!criteria) {
  throw new apiError(404, "Criteria not found");
}
// 5 Years should be calculated form IIQA session DB
const currentIIQA = await IIQA.findOne({
  attributes: ['session_end_year'],
  order: [['created_at', 'DESC']] // Get the most recent IIQA form
});

if (!currentIIQA) {
  throw new apiError(404, "No IIQA form found");
}

const startDate = currentIIQA.session_end_year - 5;
const endDate = currentIIQA.session_end_year;

if (session < startDate || session > endDate) {
  throw new apiError(400, "Session must be between the latest IIQA session and the current year");
}

// Fetch all responses from the last 5 years
const responses = await Criteria211.findAll({
  attributes: ['no_of_seats', 'no_of_students', 'year'],
  where: {
    criteria_code: criteria.criteria_code,
    session: {
      [Sequelize.Op.between]: [startDate, endDate]
    }
  },
  order: [['session', 'DESC']]
});


if (!responses.length) {
  throw new apiError(404, "No responses found for Criteria 2.1.2 in the session range");
}

// Group responses by year
const groupedByYear = {};
responses.forEach(response => {
  const year = response.year;
  if (!groupedByYear[year]) {
    groupedByYear[year] = { seats: 0, students: 0 };
  }
  groupedByYear[year].seats += response.no_of_seats || 0;
  groupedByYear[year].students += response.no_of_students || 0;
});

console.log(groupedByYear);
// Calculate score for each year
const scores = [];
for (const year of Object.keys(groupedByYear).sort((a, b) => b - a)) {
  const { seats, students } = groupedByYear[year];
  if (seats > 0) {
    const yearlyScore = ((students / seats) * 100);
    scores.push(yearlyScore);
  }
}
console.log(scores);
if (scores.length === 0) {
  throw new apiError(400, "No valid data to compute score");
}

const average = (scores.reduce((sum, val) => sum + val, 0) / scores.length).toFixed(3);
console.log("Average:", average);
console.log("Scores:", scores);
let grade;
//grade calculation
if (average >= 80) {
    grade = 4;
}
else if (average >= 60) {
    grade = 3;
}
else if (average >= 40) {
    grade = 2;
}
else if (average >= 30) {
    grade = 1;
}
else {
    grade = 0;
}
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
      score_sub_sub_criteria: average,
      sub_sub_cr_grade: grade,
      session
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: average,
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
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});

const score212 = asyncHandler(async (req, res) => {
  /*
  1. session is curent year 
  2. get criteria from criteria master with the sub sub criterion id 
  3. get latest IIQA session range
  4.  check if session is between the latest IIQA session and the current year
  5. fetch all responses for the criteria code and session range
  6. group by year and calculate total seats and students
  7. calculate score
  8. create or update score and return score in score table
  9. return score
  */

  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.1.2");
  console.log("Current year session",session)
  // Step 1: Get corresponding criteria from master
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 2.1.2 not found in criteria_master");
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

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 3: Fetch relevant 2.1.2 responses
  const responses = await Criteria212.findAll({
    attributes: [
      'session',
      'number_of_seats_earmarked_for_reserved_category_as_per_GOI',
      'number_of_students_admitted_from_the_reserved_category'
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    },
    order: [['session', 'DESC']]
  });

  if (!responses.length) {
    throw new apiError(404, "No responses found for Criteria 2.1.2 in the session range");
  }

  // Step 4: Group by year and calculate scores
  const groupedByYear = responses.reduce((acc, response) => {
    const year = response.session;
    if (!acc[year]) {
      acc[year] = { totalSeats: 0, totalStudents: 0 };
    }

    acc[year].totalSeats += response.number_of_seats_earmarked_for_reserved_category_as_per_GOI || 0;
    acc[year].totalStudents += response.number_of_students_admitted_from_the_reserved_category || 0;
    return acc;
  }, {});

  const scores = Object.values(groupedByYear)
    .map(({ totalSeats, totalStudents }) => totalSeats > 0 ? totalStudents / totalSeats : 0)
    .filter(score => !isNaN(score));

  if (!scores.length) {
    throw new apiError(400, "Insufficient data to compute score");
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  console.log(groupedByYear)
  console.log(scores)
  console.log(average)
let grade=0;
  //grade calculation
  if (average >= 80) {
    grade = 4;
}
if (average >= 60) {
    grade = 3;
}
if (average >= 40) {
    grade = 2;
}
if (average >= 30) {
    grade = 1;
}
else {
    grade = 0;
}
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
      score_sub_sub_criteria: average,
      sub_sub_cr_grade: grade,
      session
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: average,
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
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse222_241_243 = asyncHandler(async (req, res) => {
  const {
    session,
    name_of_the_full_time_teacher,
    designation,
    year_of_appointment,
    nature_of_appointment,
    name_of_department,
    total_number_of_years_of_experience_in_the_same_institution,
    is_the_teacher_still_serving_the_institution
  } = req.body;

  // Validate required fields
  if (
    !year_of_appointment ||
    !name_of_the_full_time_teacher ||
    !designation ||
    !nature_of_appointment ||
    !name_of_department ||
    !total_number_of_years_of_experience_in_the_same_institution ||
    is_the_teacher_still_serving_the_institution === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const normalizedTeacherName = name_of_the_full_time_teacher.trim().toLowerCase();

  if (year_of_appointment < 1990 || year_of_appointment > new Date().getFullYear()) {
    throw new apiError(400, "Year must be between 1990 and current year");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  // Get IIQA session range for validation
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

  // Start a transaction
  const transaction = await db.sequelize.transaction();

  try {
    // Step 1: Get all 3 criteria from CriteriaMaster
    const criteriaList = await CriteriaMaster.findAll({
      where: {
        sub_sub_criterion_id: { [Sequelize.Op.in]: ['020202', '020401', '020403'] },
        sub_criterion_id: { [Sequelize.Op.in]: ['0202', '0204'] },
        criterion_id: '02'
      },
      transaction
    });

    if (!criteriaList || criteriaList.length !== 3) {
      await transaction.rollback();
      throw new apiError(404, "One or more criteria not found");
    }

    // Step 2: Map sub_sub_criterion_id to model
    const modelMap = {
      '020202': { model: Criteria222, name: '2.2.2' },
      '020401': { model: Criteria241, name: '2.4.1' },
      '020403': { model: Criteria243, name: '2.4.3' }
    };

    const responses = [];

    for (const criteria of criteriaList) {
      const { model: Model, name } = modelMap[criteria.sub_sub_criterion_id];
      if (!Model) continue;

      try {
        const [entry, created] = await Model.findOrCreate({
          where: {
            session,
            year_of_appointment,
            name_of_the_full_time_teacher: normalizedTeacherName,
            designation,
            name_of_department
          },
          defaults: {
            id: criteria.id, // Add the criteria ID
            criteria_code: criteria.criteria_code,
            session,
            year_of_appointment,
            name_of_the_full_time_teacher: normalizedTeacherName,
            designation,
            nature_of_appointment,
            name_of_department,
            total_number_of_years_of_experience_in_the_same_institution,
            is_the_teacher_still_serving_the_institution
          },
          transaction
        });

        responses.push({
          criteria: name,
          entry,
          created,
          message: created ? "Entry created successfully" : "Entry already exists"
        });

      } catch (error) {
        // Rollback and throw error
        await transaction.rollback();
        throw new apiError(400, `Error creating entry for criteria ${name}: ${error.message}`);
      }
    }

    // If we get here, all operations were successful
    await transaction.commit();

    return res.status(200).json(
      new apiResponse(200, { responses }, "Operation completed successfully")
    );

  } catch (error) {
    // If we get here, the transaction has already been rolled back
    // in one of the inner catch blocks
    throw error; // Let the error handler deal with it
  }
});

const score222 = asyncHandler(async (req, res) => {
  /*
  1. get the user input from the req body
  2. query the criteria_master table to get the id and criteria_code 
  3. validate the user input
  4. create a new response
  5. return the response
  */
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.2.2");
  console.log(criteria_code)
  console.log(CriteriaMaster)
  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria){
    throw new apiError
  }

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

  const totalStudents = await getTotalStudents();
  const teacherCount = await getTeacherCount();

  console.log("Teacher Count", teacherCount)
  console.log("Student COunt", totalStudents)
  // Calculate and format student-teacher ratio (students per teacher)
  const ratio = teacherCount > 0 ? Math.round(totalStudents / teacherCount) : 0;
  const score = parseFloat(`${ratio}.1`);
  console.log("Ratio", ratio)
  console.log("Score", score)
  
  let grade;
  if (score <= 20)
     grade = 4;
  else if (score <= 30)
     grade = 3;
  else if (score <= 40)
     grade = 2;
  else if (score <= 50)
     grade = 1;
  else
     grade = 0;
  
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
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse242 = asyncHandler(async (req, res) => {
  const {
    session,
    number_of_full_time_teachers,
    qualification,
    year_of_obtaining_the_qualification,
    whether_recognised_as_research_guide,
    year_of_recognition_as_research_guide
  } = req.body;

  // Convert to numbers in case values come as strings
  const sessionYear = Number(session);
  const numberoffulltimeteachers = Number(number_of_full_time_teachers);
  const qualificationValue = String(qualification); // Changed variable name to avoid conflict
  const yearOfQualification = Number(year_of_obtaining_the_qualification);
  const isResearchGuide = String(whether_recognised_as_research_guide);
  const formattedIsResearchGuide = isResearchGuide.toUpperCase();
  const yearOfRecognition = Number(year_of_recognition_as_research_guide);

  // Validate required fields
  if (
    !sessionYear ||
    !numberoffulltimeteachers ||
    !qualificationValue ||
    !yearOfQualification ||
    !formattedIsResearchGuide ||
    !yearOfRecognition
  ) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  if (sessionYear < 1990 || sessionYear > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (yearOfQualification < 1990 || yearOfQualification > new Date().getFullYear()) {
    throw new apiError(400, "Year of obtaining the qualification must be between 1990 and current year");
  }

  if (yearOfRecognition < 1990 || yearOfRecognition > new Date().getFullYear()) {
    throw new apiError(400, "Year of recognition as research guide must be between 1990 and current year");
  }

  if (yearOfRecognition < yearOfQualification) {
    throw new apiError(400, "Year of recognition as research guide must be greater than or equal to year of obtaining the qualification");
  }

  // Fetch Criteria Code from Master Table
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '020402',
      sub_criterion_id: '0204',
      criterion_id: '02'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Get IIQA session range for validation
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "IIQA not found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Create or update entry
  let [entry, created] = await Criteria242.findOrCreate({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      number_of_full_time_teachers: numberoffulltimeteachers,
      qualification: qualificationValue,
      year_of_obtaining_the_qualification: yearOfQualification,
      whether_recognised_as_research_guide: formattedIsResearchGuide,
      year_of_recognition_as_research_guide: yearOfRecognition
    }
  });

  // If entry exists, update it
  if (!created) {
    await Criteria242.update({
      number_of_full_time_teachers: numberoffulltimeteachers,
      qualification: qualificationValue,
      year_of_obtaining_the_qualification: yearOfQualification,
      whether_recognised_as_research_guide: formattedIsResearchGuide,
      year_of_recognition_as_research_guide: yearOfRecognition
    }, {
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code
      },
      returning: true
    });

    // Fetch the updated entry
    entry = await Criteria242.findOne({
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, 
      created ? "Response created successfully" : "Response updated successfully")
  );
});

const createResponse211 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    programme_name,
    programme_code,
    no_of_seats,
    no_of_students
  } = req.body;

  // Step 1: Field validation
  if (
    !session || !year || !programme_name || !programme_code ||
    no_of_seats === undefined || no_of_students === undefined
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

  if (no_of_seats < 0 || no_of_students < 0) {
    throw new apiError(400, "Number of seats and students cannot be negative");
  }

  if (no_of_seats < no_of_students) {
    throw new apiError(400, "Number of seats cannot be less than number of students");
  }

  // Step 2: Prevent duplicates — same session + year + programme_code
  const duplicate = await Criteria211.findOne({
    where: { session, year, programme_code }
  });

  if (duplicate) {
    throw new apiError(409, "Entry already exists for this session, year, and programme");
  }

  // Step 3: Fetch criteria details
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '02',
      sub_criterion_id: '0201',
      sub_sub_criterion_id: '020101'
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
  const newEntry = await Criteria211.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    year,
    programme_name,
    programme_code,
    no_of_seats,
    no_of_students
  });

  return res.status(201).json(
    new apiResponse(201, newEntry, "Response created successfully")
  );
});

const createResponse212 = asyncHandler(async (req, res) => {
  /*
  1. get the user input from the req body
  2. query the criteria_master table to get the id and criteria_code 
  3. validate the user input(check for missing data, year and session must be between 1990 and current year and req body logic)
  4. Fetch the criteria_code from the criteria_master table
  5. Fetch the latest IIQA session
  6. check if the session is between the latest IIQA session and the current year
  7. create a new response or Update the existing response
  8. return the response
  */

  const {
    session,
    year,
    number_of_seats_earmarked_for_reserved_category_as_per_GOI,
    number_of_students_admitted_from_the_reserved_category
  } = req.body;

  // Convert to numbers in case values come as strings
  const sessionYear = Number(session);
  const entryYear = Number(year);
  const numberOfSeats = Number(number_of_seats_earmarked_for_reserved_category_as_per_GOI);
  const numberOfStudents = Number(number_of_students_admitted_from_the_reserved_category);

  // Validate required fields
  if (
    !sessionYear || !entryYear ||
    isNaN(numberOfSeats) || isNaN(numberOfStudents)
  ) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  if (sessionYear < 1990 || sessionYear > new Date().getFullYear()) {
    throw new apiError(400, "Session must be between 1990 and the current year");
  }

  if (entryYear < 1990 || entryYear > new Date().getFullYear()) {
    throw new apiError(400, "Year must be between 1990 and the current year");
  }

  if (numberOfSeats < 0 || numberOfStudents < 0) {
    throw new apiError(400, "Number of seats and students cannot be negative");
  }

  if (numberOfSeats < numberOfStudents) {
    throw new apiError(400, "Number of seats cannot be less than number of students admitted");
  }

  // Fetch Criteria Code from Master Table
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '020102',
      sub_criterion_id: '0201',
      criterion_id: '02'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Get IIQA session range for validation
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Upsert logic
  let [entry, created] = await Criteria212.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      year: entryYear
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      year: entryYear,
      number_of_seats_earmarked_for_reserved_category_as_per_GOI: numberOfSeats,
      number_of_students_admitted_from_the_reserved_category: numberOfStudents
    }
  });

  // If already exists, update it
  if (!created) {
    await Criteria212.update({
      number_of_seats_earmarked_for_reserved_category_as_per_GOI: numberOfSeats,
      number_of_students_admitted_from_the_reserved_category: numberOfStudents
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: sessionYear,
        year: entryYear
      }
    });

    // Fetch updated entry
    entry = await Criteria212.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: sessionYear,
        year: entryYear
      }
    });
  }

  return res.status(201).json(
    new apiResponse(201, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const createResponse263 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    programme_name,
    programme_code,
    number_of_students_appeared_in_the_final_year_examination,
    number_of_students_passed_in_the_final_year_examination
  } = req.body;

  // Convert to numbers
  const sessionYear = Number(session);
  const entryYear = Number(year);
  const numAppeared = Number(number_of_students_appeared_in_the_final_year_examination);
  const numPassed = Number(number_of_students_passed_in_the_final_year_examination);

  // Step 1: Validate required fields
  if (
    !sessionYear || !entryYear || !programme_name || !programme_code ||
    isNaN(numAppeared) || isNaN(numPassed)
  ) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();

  if (sessionYear < 1990 || sessionYear > currentYear) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (entryYear < 1990 || entryYear > currentYear) {
    throw new apiError(400, "Year must be between 1990 and current year");
  }

  if (numAppeared < 0 || numPassed < 0) {
    throw new apiError(400, "Number of students cannot be negative");
  }

  if (numPassed > numAppeared) {
    throw new apiError(400, "Number of students passed cannot exceed those who appeared");
  }

  // Step 2: Fetch criteria from master
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '02',
      sub_criterion_id: '0206',
      sub_sub_criterion_id: '020603'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  // Step 3: Fetch latest IIQA session range
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Insert or Update response
  let [entry, created] = await Criteria263.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      year: entryYear,
      program_name:programme_name,
      program_code:programme_code
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      year: entryYear,
      program_name:programme_name,
      program_code:programme_code,
      number_of_students_appeared_in_the_final_year_examination: numAppeared,
      number_of_students_passed_in_the_final_year_examination: numPassed
    }
  });

  if (!created) {
    await Criteria263.update({
      number_of_students_appeared_in_the_final_year_examination: numAppeared,
      number_of_students_passed_in_the_final_year_examination: numPassed,
      program_name:programme_name,
      program_code:programme_code
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: sessionYear,
        year: entryYear,
        program_name:programme_name,
        program_code:programme_code
      }
    });

    // Re-fetch updated entry
    entry = await Criteria263.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: sessionYear,
        year: entryYear,
        program_name:programme_name,
        program_code:programme_code
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry,
      created ? "Response created successfully" : "Response updated successfully")
  );
});

const score242 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.4.2");

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
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // 3. Fetch 2.4.2 responses in that 5-year range
  const responses = await Criteria242.findAll({
    attributes: ['session', 'number_of_full_time_teachers'],
    where: {
      session: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    },
    raw: true
  });

  if (!responses.length) {
    throw new apiError(404, "No responses found for the given criteria 2.4.2 and session range");
  }

  // 4. Group responses by session
  const grouped = {};
  for (const res of responses) {
    if (!grouped[res.session]) {
      grouped[res.session] = 0;
    }
    grouped[res.session] += res.number_of_full_time_teachers || 0;
  }

  // 5. Compute yearly score array and average
  const yearlyScores = Object.values(grouped).map(val => val); // All are just values
  const total = yearlyScores.reduce((sum, val) => sum + val, 0);
  const count = yearlyScores.length;

  let average = 0;
  if (count > 0) {
    average = parseFloat((total / count).toFixed(2));
  }

  let grade;
  if (average >= 75) grade = 4;
   else if (average >= 60) grade = 3;
   else if (average >= 50) grade = 2;
   else if (average >= 30) grade = 1;
   else grade = 0;
  // 6. Upsert into Score table
  let entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
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
      score_sub_sub_criteria: average,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    });
  } else {
    await Score.update({
      score_sub_sub_criteria: average,
      sub_sub_cr_grade: grade
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  }

  res.status(200).json(
    new apiResponse(200, entry, "Score 2.4.2 calculated and updated successfully")
  );
});

const score263 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.6.3");

  // Get criteria
  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 2.6.3 not found in criteria_master");
  }

  // Get latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  // Fetch responses
  const responses = await Criteria263.findAll({
    attributes: [
      'session',
      'number_of_students_appeared_in_the_final_year_examination',
      'number_of_students_passed_in_the_final_year_examination'
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: {
        [Sequelize.Op.gte]: startYear,
        [Sequelize.Op.lte]: endYear
      }
    },
    order: [['session', 'DESC']]
  });

  if (responses.length === 0) {
    throw new apiError(404, "No responses found for the given period");
  }

  // Calculate total appeared and passed
  const totals = responses.reduce((acc, response) => {
    acc.totalAppeared += response.number_of_students_appeared_in_the_final_year_examination || 0;
    acc.totalPassed += response.number_of_students_passed_in_the_final_year_examination || 0;
    return acc;
  }, { totalAppeared: 0, totalPassed: 0 });

  // Calculate score (percentage)
  const score = totals.totalAppeared > 0 
    ? (totals.totalPassed / totals.totalAppeared) * 100 
    : 0;
    let grade;
    if (score >= 90) grade = 4;
    else if (score >= 80) grade = 3;
    else if (score >= 70) grade = 2;
    else if (score >= 60) grade = 1;
    else grade = 0;
  // Create score entry
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
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: currentYear,
    cycle_year: 1
    }
});

    if(!created) {
      await Score.update({
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade
      }, {
        where: {
          criteria_code: criteria.criteria_code,
          session: currentYear
        }
      });
    }

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });

    return res.status(200).json(
      new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});

const score243 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.4.3");

  // Get criteria from master table
  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 2.4.3 not found in criteria_master");
  }

  // Get latest IIQA session
// Get latest IIQA form
const latestIIQA = await IIQA.findOne({
attributes: ['id', 'session_end_year'],
order: [['created_at', 'DESC']]
});

if (!latestIIQA) {
throw new apiError(404, "No IIQA form found");
}

// Calculate date range
const endYear = latestIIQA.session_end_year;
const startYear = endYear - 5;

// Get extended profile for the latest IIQA form
const latestExtendedProfile = await db.extended_profile.findOne({
where: {
  iiqa_form_id: latestIIQA.id,
  year: {
    [Sequelize.Op.lte]: endYear,
    [Sequelize.Op.gte]: startYear
  }
},
order: [['year', 'DESC']]
});

if (!latestExtendedProfile) {
throw new apiError(404, `No extended profile found for IIQA form ${latestIIQA.id} between ${startYear} and ${endYear}`);
}

if (latestExtendedProfile.full_time_teachers === null || latestExtendedProfile.full_time_teachers === undefined) {
throw new apiError(400, "Full-time teachers data is missing in the extended profile");
}

const fullTimeTeacherCount = latestExtendedProfile.full_time_teachers;

  // Get all experience records for the criteria
  const responses = await Criteria243.findAll({
    attributes: [
      'total_number_of_years_of_experience_in_the_same_institution',
      'session'
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: {
        [Sequelize.Op.gte]: startYear,
        [Sequelize.Op.lte]: endYear
      }
    }
  });

  if (responses.length === 0) {
    throw new apiError(404, "No experience records found for the given period");
  }

  // Calculate total experience
  const totalExperience = responses.reduce((sum, response) => {
    return sum + (Number(response.total_number_of_years_of_experience_in_the_same_institution) || 0);
  }, 0);

  // Calculate average experience
  const averageExperience = fullTimeTeacherCount > 0 
    ? totalExperience / fullTimeTeacherCount 
    : 0;

    let grade;
    if (averageExperience >= 15) grade = 4;
    else if (averageExperience >= 12) grade = 3;
    else if (averageExperience >= 9) grade = 2;
    else if (averageExperience >= 6) grade = 1;
    else grade = 0;
  // Create or update score entry
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
      score_sub_sub_criteria: averageExperience,
      sub_sub_cr_grade: grade,
      session: currentYear,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averageExperience,
      sub_sub_cr_grade: grade
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });
  }

  // Fetch the updated entry
  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: currentYear
    }
  });

  return res.status(200).json(
    new apiResponse(200, {
      average_experience: averageExperience,
      total_experience: totalExperience,
      full_time_teacher_count: fullTimeTeacherCount,
      score_entry: entry
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});


const score241 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.4.1");

  // Get criteria from master table
  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 2.4.1 not found in criteria_master");
  }

  // Get latest IIQA form to determine the year range
  const latestIIQA = await IIQA.findOne({
    attributes: ['id', 'session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  // Calculate date range (last 5 years)
  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  // Get extended profiles for the last 5 years
  const extendedProfiles = await extended_profile.findAll({
    where: {
      year: {
        [Sequelize.Op.between]: [startYear, endYear]
      }
    },
    order: [['year', 'ASC']]
  });

  if (!extendedProfiles || extendedProfiles.length === 0) {
    throw new apiError(404, `No extended profiles found between ${startYear} and ${endYear}`);
  }

  // Create object with year as keys and teacher/post data as values
  const yearlyData = {};
  const ratioArray = [];

  extendedProfiles.forEach(profile => {
    const year = profile.year;
    const fullTimeTeachers = profile.full_time_teachers || 0;
    const sanctionedPosts = profile.sanctioned_posts || 0;
    
    // Store the data
    yearlyData[year] = {
      full_time_teachers: fullTimeTeachers,
      sanctioned_posts: sanctionedPosts
    };

    // Calculate ratio if both values are available and non-zero
    if (sanctionedPosts > 0) {
      ratioArray.push(fullTimeTeachers / sanctionedPosts);
    }
  });

  // Calculate average ratio
  const averageRatio = ratioArray.length > 0 
    ? ratioArray.reduce((sum, ratio) => sum + ratio, 0) / ratioArray.length
    : 0;

    let grade;
    if (averageRatio >= 75) grade = 4;
    else if (averageRatio >= 65) grade = 3;
    else if (averageRatio >= 50) grade = 2;
    else if (averageRatio >= 40) grade = 1;
    else grade = 0;
  // Create or update score entry
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
      score_sub_sub_criteria: averageRatio,
      sub_sub_cr_grade: grade,
      session: currentYear,
      cycle_year: 1
    }
  });


  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averageRatio,
      sub_sub_cr_grade: grade
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: currentYear
      }
    });
  }

  // Fetch the updated entry
  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: currentYear
    }
  });

  return res.status(200).json(
    new apiResponse(200, {
      yearly_data: yearlyData,
      ratio_array: ratioArray,
      average_ratio: averageRatio,
      score_entry: entry
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

const createResponse233 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("2.3.3");

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 2.3.3 not found in criteria_master");
  }
  const { session, numberOfMentors, numberOfMentees } = req.body;
  console.log(session, numberOfMentors, numberOfMentees);

  if (!session || !numberOfMentors || !numberOfMentees) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

  if (numberOfMentors < 0 || numberOfMentees < 0) {
    throw new apiError(400, "Number of mentors and mentees must be non-negative");
  }

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
    throw new apiError(400, "Session must be between the last 5 years");
  }

  const responses = await Criteria233.findAll({
    where: {
      session: session
    }
  });

  if (responses.length > 0) {
    throw new apiError(400, "Response already exists for this session");
  }

  console.log("reached till here")

  const newResponse = await Criteria233.create({
    id: criteria.id,
    session: session,
    No_of_mentors: numberOfMentors,
    No_of_mentee: numberOfMentees,
    criteria_code: criteria.criteria_code
  });

  return res.status(201).json(
    new apiResponse(201, newResponse, "Response created successfully")
  );

})
const score233 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.3.3");

  // Get criteria from master table
  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 2.3.3 not found in criteria_master");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session must be between 1990 and current year");
  }

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
    throw new apiError(400, "Session must be between the last 5 years");
  }

  const responses = await Criteria233.findAll({
    where: {
      session: session
    }
  });

  if (!Array.isArray(responses)) {
    console.error('Responses is not an array:', responses);
    throw new apiError(500, "Internal server error: Responses is not an array");
  }

  if (responses.length === 0) {
    throw new apiError(404, "No responses found for this session");
  }

  // Get the latest response based on session year
  const latestResponse = responses.sort((a, b) => b.session - a.session)[0];

  if (!latestResponse) {
    throw new apiError(404, "No valid response found for this session");
  }
  console.log(latestResponse)
  console.log(latestResponse.No_of_mentee, latestResponse.No_of_mentors)
  const noOfMentees = latestResponse.No_of_mentee;
  const noOfMentors = latestResponse.No_of_mentors;
  // Calculate ratio using the latest response
  const ratio = noOfMentees > 0 ? Math.round(noOfMentees / noOfMentors) : 0;
  const score = parseFloat(`${ratio}.1`);
  console.log(ratio)
  
  let grade;
  if (score <= 20) grade = 4;
  else if (score <= 30) grade = 3;
  else if (score <= 40) grade = 2;
  else if (score <= 50) grade = 1;
  else grade = 0;

  console.log("Score", score)
  console.log("Grade", grade)
  try {
    // First try to find existing score
    let entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });

    if (entry) {
      // Update existing entry
      await Score.update(
        { score_sub_sub_criteria: score, sub_sub_cr_grade: grade },
        {
          where: {
            criteria_code: criteria.criteria_code,
            session: session
          }
        }
      );
    } else {
      // Create new entry
      entry = await Score.create({
        criteria_code: criteria.criteria_code,
        criteria_id: criteria.criterion_id,
        sub_criteria_id: criteria.sub_criterion_id,
        sub_sub_criteria_id: criteria.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
        session: session,
        cycle_year: 1
      });
    }

    // Fetch the updated/created entry
    const result = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });

    return res.status(200).json(
      new apiResponse(200, result, "Score processed successfully")
    );
  } catch (error) {
    console.error('Error in score233:', error);
    throw new apiError(500, "Internal server error while processing score");
  }
})

// // response 241242222233


// const getAllCriteria241243222233 = asyncHandler(async (req, res) => {
//   const criteria = await Criteria241243222233.findAll();
//   if (!criteria) {
//       throw new apiError(404, "Criteria not found");
//   }
  
//   res.status(200).json(
//       new apiResponse(200, criteria, "Criteria found")
//   );
// });

// /**
// * @route POST /api/response/2.4.1and2.4.3and2.2.2and2.3.3
// * @description Create a new response for criteria 2.4.1 and 2.4.3 and 2.2.2 and 2.3.3
// * @access Private/Admin
// */
//   const createResponse241 = asyncHandler(async (req, res) => {
//         console.log(CriteriaMaster)
//         const criteria = await CriteriaMaster.findOne({
//             where: {
//               sub_sub_criterion_id: '020401',
//               sub_criterion_id: '0204',
//               criterion_id: '02'
//             }
//           });
      
//           if (!criteria) {
//             throw new apiError(404, "Criteria not found");
//           }
      
//           // Validate required fields
//           const {session,name_of_the_fulltime_teachers,designation, year_of_appointment,nature_of_appointment,name_of_department,total_number_of_years_of_experience_in_the_same_institution,is_the_teacprogramme_name} = req.body;
//           if (!year_of_appointment || !name_of_the_fulltime_teachers || !designation || !nature_of_appointment || !name_of_department || !total_number_of_years_of_experience_in_the_same_institution || !is_the_teacprogramme_name) {
//             throw new apiError(400, "Missing required fields");
//           }

//           if (year_of_appointment < 1990 || year_of_appointment > new Date().getFullYear()) {
//             throw new apiError(400, "Year must be between 1990 and current year");
//           }

//           // Create proper Date objects for session
//           const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
//           console.log(criteria.criteria_code)
//           // Insert into response_2_4_1and2_4_3and2_2_2and2_3_3_data
//           const entry = await Criteria241.create({
//             id: criteria.id,
//             criteria_code: criteria.criteria_code,
//             session: sessionDate,  // Store as Date object
//             year_of_appointment: year_of_appointment,        // Store as Date object
//             name_of_the_fulltime_teachers,
//             designation,
//             nature_of_appointment,
//             name_of_department,
//             total_number_of_years_of_experience_in_the_same_institution,
//             is_the_teacprogramme_name
//           });
      
//           res.status(201).json(
//             new apiResponse(201, entry, "Response created successfully")
//           );
//   });
// /**
// * @route GET /api/response/2.4.1and2.4.3and2.2.2and2.3.3/:criteriaCode
// * @description Get all responses for a specific criteria code
// * @access Public
// */
// const getResponsesByCriteriaCode241243222233 = async (req, res, next) => {
//   try {
//       const { criteriaCode } = req.params;
      
//       const responses = await db.response_2_4_1and_2_4_3and2_2_2and2_3_3.findAll({
//           where: { criteria_code: criteriaCode },
//           include: [{
//               model: db.criteria_master,
//               as: 'criteria',
//               attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
//           }],
//           order: [['submitted_at', 'DESC']]
//       });

//       return res.status(200).json(
//           new apiResponse(200, responses, 'Responses retrieved successfully')
//       );

//   } catch (error) {
//       next(error);
//   }
//   };

// // score 241
//   const score241 = asyncHandler(async (req, res) => {
//     /*
//     1. get the user input from the req body
//     2. query the criteria_master table to get the id and criteria_code 
//     3. validate the user input
//     4. create a new response
//     5. return the response
//     */
//     const criteria_code = convertToPaddedFormat("2.4.1");
//     console.log(criteria_code)
//     console.log(CriteriaMaster)
//     const criteria = await CriteriaMaster.findOne({
//       where: { 
//         sub_sub_criterion_id: criteria_code
//       }
//     });
//     const responses = await Criteria212.findAll({
//       attributes: ['name_of_full_time_teachers', ],  // Only get the option_selected field
//       where: {
//           criteria_code:criteria.criteria_code  
//       }
//   });

//   // Count number of full-time teachers

//   let fullTimeTeacherCount = 0;
//   responses.forEach(response => {
//     if (response.name_of_full_time_teachers) {
//       const names = response.name_of_full_time_teachers
//         .split(',')
//         .map(name => name.trim())
//         .filter(name => name.length > 0);
//       fullTimeTeacherCount += names.length;
//     }
//   });
//   let score = 0;
//   score= (fullTimeTeacherCount/2000)*100;

//   const currentYear = new Date().getFullYear();
//   const sessionDate = new Date(currentYear, 0, 1); 
//   const entry = await Score.create(
//     {
//       criteria_code: criteria.criteria_code,
//       criteria_id: criteria.criterion_id,
//       sub_criteria_id: criteria.sub_criterion_id,
//       sub_sub_criteria_id: criteria.sub_sub_criterion_id,
//       score_criteria: 0,
//       score_sub_criteria: 0,
//       score_sub_sub_criteria: score,
//       session: sessionDate,
//       year: currentYear,
//       cycle_year: 1
//     }
//   );

//   res.status(200).json(
//     new apiResponse(200, entry, "Response created successfully")
//   );

// });





// const getAllCriteria242 = asyncHandler(async (req, res) => {
//   const criteria = await Criteria212.findAll();
//   if (!criteria) {
//       throw new apiError(404, "Criteria not found");
//   }
  
//   res.status(200).json(
//       new apiResponse(200, criteria, "Criteria found")
//   );
// });

/**
* @route POST /api/response/2.4.2
* @description Create a new response for criteria 2.4.2
* @access Private/Admin
*/

// /**
// * @route GET /api/response/2.4.2/:criteriaCode
// * @description Get all responses for a specific criteria code
// * @access Public
// */
// const getResponsesByCriteriaCode242 = (async (req, res, next) => {
//   try {
//       const { criteriaCode } = req.params;
      
//       const responses = await db.response_2_4_2.findAll({
//           where: { criteria_code: criteriaCode },
//           include: [{
//               model: db.criteria_master,
//               as: 'criteria',
//               attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
//           }],
//           order: [['submitted_at', 'DESC']]
//       });

//       return res.status(200).json(
//           new apiResponse(200, responses, 'Responses retrieved successfully')
//       );

//   } catch (error) {
//       next(error);
//   }
// });



// const getAllCriteria263 = asyncHandler(async (req, res) => {
//   const criteria = await Criteria263.findAll();
//   if (!criteria) {
//       throw new apiError(404, "Criteria not found");
//   }
  
//   res.status(200).json(
//       new apiResponse(200, criteria, "Criteria found")
//   );
// });

// /**
// * @route POST /api/response/2.6.3
// * @description Create a new response for criteria 2.6.3
// * @access Private/Admin
// */
// const createResponse263 = asyncHandler(async (req, res) => {
//       console.log(CriteriaMaster)
//       const criteria = await CriteriaMaster.findOne({
//           where: {
//             sub_sub_criterion_id: '020603',
//             sub_criterion_id: '0206',
//             criterion_id: '02'
//           }
//         });
    
//         if (!criteria) {
//           throw new apiError(404, "Criteria not found");
//         }
    
//         // Validate required fields
//         const {session,year,programme_name,programme_code,number_of_students_appeared_in_the_final_year_examination,number_of_students_passed_in_the_final_year_examination } = req.body;
//         if (!session || !year || !programme_name || !programme_code || !number_of_students_appeared_in_the_final_year_examination || !number_of_students_passed_in_the_final_year_examination) {
//           throw new apiError(400, "Missing required fields");
//         }

//         if (year < 1990 || year > new Date().getFullYear()) {
//           throw new apiError(400, "Year must be between 1990 and current year");
//         }

//         // Create proper Date objects for session
//         const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
//         console.log(criteria.criteria_code)
//         // Insert into response_2_6_3_data
//         const entry = await Criteria263.create({
//           id: criteria.id,
//           criteria_code: criteria.criteria_code,
//           session: sessionDate,  // Store as Date object
//           year,
//           programme_name,
//           programme_code,
//           number_of_students_appeared_in_the_final_year_examination,
//           number_of_students_passed_in_the_final_year_examination
//         });
    
//         res.status(201).json(
//           new apiResponse(201, entry, "Response created successfully")
//         );

// });
// /**
// * @route GET /api/response/2.6.3/:criteriaCode
// * @description Get all responses for a specific criteria code
// * @access Public
// */
// const getResponsesByCriteriaCode263 = async (req, res, next) => {
//   try {
//       const { criteriaCode } = req.params;
      
//       const responses = await db.response_2_6_3.findAll({
//           where: { criteria_code: criteriaCode },
//           include: [{
//               model: db.criteria_master,
//               as: 'criteria',
//               attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
//           }],
//           order: [['submitted_at', 'DESC']]
//       });

//       return res.status(200).json(
//           new apiResponse(200, responses, 'Responses retrieved successfully')
//       );

//   } catch (error) {
//       next(error);
//   }
// };
// //score 263
// const score263 = asyncHandler(async (req, res) => {
//   /*
//   1. get the user input from the req body
//   2. query the criteria_master table to get the id and criteria_code 
//   3. validate the user input
//   4. create a new response
//   5. return the response
//   */
//   const criteria_code = convertToPaddedFormat("2.1.1");
//   console.log(criteria_code)
//   console.log(CriteriaMaster)
//   const criteria = await CriteriaMaster.findOne({
//     where: { 
//       sub_sub_criterion_id: criteria_code
//     }
//   });
//   const responses = await Criteria263.findAll({
//     attributes: ['number_of_students_appeared_in_the_final_year_examination', 'number_of_students_passed_in_the_final_year_examination'],  // Only get the option_selected field
//     where: {
//         criteria_code:criteria.criteria_code  
//     }
// });

// const total_appeared = responses.reduce((total, response) => total + (response.number_of_students_appeared_in_the_final_year_examination || 0), 0);
// const total_passed = responses.reduce((total, response) => total + (response.number_of_students_passed_in_the_final_year_examination || 0), 0);

// let score = 0;
// if (total_appeared > 0) {
//   score = (total_passed / total_appeared) * 100;
// }
// //array of scores of 5 years
// let scores = [];
// if (total_appeared > 0) {
//   score = (total_passed / total_appeared) * 100;
// }
// for (let i = 0; i < 5; i++) {
//   scores.push(score);
// }
// let average = 0;
// let years=scores.length;
// average = scores.reduce((sum, value) => sum + value, 0) / years;

// console.log("Average:", average);

// const currentYear = new Date().getFullYear();
// const sessionDate = new Date(currentYear, 0, 1); 
// const entry = await Score.create(
//   {
//     criteria_code: criteria.criteria_code,
//     criteria_id: criteria.criterion_id,
//     sub_criteria_id: criteria.sub_criterion_id,
//     sub_sub_criteria_id: criteria.sub_sub_criterion_id,
//     score_criteria: 0,
//     score_sub_criteria: 0,
//     score_sub_sub_criteria: average,
//     session: sessionDate,
//     year: currentYear,
//     cycle_year: 1
//   }
// );

// res.status(200).json(
//   new apiResponse(200, entry, "Response created successfully")
// )
// });



// const getAllCriteria271 = asyncHandler(async (req, res) => {
//   const criteria = await Criteria271.findAll();
//   if (!criteria) {
//       throw new apiError(404, "Criteria not found");
//   }
  
//   res.status(200).json(
//       new apiResponse(200, criteria, "Criteria found")
//   );
// });

// /**
// * @route POST /api/response/2.7.1
// * @description Create a new response for criteria 2.7.1
// * @access Private/Admin
// */
// const createResponse271 = asyncHandler(async (req, res) => {
//       console.log(CriteriaMaster)
//       const criteria = await CriteriaMaster.findOne({
//           where: {
//             sub_sub_criterion_id: '020701',
//             sub_criterion_id: '0207',
//             criterion_id: '02'
//           }
//         });
    
//         if (!criteria) {
//           throw new apiError(404, "Criteria not found");
//         }
    
//         // Validate required fields
//     const {session,name_of_the_student,gender,category,state_of_domicile,nationality_if_other_than_indian,email_id,programme_name,unique_enrolment_id_college_id,mobile_number,year_of_joining } = req.body;
//         if (!session || !name_of_the_student || !gender || !category || !state_of_domicile || !programme_name || !unique_enrolment_id_college_id || !mobile_number || !year_of_joining) {
//           throw new apiError(400, "Missing required fields");
//         }

//         if (year < 1990 || year > new Date().getFullYear()) {
//           throw new apiError(400, "Year must be between 1990 and current year");
//         }

//         // Create proper Date objects for session
//         const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
//         console.log(criteria.criteria_code)
//         // Insert into response_2_7_1_data
//         const entry = await Criteria271.create({
//           id: criteria.id,
//           criteria_code: criteria.criteria_code,
//           session: sessionDate,  // Store as Date object
//           name_of_the_student,
//           gender,
//           category,
//           state_of_domicile,
//           nationality_if_other_than_indian,
//           email_id,
//           programme_name,
//           unique_enrolment_id_college_id,
//           mobile_number,
//           year_of_joining
//         });
    
//         res.status(201).json(
//           new apiResponse(201, entry, "Response created successfully")
//         );

// });
// /**
// * @route GET /api/response/2.7.1/:criteriaCode
// * @description Get all responses for a specific criteria code
// * @access Public
// */
// const getResponsesByCriteriaCode271 = async (req, res, next) => {
//   try {
//       const { criteriaCode } = req.params;
      
//       const responses = await db.response_2_7_1.findAll({
//           where: { criteria_code: criteriaCode },
//           include: [{
//               model: db.criteria_master,
//               as: 'criteria',
//               attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
//           }],
//           order: [['submitted_at', 'DESC']]
//       });

//       return res.status(200).json(
//           new apiResponse(200, responses, 'Responses retrieved successfully')
//       );

//   } catch (error) {
//       next(error);
//   }
// };
// //score 271

export { 
  // getAllCriteria211,
  createResponse211,
  updateResponse211,
  score211,
  // getAllCriteria212,
  createResponse212,
  createResponse233,
  createResponse222_241_243,
  createResponse242,
  createResponse263,
  // getResponsesByCriteriaCode212,
  score212,
  score222,
  score242,
  score243,
  score263,
  score241,
  score233,
  getResponsesByCriteriaCode,
  // getAllCriteria241243222233 ,
  // createResponse241243222233,
  // getResponsesByCriteriaCode241243222233,
  // score241,
  // score243,
  // score222,
  // score271
}