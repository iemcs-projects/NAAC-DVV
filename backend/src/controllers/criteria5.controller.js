import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";
import { Op } from "sequelize";


const Criteria511 = db.response_5_1_1;
const Criteria512 = db.response_5_1_2;
const Criteria513 = db.response_5_1_3;
const Criteria514 = db.response_5_1_4;
const Criteria515 = db.response_5_1_5;
const Criteria521 = db.response_5_2_1;
const Criteria522 = db.response_5_2_2;
const Criteria523 = db.response_5_2_3;
const Criteria531 = db.response_5_3_1;
const Criteria533 = db.response_5_3_3;
const Criteria542 = db.response_5_4_2;
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
  
//score 5.1.1
const score511 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("5.1.1");

  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  const currentIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!currentIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const startDate = currentIIQA.session_end_year - 5;
  const endDate = currentIIQA.session_end_year;
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  if (session < startDate || session > endDate) {
    throw new apiError(400, "Session must be between the latest IIQA session and the current year");
  }

  // Sum of all govt_students_count in the date range
const totalGovStudentsResult = await Criteria511.findOne({
  attributes: [
    [Sequelize.fn('SUM', Sequelize.col('gov_students_count')), 'total_gov_students']
  ],
  where: {
    year: { [Op.between]: [startDate, endDate] },
  },
  raw: true,
});
console.log("Total Gov Students Result:", totalGovStudentsResult);

const totalGovStudents = Number(totalGovStudentsResult.total_gov_students) || 0;


console.log("Total Gov Students:", totalGovStudents);
const extendedProfileResponse = await extended_profile.findOne({
  attributes: ['total_students', 'full_time_teachers','year'],
  raw: true,
  order: [['created_at', 'DESC']],
  limit: 1
});

if (!extendedProfileResponse) {
  throw new apiError(404, "No Extended Profile data found for the current session");
}

  const yearlyPercentages = {};
    const year = extendedProfileResponse.year;
    const govStudents = totalGovStudents || 0;
    const totalStudents = extendedProfileResponse.total_students || 0;

    if (totalStudents > 0) {
      const percentage = (govStudents / totalStudents) * 100;
      yearlyPercentages[year] = percentage;
    }
    console.log("Yearly Percentages:", yearlyPercentages);
  const years = Object.keys(yearlyPercentages).map(Number).sort((a, b) => b - a);
  if (years.length === 0) {
    throw new apiError(400, "No valid data to compute score");
  }

  const totalPercentage = years.reduce((sum, year) => sum + yearlyPercentages[year], 0);
  const averagePercentage = Number((totalPercentage / years.length).toFixed(3));
  console.log("Average Percentage:", averagePercentage);
  let grade;
  if (averagePercentage >= 70) {
    grade = 4;
  } else if (averagePercentage >= 60) {
    grade = 3;
  } else if (averagePercentage >= 50) {
    grade = 2;
  } else if (averagePercentage >= 40) {
    grade = 1;
  } else {
    grade = 0;
  }
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  }

  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    }
  });



  return res.status(200).json(
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});
// score 5.1.2
const score512 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("5.1.2");

  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  const currentIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!currentIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const startDate = currentIIQA.session_end_year - 5;
  const endDate = currentIIQA.session_end_year;

  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  if (session < startDate || session > endDate) {
    throw new apiError(400, "Session must be between the latest IIQA session and the current year");
  }

 // Sum of all govt_students_count in the date range
 const totalInstStudentsResult = await Criteria512.findOne({
  attributes: [
    [Sequelize.fn('SUM', Sequelize.col('inst_students_count')), 'total_inst_students']
  ],
  where: {
    year: { [Op.between]: [startDate, endDate] },
  },
  raw: true,
});
console.log("Total Inst Students Result:", totalInstStudentsResult);

const totalInstStudents = Number(totalInstStudentsResult.total_inst_students) || 0;

console.log("Total Inst Students:", totalInstStudents);



  const profiles = await extended_profile.findAll({
    attributes: ['year', 'total_students'],
    order: [['created_at', 'DESC']],
    raw: true,
    limit: 1
  });

  if (!profiles.length) {
    throw new apiError(404, "No student data found in the session range");
  }

  const yearlyPercentages = {};
  profiles.forEach(profile => {
    const year = profile.year;
    const totalStudents = profile.total_students || 0;
console.log("Total Students:", totalStudents);
    if (totalStudents > 0) {
      const percentage = (totalInstStudents / totalStudents) * 100;
      yearlyPercentages[year] = percentage;
    }
  });

  const years = Object.keys(yearlyPercentages).map(Number).sort((a, b) => b - a);
  if (years.length === 0) {
    throw new apiError(400, "No valid data to compute score");
  }

  const totalPercentage = years.reduce((sum, year) => sum + yearlyPercentages[year], 0);
  console.log("Total percentage:", totalPercentage);
  const averagePercentage = Number((totalPercentage / years.length).toFixed(3));
  console.log("Average percentage:", averagePercentage);

  let grade;
  if (averagePercentage >= 70) {
    grade = 4;
  } else if (averagePercentage >= 60 && averagePercentage < 70) {
    grade = 3;
  } else if (averagePercentage >= 50 && averagePercentage < 60) {
    grade = 2;
  } else if (averagePercentage >= 40 && averagePercentage < 50) {
    grade = 1;
  } else {
    grade = 0;
  }

  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  }

  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    }
  });



  return res.status(200).json(
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
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
    console.log(req.body)
  
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
  // score 5.1.3
  const score513 = asyncHandler(async (req, res) => {
    const session = new Date().getFullYear();
    const criteria_code = convertToPaddedFormat("5.1.3");
  
    const criteria = await CriteriaMaster.findOne({
      where: { sub_sub_criterion_id: criteria_code }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria not found");
    }
  
    // Get current IIQA session
    const currentIIQA = await IIQA.findOne({
      attributes: ["session_end_year"],
      order: [["created_at", "DESC"]]
    });
  
    if (!currentIIQA) {
      throw new apiError(404, "No IIQA form found");
    }
  
    const startDate = currentIIQA.session_end_year - 5;
    const endDate = currentIIQA.session_end_year;
  
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
  
    if (session < startDate || session > endDate) {
      throw new apiError(
        400,
        "Session must be between the latest IIQA session and the current year"
      );
    }
  
    // Count distinct program names for this session
    const programCountResult = await Criteria513.findAll({
      attributes: [
        "program_name",
        [Sequelize.fn("COUNT", Sequelize.col("program_name")), "count"]
      ],
      where: { session },
      group: ["program_name"],
      raw: true
    });
  
    console.log("Program Count Result:", programCountResult);
  
    // Score = number of distinct program names
    const scoreValue = programCountResult.length;
    console.log("Final Score (5.1.3):", scoreValue);
  
    let [entry, created] = await Score.findOrCreate({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      },
      defaults: {
        criteria_code: criteria.criteria_code,
        criteria_id: criteria.criterion_id,
        sub_criteria_id: criteria.sub_criterion_id,
        sub_sub_criteria_id: criteria.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: scoreValue,
        sub_sub_cr_grade: scoreValue,
        session: session,
        cycle_year: 1
      }
    });
  
    if (!created) {
      await Score.update(
        {
          score_sub_sub_criteria: scoreValue,
          sub_sub_cr_grade: scoreValue,
          session: session,
          cycle_year: 1
        },
        {
          where: {
            criteria_code: criteria.criteria_code,
            session: session
          }
        }
      );
    }
  
    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  
    return res.status(200).json(
      new apiResponse(
        200,
        entry,
        created ? "Score created successfully" : "Score updated successfully"
      )
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
    console.log(req.body)
  
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
// score 5.1.4
const score514 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("5.1.4");

  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  const currentIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!currentIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const startDate = currentIIQA.session_end_year - 5;
  const endDate = currentIIQA.session_end_year;

  if (session < startDate || session > endDate) {
    throw new apiError(400, "Session must be between the latest IIQA session and the current year");
  }

  // Sum of all govt_students_count in the date range
 const totalStudentsparticipated = await Criteria514.findOne({
  attributes: [
    [Sequelize.fn('SUM', Sequelize.col('students_participated')), 'totalStudentsparticipated']
  ],
  where: {
    year: { [Op.between]: [startDate, endDate] },
  },
  raw: true,
});
console.log("Total Students Participated Result:", totalStudentsparticipated);

const totalStudentsParticipated = Number(totalStudentsparticipated.totalStudentsparticipated) || 0;

console.log("Total Students Participated:", totalStudentsParticipated);

const profiles = await extended_profile.findAll({
  attributes: ['year', 'total_students'],
  order: [['created_at', 'DESC']],
  raw: true,
  limit: 1
});

if (!profiles.length) {
  throw new apiError(404, "No student data found in the session range");
}

  const yearlyPercentages = {};
  profiles.forEach(profile => {
    const year = profile.year;
    const studentsParticipated = totalStudentsParticipated || 0;
    const totalStudents = profile.total_students || 0;
console.log("Year:", year);
console.log("Students Participated:", studentsParticipated);
console.log("Total Students:", totalStudents);
    if (totalStudents > 0) {
      const percentage = (studentsParticipated / totalStudents) * 100;
      yearlyPercentages[year] = percentage;
    }
  });
console.log("Yearly Percentages:", yearlyPercentages);
  const years = Object.keys(yearlyPercentages).map(Number).sort((a, b) => b - a);
  if (years.length === 0) {
    throw new apiError(400, "No valid data to compute score");
  }

  const totalPercentage = years.reduce((sum, year) => sum + yearlyPercentages[year], 0);
  console.log("Total Percentage:", totalPercentage);
  const averagePercentage = Number((totalPercentage / years.length).toFixed(3));
console.log("Average Percentage:", averagePercentage);
  let grade;
  if (averagePercentage >= 40) {
    grade = 4;
  } else if (averagePercentage >= 30 && averagePercentage < 40) {
    grade = 3;
  } else if (averagePercentage >= 20 && averagePercentage < 30) {
    grade = 2;
  } else if (averagePercentage >= 5 && averagePercentage < 20) {
    grade = 1;
  } else {
    grade = 0;
  }

  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  }

  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    }
  });



  return res.status(200).json(
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});


// 5.1.5 
const createResponse515 = asyncHandler(async (req, res) => {
  const {
    session,
    options,
  } = req.body;
  console.log(req.body);

  // Step 1: Field validation (handle 0 values properly)
  if (session == null || options == null) {
    throw new apiError(400, "Missing required fields");
  }
  const currentYear = new Date().getFullYear();

  if (session < 1990 || session > currentYear) {
    throw new apiError(400, "Session must be between 1990 and the current year");
  }

  // Step 2: Check for existing entry (prevent duplicates)
  const existingEntry = await Criteria515.findOne({
    where: {
      session,
      options,
    }
  });

  if (existingEntry) {
    throw new apiError(409, "An entry already exists for this session and options");
  }

  // Step 3: Fetch the relevant criteria from CriteriaMaster
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '05',
      sub_criterion_id: '0501',
      sub_sub_criterion_id: '050105' // <-- Make sure this matches 5.1.5 in DB
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

  // Step 5: Create the new entry (add id from CriteriaMaster)
  const newEntry = await Criteria515.create({
    id: criteria.id, // <-- This is the missing field causing your error
    criteria_code: criteria.criteria_code,
    session,
    options,
  });

  return res.status(201).json(
    new apiResponse(201, newEntry, "Response created successfully")
  );
});


//score 5.1.5
const score515 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("5.1.5");
  const currentYear = new Date().getFullYear();
  const session = currentYear;

  // Step 1: Fetch criteria metadata
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 5.1.5 not found in criteria_master");
  }

  // Step 2: Fetch the latest response entry for this criteria
  const response = await Criteria515.findOne({
    attributes: ['options'],
    where: { criteria_code: criteria.criteria_code },
    order: [['id', 'DESC']],
    raw: true
  });
console.log("Response:", response);
  if (!response) {
    throw new apiError(404, "No response found for criteria 5.1.5");
  }

  const options = Number(response.options);
console.log("Options:", options);
  let score, grade;
  switch (options) {
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
    default:
      score = 0;
      grade = 0;
  }

  // Step 3: Upsert score into the Score table
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

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: currentYear,
      cycle_year: 1
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
    console.log(req.body)
  
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
// score 5.2.1
const score521 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("5.2.1");

  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  const currentIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!currentIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const startDate = currentIIQA.session_end_year - 5;
  const endDate = currentIIQA.session_end_year;
console.log(startDate, endDate);
  if (session < startDate || session > endDate) {
    throw new apiError(400, "Session must be between the latest IIQA session and the current year");
  }

  // Get all student contacts for each year
  const studentContacts = await Criteria521.findAll({
    attributes: [
      [Sequelize.fn('YEAR', Sequelize.col('year')), 'year'],
      [Sequelize.fn('COUNT', Sequelize.col('student_name_contact')), 'contact_count']
    ],
    where: {
      year: {
        [Sequelize.Op.between]: [startDate, endDate]
      }
    },
    group: [Sequelize.fn('YEAR', Sequelize.col('year'))],
    raw: true
  });
console.log(studentContacts);
  // Get outgoing final year students for each year
  const profiles = await extended_profile.findAll({
    attributes: ['year', 'outgoing_final_year_students'],
    order: [['created_at', 'DESC']],
    raw: true,
    limit: 1
  });
console.log(profiles);
  if (!profiles.length) {
    throw new apiError(404, "No student data found in the session range");
  }

  if (!profiles.length) {
    throw new apiError(404, "No student data found in the session range");
  }

  if (!studentContacts.length || !profiles.length) {
    throw new apiError(404, "No student data found in the session range");
  }

  // Create a map of year to contact count
  const yearToContactCount = {};
  studentContacts.forEach(item => {
    yearToContactCount[item.year] = parseInt(item.contact_count, 10);
  });
console.log(yearToContactCount);
  // Create a map of year to outgoing students
  const yearToOutgoingStudents = {};
  profiles.forEach(item => {
    yearToOutgoingStudents[item.year] = item.outgoing_final_year_students;
  });
console.log(yearToOutgoingStudents);

  // Calculate percentage for each year
  const yearlyPercentages = {};
  Object.keys(yearToOutgoingStudents).forEach(year => {
    const contacts = yearToContactCount[year] || 0;
    const outgoing = yearToOutgoingStudents[year] || 0;
    
    if (outgoing > 0) {
      const percentage = (contacts / outgoing) * 100;
      yearlyPercentages[year] = percentage;
    }
  });
console.log(yearlyPercentages);
  const years = Object.keys(yearlyPercentages).map(Number).sort((a, b) => b - a);
  if (years.length === 0) {
    throw new apiError(400, "No valid data to compute score");
  }

  const totalPercentage = years.reduce((sum, year) => sum + yearlyPercentages[year], 0);
  const averagePercentage = Number((totalPercentage / years.length).toFixed(3));
console.log(averagePercentage);
  let grade;
  if (averagePercentage >= 70) {
    grade = 4;
  } else if (averagePercentage >= 60) {
    grade = 3;
  } else if (averagePercentage >= 50) {
    grade = 2;
  } else if (averagePercentage >= 40) {
    grade = 1;
  } else {
    grade = 0;
  }

  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averagePercentage,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  }

  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    }
  });



  return res.status(200).json(
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
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
    console.log(req.body)
  
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
  // score 5.2.2
  const score522 = asyncHandler(async (req, res) => {
    const session = new Date().getFullYear();
    const criteria_code = convertToPaddedFormat("5.2.2");
  
    const criteria = await CriteriaMaster.findOne({
      where: { sub_sub_criterion_id: criteria_code }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria not found");
    }
  
    const currentIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!currentIIQA) {
      throw new apiError(404, "No IIQA form found");
    }
  
    const startDate = currentIIQA.session_end_year - 5;
    const endDate = currentIIQA.session_end_year;
    console.log("Start date:", startDate);
    console.log("End date:", endDate);
    if (session < startDate || session > endDate) {
      throw new apiError(400, "Session must be between the latest IIQA session and the current year");
    }
  
    // Get count of students progressing to higher education for each year
    const studentsProgressing = await Criteria522.findAll({
      attributes: [
        'year',
        [Sequelize.fn('COUNT', Sequelize.col('student_name')),'progress_count']
      ],
      where: {
        year: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['year'],
      order: [['year', 'DESC']],
      raw: true
    });
    console.log("Students progressing:", studentsProgressing);
  
    // Get outgoing final year students for each year
    const outgoingStudents = await extended_profile.findAll({
      attributes: ['year', 'outgoing_final_year_students'],
      //WHERE CLAUSE MISSING
      order: [['year', 'DESC']],
      raw: true,
    });
  console.log("Outgoing students:", outgoingStudents);
    if (!studentsProgressing.length || !outgoingStudents.length) {
      throw new apiError(404, "No student data found in the session range");
    }
  
    // Create a map of year to progressing students count
    const yearToProgressingCount = {};
    studentsProgressing.forEach(item => {
      yearToProgressingCount[item.year] = parseInt(item.progress_count, 10);
    });
  
    // Create a map of year to outgoing students
    const yearToOutgoingStudents = {};
    outgoingStudents.forEach(item => {
      yearToOutgoingStudents[item.year] = item.outgoing_final_year_students;
    });
  
    // Calculate percentage for each year
    const yearlyPercentages = {};
    Object.keys(yearToOutgoingStudents).forEach(year => {
      const progressing = yearToProgressingCount[year] || 0;
      const outgoing = yearToOutgoingStudents[year] || 0;
      
      if (outgoing > 0) {
        const percentage = (progressing / outgoing) * 100;
        yearlyPercentages[year] = percentage;
      }
    });
  
    const years = Object.keys(yearlyPercentages).map(Number).sort((a, b) => b - a);
    if (years.length === 0) {
      throw new apiError(400, "No valid data to compute score");
    }
  console.log(yearlyPercentages);
    const totalPercentage = years.reduce((sum, year) => sum + yearlyPercentages[year], 0);
    const averagePercentage = Number((totalPercentage / years.length).toFixed(3));
    console.log("Average percentage:", averagePercentage);
    let grade;
    if (averagePercentage >= 70) {
      grade = 4;
    } else if (averagePercentage >= 60) {
      grade = 3;
    } else if (averagePercentage >= 50) {
      grade = 2;
    } else if (averagePercentage >= 40) {
      grade = 1;
    } else {
      grade = 0;
    }
    console.log("Grade:", grade);
    let [entry, created] = await Score.findOrCreate({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      },
      defaults: {
        criteria_code: criteria.criteria_code,
        criteria_id: criteria.criterion_id,
        sub_criteria_id: criteria.sub_criterion_id,
        sub_sub_criteria_id: criteria.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: averagePercentage,
        sub_sub_cr_grade: grade,
        session: session,
        cycle_year: 1
      }
    });
  
    if (!created) {
      await Score.update({
        score_sub_sub_criteria: averagePercentage,
        sub_sub_cr_grade: grade,
        session: session,
        cycle_year: 1
      }, {
        where: {
          criteria_code: criteria.criteria_code,
          session: session
        }
      });
    }
  
    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  
  
  
    return res.status(200).json(
      new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
    );
  });



//5.2.3
const createResponse523 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    registeration_number,
    students_appearing,
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

  console.log(req.body);

  // Helper: check valid YES/NO string
  const isValidAnswer = (val) =>
    typeof val === "string" && ["YES", "NO"].includes(val.toUpperCase());

  // Validation
  if (
    session == null ||
    year == null ||
    !registeration_number ||
    !students_appearing ||
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

  // Check for duplicates
  const existingEntry = await Criteria523.findOne({
    where: {
      session,
      year,
      registeration_number,
    },
  });
  if (existingEntry) {
    throw new apiError(
      409,
      "An entry already exists for this registration number in the same session and year"
    );
  }

  // Criteria lookup
  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: "05",
      sub_criterion_id: "0502",
      sub_sub_criterion_id: "050203",
    },
  });
  if (!criteria) throw new apiError(404, "Criteria details not found");

  // IIQA range check
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });
  if (!latestIIQA) throw new apiError(404, "No IIQA data found");

  const iiqaEndYear = latestIIQA.session_end_year;
  const iiqaStartYear = iiqaEndYear - 5;
  if (session < iiqaStartYear || session > iiqaEndYear) {
    throw new apiError(
      400,
      `Session must be between ${iiqaStartYear} and ${iiqaEndYear} as per IIQA data`
    );
  }

  // Prepare exams object
  const exams = {
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
  };

  // Create entry
  const newEntry = await Criteria523.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    year,
    registeration_number,
    students_appearing,
    ...exams,
  });

  return res
    .status(201)
    .json(new apiResponse(201, newEntry, "Response created successfully"));
});



//score 5.2.3
const score523 = asyncHandler(async (req, res) => {
  /*
    1. Get current year as session
    2. Get criteria from criteria master with the sub sub criterion id 5.2.3
    3. Get latest IIQA session range
    4. Check if session is between the latest IIQA session and current year
    5. Fetch all exam entries for the criteria code and session range
    6. Group by year and count students with at least one YES
    7. Calculate average number over the 5-year period
    8. Create or update score in score table
    9. Return score
  */

  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("5.2.3");

  // Step 2: Get criteria details
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });
  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Get the latest IIQA session range
  const currentIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]]
  });
  if (!currentIIQA) throw new apiError(404, "No IIQA form found");

  const startDate = currentIIQA.session_end_year - 5;
  const endDate = currentIIQA.session_end_year;

  if (session < startDate || session > endDate) {
    throw new apiError(
      400,
      "Session must be between the latest IIQA session and the current year"
    );
  }

  // Step 5: Fetch all exam entries in range
  const examEntries = await Criteria523.findAll({
    attributes: [
      "year",
      "exam_net",
      "exam_slet",
      "exam_gate",
      "exam_gmat",
      "exam_cat",
      "exam_gre",
      "exam_jam",
      "exam_ielts",
      "exam_toefl",
      "exam_civil_services",
      "exam_state_services",
      "exam_other"
    ],
    where: {
      criteria_code: criteria.criteria_code,
      session: { [Sequelize.Op.between]: [startDate, endDate] }
    },
    raw: true
  });

  if (!examEntries.length) {
    throw new apiError(
      404,
      "No exam entries found for Criteria 5.2.3 in the session range"
    );
  }

  // Step 6: Group by year and count students who have given at least one YES
  const studentsByYear = {};
  examEntries.forEach(entry => {
    const year = new Date(entry.year).getFullYear();
    const exams = [
      entry.exam_net,
      entry.exam_slet,
      entry.exam_gate,
      entry.exam_gmat,
      entry.exam_cat,
      entry.exam_gre,
      entry.exam_jam,
      entry.exam_ielts,
      entry.exam_toefl,
      entry.exam_civil_services,
      entry.exam_state_services,
      entry.exam_other
    ];
    const hasGivenExam = exams.some(
      val => typeof val === "string" && val.toUpperCase() === "YES"
    );
    if (hasGivenExam) {
      studentsByYear[year] = (studentsByYear[year] || 0) + 1;
    }
  });

  // Step 7: Calculate average
  const years = Object.keys(studentsByYear);
  const totalCount = years.reduce(
    (sum, year) => sum + studentsByYear[year],
    0
  );
  const averageCount = years.length > 0 ? totalCount / years.length : 0;

  // Step 8: Sample grading logic
  let grade;
  if (averageCount >= 15) {
    grade = 4;
  } else if (averageCount >= 10) {
    grade = 3;
  } else if (averageCount >= 5) {
    grade = 2;
  } else if (averageCount >= 2) {
    grade = 1;
  } else {
    grade = 0;
  }

  // Step 9: Create or update score
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    },
    defaults: {
      criteria_code: criteria.criteria_code,
      criteria_id: criteria.criterion_id,
      sub_criteria_id: criteria.sub_criterion_id,
      sub_sub_criteria_id: criteria.sub_sub_criterion_id,
      score_criteria: 0,
      score_sub_criteria: 0,
      score_sub_sub_criteria: averageCount,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: averageCount,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session: session
      }
    });
  }

  entry = await Score.findOne({
    where: {
      criteria_code: criteria.criteria_code,
      session: session
    }
  });



  return res.status(200).json(
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
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
    console.log(req.body)
  
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
  // score 5.3.1
  const score531 = asyncHandler(async (req, res) => {
    /*
    1. Get current year as session
    2. Get criteria from criteria master with the sub sub criterion id 5.3.1
    3. Get latest IIQA session range
    4. Check if session is between the latest IIQA session and current year
    5. Fetch all award entries for the criteria code and session range
    6. Group by year and count awards
    7. Calculate average number of awards over the 5-year period
    8. Create or update score in score table
    9. Return score
    */
    const session = new Date().getFullYear();
    const criteria_code = convertToPaddedFormat("5.3.1");
  
    const criteria = await CriteriaMaster.findOne({
      where: { sub_sub_criterion_id: criteria_code }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria not found");
    }
  
    // Get the latest IIQA session range
    const currentIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!currentIIQA) {
      throw new apiError(404, "No IIQA form found");
    }
  
    const startDate = currentIIQA.session_end_year - 5;
    const endDate = currentIIQA.session_end_year;
  console.log("Start date:", startDate);
    console.log("End date:", endDate);
    if (session < startDate || session > endDate) {
      throw new apiError(400, "Session must be between the latest IIQA session and the current year");
    }
  
    // Fetch all award entries for the criteria code and session range
    const awardEntries = await Criteria531.findAll({
      attributes: ['award_name', 'year'],
      where: {
        criteria_code: criteria.criteria_code,
        session: {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });
  console.log("Award entries:", awardEntries);
    if (!awardEntries.length) {
      throw new apiError(404, "No award entries found for Criteria 5.3.1 in the session range");
    }
  
    // Group entries by year and count awards
    const awardsByYear = {};
    awardEntries.forEach(entry => {
      const year = entry.year;
      awardsByYear[year] = (awardsByYear[year] || 0) + 1;
    });
  
    console.log("Awards by year:", awardsByYear);
  
    // Calculate average number of awards per year
    const years = Object.keys(awardsByYear);
    const totalAwards = years.reduce((sum, year) => sum + awardsByYear[year], 0);
    const averageAwards = years.length > 0 ? (totalAwards / years.length) : 0;
  
    console.log("Average awards per year:", averageAwards);
  
    // Sample grading logic (to be updated with actual criteria)
    let grade;
    if (averageAwards >= 15) {
      grade = 4;
    } else if (averageAwards >= 10) {
      grade = 3;
    } else if (averageAwards >= 5) {
      grade = 2;
    } else if (averageAwards >= 2) {
      grade = 1;
    } else {
      grade = 0;
    }
  
    // Create or update score
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
        score_sub_sub_criteria: averageAwards,
        sub_sub_cr_grade: grade,
        session
      }
    });
  
    if (!created) {
      await Score.update({
        score_sub_sub_criteria: averageAwards,
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

//score 5.3.3
  const score533 = asyncHandler(async (req, res) => {
    /*
    1. Get current year as session
    2. Get criteria from criteria master with the sub sub criterion id 5.3.3
    3. Get latest IIQA session range
    4. Check if session is between the latest IIQA session and current year
    5. Fetch all event entries for the criteria code and session range
    6. Group by year and count events
    7. Calculate average number of events over the 5-year period
    8. Create or update score in score table
    9. Return score
    */
    const session = new Date().getFullYear();
    const criteria_code = convertToPaddedFormat("5.3.3");
  
    const criteria = await CriteriaMaster.findOne({
      where: { sub_sub_criterion_id: criteria_code }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria not found");
    }
  
    // Get the latest IIQA session range
    const currentIIQA = await IIQA.findOne({
      attributes: ['session_end_year'],
      order: [['created_at', 'DESC']]
    });
  
    if (!currentIIQA) {
      throw new apiError(404, "No IIQA form found");
    }
  
    const startDate = currentIIQA.session_end_year - 5;
    const endDate = currentIIQA.session_end_year;
  console.log("Start date:", startDate);
    console.log("End date:", endDate);
    if (session < startDate || session > endDate) {
      throw new apiError(400, "Session must be between the latest IIQA session and the current year");
    }
  
    // Fetch all event entries for the criteria code and session range
    const eventEntries = await Criteria533.findAll({
      attributes: ['event_name', 'session'],
      where: {
        criteria_code: criteria.criteria_code,
        session: {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });
  console.log("Event entries:", eventEntries);
    if (!eventEntries.length) {
      throw new apiError(404, "No event entries found for Criteria 5.3.3 in the session range");
    }
  
    // Group entries by year and count events
    const eventsByYear = {};
    eventEntries.forEach(entry => {
      const year = entry.session;
      eventsByYear[year] = (eventsByYear[year] || 0) + 1;
    });
  console.log("Events by year:", eventsByYear);
  
    // Calculate average number of events per year
    const years = Object.keys(eventsByYear);
    const totalEvents = years.reduce((sum, year) => sum + eventsByYear[year], 0);
    const averageEvents = years.length > 0 ? (totalEvents / years.length) : 0;
  console.log("Total events:", totalEvents);
    console.log("Average events per year:", averageEvents);
  
    // Grading logic
    let grade;
    if (averageEvents >= 15) {
      grade = 4;
    } else if (averageEvents >= 10) {
      grade = 3;
    } else if (averageEvents >= 5) {
      grade = 2;
    } else if (averageEvents >= 2) {
      grade = 1;
    } else {
      grade = 0;
    }
  console.log("Grade:", grade);
    // Create or update score
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
        score_sub_sub_criteria: averageEvents,
        sub_sub_cr_grade: grade,
        session
      }
    });
  
    if (!created) {
      await Score.update({
        score_sub_sub_criteria: averageEvents,
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



  //5.4.2
  const createResponse542 = asyncHandler(async (req, res) => {
    const {
      session,
      options,
    } = req.body;
    console.log("Session:", session);
    console.log("Options:", options);
  
    // Step 1: Field validation (handle 0 values properly)
    if (session == null || options == null) {
      throw new apiError(400, "Missing required fields");
    }
    const currentYear = new Date().getFullYear();
  
    if (session < 1990 || session > currentYear) {
      throw new apiError(400, "Session must be between 1990 and the current year");
    }
  
    // Step 2: Check for existing entry (prevent duplicates)
    const existingEntry = await Criteria542.findOne({
      where: {
        session,
        options,
      }
    });
  
    if (existingEntry) {
      throw new apiError(409, "An entry already exists for this session and options");
    }
  
    // Step 3: Fetch the relevant criteria from CriteriaMaster
    const criteria = await CriteriaMaster.findOne({
      where: {
        criterion_id: '05',
        sub_criterion_id: '0504',        // Corrected for 5.4.x
        sub_sub_criterion_id: '050402'   // Adjusted for 5.4.2
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
  
    // Step 5: Create the new entry - include id from CriteriaMaster
    const newEntry = await Criteria542.create({
      id: criteria.id,                  // Added to fix NOT NULL violation
      criteria_code: criteria.criteria_code,
      session,
      options,
    });
  
    return res.status(201).json(
      new apiResponse(201, newEntry, "Response created successfully")
    );
  });
  
// score 5.4.2
  const score542 = asyncHandler(async (req, res) => {
    const criteria_code = convertToPaddedFormat("5.4.2");
    const currentYear = new Date().getFullYear();
    const session = currentYear;
  
    // Step 1: Fetch criteria metadata
    const criteria = await CriteriaMaster.findOne({
      where: { sub_sub_criterion_id: criteria_code }
    });
  
    if (!criteria) {
      throw new apiError(404, "Criteria 5.4.2 not found in criteria_master");
    }
  
    // Step 2: Fetch the latest response entry for this criteria
    const response = await Criteria542.findOne({
      attributes: ['options'],
      where: { criteria_code: criteria.criteria_code },
      order: [['id', 'DESC']],
      raw: true
    });
  
    if (!response) {
      throw new apiError(404, "No response found for criteria 5.4.2");
    }
  
    const options = Number(response.options);
  
    let score, grade;
    switch (options) {
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
      default:
        score = 0;
        grade = 0;
    }
  
    // Step 3: Upsert score into the Score table
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
  
    if (!created) {
      await Score.update({
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
        session: currentYear,
        cycle_year: 1
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
  export {
    createResponse511_512,
    createResponse513,
    createResponse514,
    createResponse515,
    createResponse521,
    createResponse522,
    createResponse523,
    createResponse531,
    createResponse533,
    createResponse542,
    getResponsesByCriteriaCode,
    score511,
    score512,
    score513,
    score514,
    score515,
    score521,
    score522,
    score523,
    score531,
    score533,
    score542
  };