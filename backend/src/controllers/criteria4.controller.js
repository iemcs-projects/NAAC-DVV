import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

const Criteria413 = db.response_4_1_3;
const Criteria414 = db.response_4_1_4;
const CriteriaMaster = db.criteria_master;
const IIQA = db.iiqa_form;
const ExtendedProfile = db.extended_profile;
const Criteria422 = db.response_4_2_2;
const Criteria423 = db.response_4_2_3;
const Criteria424 = db.response_4_2_4;
const Criteria432 = db.response_4_3_2;
const Criteria441 = db.response_4_4_1;
const Score = db.scores;

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

// Helper function to convert criteria code to padded format
const convertToPaddedFormat = (code) => {
  // First remove any dots, then split into individual characters
  const parts = code.replace(/\./g, '').split('');
  // Pad each part to 2 digits and join
  return parts.map(part => part.padStart(2, '0')).join('');
};

/*

Score-
424,423,422,413
1. 413 done
2. 414 done
3. 422423 done
4. 424 done
5. 432 done
6. 441 not done
*/
/**
 * @route POST /api/response/4.1.3
 * @description Create a new response for criteria 4.1.3
 * @access Private/Admin
 */
const createResponse413 = asyncHandler(async (req, res) => {

  const { session, room_identifier, typeict_facility, ict_facilities_count } = req.body;
  console.log("Session",req.body)

  const sessionYear = Number(session);
  const room = String(room_identifier);
  const facilityType = String(typeict_facility);
  const no_of_classroom = Number(ict_facilities_count);

  if (!sessionYear || !room || !facilityType || !no_of_classroom) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();
  if (sessionYear < 1990 || sessionYear > currentYear) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  // Fetch Criteria
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040103',
      sub_criterion_id: '0401',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Check session range with IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) throw new apiError(404, "IIQA not found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  const extendedProfile = await ExtendedProfile.findOne({
    order: [['created_at', 'DESC']],
    limit: 1
  });

  if (!extendedProfile) {
    throw new apiError(404, "Extended profile not found");
  }

  const response = await extendedProfile.update({
    classroom_ict_enabled: no_of_classroom,   
  });

  console.log("Response",response)


  // Upsert entry
  let [entry, created] = await Criteria413.findOrCreate({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code,
      room_identifier: room
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      room_identifier: room,
      typeict_facility: facilityType
    }
  });

  if (!created) {
    await Criteria413.update({
      typeict_facility: facilityType
    }, {
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        room_identifier: room
      }
    });

    entry = await Criteria413.findOne({
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        room_identifier: room
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const score413 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("4.1.3");
  
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

  const extendedProfile = await ExtendedProfile.findOne({
    attributes: ['total_classrooms', 'total_seminar_halls', 'classroom_ict_enabled'],
    order: [['created_at', 'DESC']],
    limit: 1
  });

  if (!extendedProfile) {
    throw new apiError(404, "Extended profile not found");
  }

  const totalClassroom = extendedProfile.total_classrooms;
  const totalSeminarHall = extendedProfile.total_seminar_halls;

  if(totalClassroom === 0 && totalSeminarHall === 0){
    throw new apiError(400, "Total classroom and seminar hall is 0");
  }

  const noOfRooms = extendedProfile.classroom_ict_enabled;

  if(noOfRooms === 0){
    throw new apiError(400, "No of rooms is 0");
  }

  const totalRooms = totalClassroom + totalSeminarHall;

  console.log("Total rooms:",totalRooms);
  console.log("No of rooms enabled for ICT:", noOfRooms);

  //get extended profile
  //divide responses room by total classroom or seminar hall in extended profile
  const score = (noOfRooms / totalRooms) * 100;

  let grade;
  if (score >= 25) {
    grade = 4;
  } else if (score >= 20) {
    grade = 3;
  } else if (score >= 10) {
    grade = 2;
  } else if (score >= 1) {
    grade = 1;
  } else {
    grade = 0;
  }

  // Create or update Score
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


const createResponse414 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    budget_allocated_infra_aug,
    expenditure_infra_aug,
    expenditure_academic_maint,
    expenditure_physical_maint
  } = req.body;

  const sessionYear = Number(session);
  const yearVal = Number(year);
  const budget = Number(budget_allocated_infra_aug);
  const infraExpenditure = Number(expenditure_infra_aug);
  const academicMaint = Number(expenditure_academic_maint);
  const physicalMaint = Number(expenditure_physical_maint);

  if (
    !sessionYear ||
    !yearVal ||
    isNaN(budget) ||
    isNaN(infraExpenditure) ||
    isNaN(academicMaint) ||
    isNaN(physicalMaint)
  ) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();

  if (
    sessionYear < 1990 || sessionYear > currentYear ||
    yearVal < 1990 || yearVal > currentYear
  ) {
    throw new apiError(400, "Years must be between 1990 and current year");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040104',
      sub_criterion_id: '0401',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) throw new apiError(404, "IIQA not found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  let [entry, created] = await Criteria414.findOrCreate({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code,
      year: yearVal
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      year: yearVal,
      budget_allocated_infra_aug: budget,
      expenditure_infra_aug: infraExpenditure,
      expenditure_academic_maint: academicMaint,
      expenditure_physical_maint: physicalMaint
    }
  });

  if (!created) {
    await Criteria414.update({
      budget_allocated_infra_aug: budget,
      expenditure_infra_aug: infraExpenditure,
      expenditure_academic_maint: academicMaint,
      expenditure_physical_maint: physicalMaint
    }, {
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        year: yearVal
      }
    });

    entry = await Criteria414.findOne({
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        year: yearVal
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const score414 = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("4.1.4");

  // Step 1: Get criteria
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });
  if (!criteria) {
    throw new apiError(404, "Criteria 4.1.4 not found in criteria_master");
  }

  // Step 2: Get latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });
  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  // Step 3: Fetch responses for last 5 years
const responses = await Criteria414.findAll({
  attributes: [
    'session',
    'expenditure_infra_aug'
  ],
  where: {
    criteria_code: criteria.criteria_code,
    session: {
      [Sequelize.Op.gte]: startYear,
      [Sequelize.Op.lte]: endYear
    }
  },
  order: [['session', 'DESC']],
  raw: true
});

// Get latest expenditure from ExtendedProfile
const ExtendedProfileResponse = await ExtendedProfile.findOne({
  attributes: ['expenditure_in_lakhs'],
  raw: true,
  order: [['created_at', 'DESC']],
  limit: 1
});

if (!ExtendedProfileResponse) {
  throw new apiError(404, "No ExtendedProfile data found");
}

const expenditureInLakhs = Number(ExtendedProfileResponse.expenditure_in_lakhs || 0);

if (responses.length === 0) {
  throw new apiError(404, "No responses found for the given period");
}

// Step 4: Group infra expenditure by year
const yearlyData = {};
responses.forEach(r => {
  if (!yearlyData[r.session]) {
    yearlyData[r.session] = { infra: 0, total: expenditureInLakhs };
  }
  yearlyData[r.session].infra += Number(r.expenditure_infra_aug || 0);
});

// Calculate yearly percentages
const yearlyPercentages = Object.keys(yearlyData).map(year => {
  const { infra, total } = yearlyData[year];
  return total > 0 ? (infra / total) * 100 : 0;
});

if (yearlyPercentages.length === 0) {
  throw new apiError(400, "No valid data to compute score");
}

// Step 5: Calculate average score
const score = parseFloat(
  (yearlyPercentages.reduce((a, b) => a + b, 0) / yearlyPercentages.length).toFixed(3)
);



  // Step 6: Grade mapping
  let grade;
  if (score >= 25) grade = 4;
  else if (score >= 20) grade = 3;
  else if (score >= 10) grade = 2;
  else if (score >= 1) grade = 1;
  else grade = 0;

  console.log(score, grade)

  // Step 7: Create or update Score
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
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});




/**
 * @route POST /api/response/4.2.2 & 4.2.3
 * @description Create a new response for criteria 4.2.2 & 4.2.3
 * @access Private/Admin
 */

const createResponse423 = asyncHandler(async (req, res) => {
  /*
    1. Get the user input from req.body
    2. Validate required fields
    3. Fetch criteria from criteria_master
    4. Fetch the latest IIQA session range
    5. Validate session within range
    6. Create or update Criteria423 record
    7. Return the response
  */

  const { session, resource_type, subscription_detail, expenditure_lakhs, total_expenditure } = req.body;

  // Step 2: Validate required fields
  if (
    !session ||
    !resource_type ||
    !subscription_detail ||
    expenditure_lakhs === undefined ||
    total_expenditure === undefined
  ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  const year =session.toString().slice(0, 4);
  console.log("Year::",year)

  // Step 3: Fetch criteria
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040203',
      sub_criterion_id: '0402',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria 4.2.3 not found");

  // Step 4: Fetch latest IIQA session range
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) {
    throw new apiError(404, "No IIQA form found");
  }

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  // Step 5: Validate session
  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  const duplicate = await Criteria423.findOne({
    where: { session, year, resource_type, subscription_detail,expenditure_lakhs }
  });

  if (duplicate) {
    throw new apiError(409, "Entry already exists for this session, year, and resource type");
  }

  // Step 6: Create or update Criteria423 record
  let [entry, created] = await Criteria423.findOrCreate({
    where: {
      session,
      year,
      criteria_code: criteria.criteria_code,
      resource_type,
      subscription_detail,
      expenditure_lakhs,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      year,
      resource_type,
      subscription_detail,
      expenditure_lakhs,
      total_expenditure
    }
  });

  if (!created) {
    await Criteria423.update({
      subscription_detail,
      expenditure_lakhs,
      total_expenditure
    }, {
      where: {
        session,
        year,
        criteria_code: criteria.criteria_code,
        resource_type
      }
    });

    entry = await Criteria423.findOne({
      where: {
        session,
        year,
        criteria_code: criteria.criteria_code,
        resource_type
      }
    });
  }

  // Step 7: Return response
  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const createResponse422 = asyncHandler(async (req, res) => {
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

  const { session, options } = req.body;

  if (!session || !options) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (options < 0 || options > 4) {
    throw new apiError(400, "Options must be between 0 and 4");
  }

  const optionString = String(options);

  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040202',
      sub_criterion_id: '0402',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

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

  let [entry, created] = await Criteria422.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      options: optionString
    }
  });

  if (!created) {
    await Criteria422.update({
      options: optionString
    }, {
      where: {
        session,
        criteria_code: criteria.criteria_code
      }
    });

    entry = await Criteria422.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});


const score422 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("4.2.2");
  const currentYear = new Date().getFullYear();

  console.log(criteria_code, currentYear);

  // Step 1: Fetch criteria metadata
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code },
    raw: true
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 4.2.2 not found in criteria_master");
  }

  // Step 2: Fetch the latest response entry for this criteria
  const response = await Criteria422.findOne({
    attributes: ['options'],
    where: { criteria_code: criteria.criteria_code },
    order: [['id', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 4.2.2");
  }

  const optionSelected = Number(response.options);

  let score, grade;
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
    default:
      score = 0;
      grade = 0;
  }

  console.log(score, grade);

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

const score423 = asyncHandler(async (req, res) => {
  const criteria_code = convertToPaddedFormat("4.2.3");
  const currentYear = new Date().getFullYear();
  const session = currentYear;

  // Step 1: Fetch criteria metadata
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });
  if (!criteria) {
    throw new apiError(404, "Criteria 4.2.3 not found in criteria_master");
  }

  // Step 2: Fetch expenditure data rows
  const expenditureRows = await Criteria423.findAll({
    attributes: ["expenditure_lakhs", "session"],
    where: { criteria_code: criteria.criteria_code },
    order: [["session", "DESC"]],
    raw: true
  });

  if (!expenditureRows.length) {
    throw new apiError(404, "No responses found for criteria 4.2.3");
  }

  // Step 3: Group expenditure by session
  const groupedBySession = {};
  expenditureRows.forEach(record => {
    const year = record.session;
    groupedBySession[year] =
      (groupedBySession[year] || 0) + Number(record.expenditure_lakhs || 0);
  });

  console.log("Grouped Expenditure Data:", groupedBySession);

  // Step 4: Take last 5 sessions
  const last5Sessions = Object.keys(groupedBySession)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, 5);

  if (!last5Sessions.length) {
    throw new apiError(400, "Not enough session data to compute score");
  }

  // Step 5: Calculate average expenditure
  const expenditureValues = last5Sessions.map(year => groupedBySession[year]);
  const totalExpenditure = expenditureValues.reduce((sum, val) => sum + val, 0);
  const avgExpenditure = parseFloat(
    (totalExpenditure / last5Sessions.length).toFixed(3)
  );

  console.log("Average Expenditure:", avgExpenditure);

  let grade = 0; // No grading criteria defined

  if (avgExpenditure >=10) {
    grade = 4;
  }
  else if (avgExpenditure >=8 && avgExpenditure < 10) {
    grade = 3;
  }
  else if (avgExpenditure >=6 && avgExpenditure < 8) {
    grade = 2;
  }
  else if (avgExpenditure >=4 && avgExpenditure < 6) {
    grade = 1;
  }
  else if (avgExpenditure >=2 && avgExpenditure < 4) {
    grade = 0;
  }

  // Step 6: Insert or update score
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
      score_sub_sub_criteria: avgExpenditure,
      sub_sub_cr_grade: grade,
      session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: avgExpenditure,
        sub_sub_cr_grade: grade
      },
      {
        where: {
          criteria_code: criteria.criteria_code,
          session
        }
      }
    );

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session
      }
    });
  }

  // Step 7: Response
  return res.status(200).json(
    new apiResponse(
      200,
      entry,
      created ? "Score created successfully" : "Score updated successfully"
    )
  );
});



/**
 * @route POST /api/response/4.2.4
 * @description Create a new response for criteria 4.2.4
 * @access Private/Admin
 */

const createResponse424 = asyncHandler(async (req, res) => {
  const {
    session,
    no_of_teachers_stds,
  } = req.body;

  const sessionYear = Number(session);
  const noOfTeachers = Number(no_of_teachers_stds);

  if (!sessionYear || !noOfTeachers) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();
  if (sessionYear < 1990 || sessionYear > currentYear) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  // Fetch Criteria for 4.2.4
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040204',
      sub_criterion_id: '0402',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Get session range from latest IIQA
  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) throw new apiError(404, "IIQA not found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  const duplicateResponse = await Criteria424.findOne({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code,
      no_of_teachers_stds: noOfTeachers,
    }
  });

  if (duplicateResponse) {
    throw new apiError(400, "Response already exists for this session");
  }

  // Upsert logic (check if entry exists)
  let [entry, created] = await Criteria424.findOrCreate({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code,
      no_of_teachers_stds: noOfTeachers,

    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      no_of_teachers_stds: noOfTeachers,
    }
  });

  // If already exists, update values
  if (!created) {
    await Criteria424.update({
      no_of_teachers_stds: noOfTeachers
    }, {
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
      }
    });

    entry = await Criteria424.findOne({
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        no_of_teachers_stds: noOfTeachers
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      entry,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});


const score424 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("4.2.4");

  // Step 1: Get criteria info
  const criteria = await CriteriaMaster.findOne({
    where: { sub_sub_criterion_id: criteria_code }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 4.2.4 not found");
  }

  // Step 2: Get latest IIQA session range
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
    throw new apiError(400, "Session must be between latest IIQA session and current year");
  }

  // Step 3: Get latest Criteria424 response
  const latestCriteriaResponse = await Criteria424.findOne({
    attributes: ['session', 'no_of_teachers_stds'],
    where: {
      session: {
        [Sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!latestCriteriaResponse) {
    throw new apiError(404, "No responses found for Criteria 4.2.4 in the session range");
  }

  if (latestCriteriaResponse.session !== session) {
    throw new apiError(400, `No response found for the current session: ${session}`);
  }

  // Step 4: Get corresponding ExtendedProfile response
  const extendedProfileResponse = await ExtendedProfile.findOne({
    attributes: ['total_students', 'full_time_teachers'],
    raw: true,
    order: [['created_at', 'DESC']],
    limit: 1
  });

  if (!extendedProfileResponse) {
    throw new apiError(404, "No Extended Profile data found for the current session");
  }

  // Step 5: Calculate score
  const numerator = Number(latestCriteriaResponse.no_of_teachers_stds || 0);
  const denominator =
    Number(extendedProfileResponse.total_students || 0) +
    Number(extendedProfileResponse.full_time_teachers || 0);

  if (denominator === 0) {
    throw new apiError(400, "Cannot compute score: denominator is zero");
  }

  const score = (numerator / denominator).toFixed(3)*100;
  let grade = 0; // No grading logic provided

  if(score < 2){
    grade = 0;
  }else if(score >= 2 && score <= 6){
    grade = 1;
  }else if(score >= 6 && score <= 8){
    grade = 2;
  }else if(score >= 8 && score <= 10){
    grade = 3;
  }else if(score >= 10){
    grade = 4;
  }

  // Step 6: Store or update score in the scores table
  let [entry, created] = await Score.findOrCreate({
    where: {
      criteria_code: criteria.criteria_code,
      session,
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
      session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update({
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade
    }, {
      where: {
        criteria_code: criteria.criteria_code,
        session,
      }
    });

    entry = await Score.findOne({
      where: {
        criteria_code: criteria.criteria_code,
        session,
      }
    });
  }

  return res.status(200).json(
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});


const createResponse432 = asyncHandler(async (req, res) => {
  const {
    session,
    academic_year,
    total_students,
    working_computers,
    student_computer_ratio
  } = req.body;

  const sessionYear = Number(session);
  const academicYear = Number(academic_year);
  const totalStudents = Number(total_students);
  const workingComputers = Number(working_computers);
  const ratio = Number(student_computer_ratio);

  if (!sessionYear || !academicYear || !totalStudents || !workingComputers || !ratio) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();
  if (sessionYear < 1990 || sessionYear > currentYear) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (academicYear < 1990 || academicYear > currentYear) {
    throw new apiError(400, "Academic year must be between 1990 and current year");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040302',
      sub_criterion_id: '0403',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) throw new apiError(404, "IIQA not found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  let [entry, created] = await Criteria432.findOrCreate({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code,
      academic_year: academicYear
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      academic_year: academicYear,
      total_students: totalStudents,
      working_computers: workingComputers,
      student_computer_ratio: ratio
    }
  });

  if (!created) {
    await Criteria432.update({
      total_students: totalStudents,
      working_computers: workingComputers,
      student_computer_ratio: ratio
    }, {
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        academic_year: academicYear
      }
    });

    entry = await Criteria432.findOne({
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        academic_year: academicYear
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

const score432 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("4.3.2");

  // Step 1: Fetch Criteria info
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 4.3.2 not found");
  }

  // Step 2: Fetch latest IIQA session year
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

  // Step 3: Fetch latest working_computers from Criteria432


  // Step 4: Fetch total students from ExtendedProfile
  const extendedProfileResponse = await ExtendedProfile.findOne({
    attributes: ['total_students','total_computers'],
    order: [['created_at', 'DESC']],
    limit: 1,
    raw: true
  });

  if (!extendedProfileResponse) {
    throw new apiError(404, "No Extended Profile data found for the current session");
  }

  const totalStudents = Number(extendedProfileResponse.total_students || 0);
  const workingComputers = Number(extendedProfileResponse.total_computers || 0);

  if (workingComputers === 0) {
    throw new apiError(400, "Cannot calculate ratio: number of working computers is zero");
  }

  // Step 5: Calculate ratio and determine score
  const ratio = Math.round(totalStudents / workingComputers); // students per computer
  const score = parseFloat(`${ratio}.1`); // as per example in score222

  let grade;
  if (score <= 5.1) grade = 4;
  else if (score <= 15.1) grade = 3;
  else if (score <= 30.1) grade = 2;
  else if (score <= 40.1) grade = 1;
  else grade = 0;

  // Step 6: Insert or update score entry
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
      session,
      year: session,
      cycle_year: 1
    }
  });

  if (!created) {
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
    new apiResponse(200, entry, created ? "Score created successfully" : "Score updated successfully")
  );
});



const createResponse441 = asyncHandler(async (req, res) => {
  const {
    session,
    year,
    budget_allocated_infra,
    expenditure_infra_lakhs,
    total_exp_infra_lakhs,
    exp_maintainance_acad,
    exp_maintainance_physical
  } = req.body;

  const sessionYear = Number(session);
  const yearVal = Number(year);
  const budget = Number(budget_allocated_infra);
  const expenditure = Number(expenditure_infra_lakhs);
  const totalExp = Number(total_exp_infra_lakhs);
  const maintainAcad = Number(exp_maintainance_acad);
  const maintainPhysical = Number(exp_maintainance_physical);

  if (!sessionYear || !yearVal || !budget || !expenditure || !totalExp || !maintainAcad || !maintainPhysical) {
    throw new apiError(400, "Missing or invalid required fields");
  }

  const currentYear = new Date().getFullYear();
  if (sessionYear < 1990 || sessionYear > currentYear) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '040401',
      sub_criterion_id: '0404',
      criterion_id: '04'
    }
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  const latestIIQA = await IIQA.findOne({
    attributes: ['session_end_year'],
    order: [['created_at', 'DESC']]
  });

  if (!latestIIQA) throw new apiError(404, "IIQA not found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (sessionYear < startYear || sessionYear > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  let [entry, created] = await Criteria441.findOrCreate({
    where: {
      session: sessionYear,
      criteria_code: criteria.criteria_code,
      year: yearVal
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session: sessionYear,
      year: yearVal,
      budget_allocated_infra: budget,
      expenditure_infra_lakhs: expenditure,
      total_exp_infra_lakhs: totalExp,
      exp_maintainance_acad: maintainAcad,
      exp_maintainance_physical: maintainPhysical
    }
  });

  if (!created) {
    await Criteria441.update({
      budget_allocated_infra: budget,
      expenditure_infra_lakhs: expenditure,
      total_exp_infra_lakhs: totalExp,
      exp_maintainance_acad: maintainAcad,
      exp_maintainance_physical: maintainPhysical
    }, {
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        year: yearVal
      }
    });

    entry = await Criteria441.findOne({
      where: {
        session: sessionYear,
        criteria_code: criteria.criteria_code,
        year: yearVal
      }
    });
  }

  return res.status(created ? 201 : 200).json(
    new apiResponse(created ? 201 : 200, entry, created ? "Response created successfully" : "Response updated successfully")
  );
});

export{
  createResponse414,
  createResponse423,
  createResponse413,
  createResponse422,
  score414,
  score423,
  score413,
  score432,
  score424,
  score422,
  createResponse424,
  createResponse432,
  createResponse441,
  getResponsesByCriteriaCode,
  
}
