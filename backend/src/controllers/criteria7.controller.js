import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

const Criteria712 = db.response_7_1_2;
const Criteria714 = db.response_7_1_4;
const Criteria715 = db.response_7_1_5;
const Criteria716 = db.response_7_1_6;
const Criteria717 = db.response_7_1_7;
const Criteria7110 = db.response_7_1_10;
const Score = db.scores;
const CriteriaMaster = db.criteria_master;
const IIQA = db.iiqa_form;

// Helper function to convert criteria code to padded format
const convertToPaddedFormat = (code) => {
  // First remove any dots, then split into individual characters
  const parts = code.replace(/\./g, '').split('');
  // Pad each part to 2 digits and join
  return parts.map(part => part.padStart(2, '0')).join('');
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
  
  console.log("DB Name", db[dbName]);
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
    console.log(error);
    throw new apiError(500, "Failed to fetch responses");
  }
});




// 7.1.2

const createResponse712 = asyncHandler(async (req, res) => {
  /*
  1. Get the user input from the req body
  2. Validate the user input (check missing data, year between 1990 and current year, facility_type 0–4)
  3. Query the criteria_master table to get id & criteria_code
  4. Fetch the latest IIQA session
  5. Check if the session is within the valid IIQA session window
  6. Create a new response or update the existing one
  7. Return the response
  */

  const { session, facility_type, photo_link, additional_info } = req.body;

  // Step 1: Validate inputs
  if (!session || facility_type == null ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (facility_type < 0 || facility_type > 4) {
    throw new apiError(400, "Facility type must be between 0 and 4");
  }

  const facilityTypeString = String(facility_type);

  // Step 2: Fetch criteria from criteria_master
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: "070102",
      sub_criterion_id: "0701",
      criterion_id: "07",
    },
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Fetch latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) throw new apiError(404, "No IIQA form found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Create or update entry
  let [entry, created] = await Criteria712.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      facility_type: facilityTypeString,
      photo_link,
      additional_info,
    },
  });

  if (!created) {
    await Criteria712.update(
      {
        facility_type: facilityTypeString,
        photo_link,
        additional_info,
      },
      {
        where: {
          session,
          criteria_code: criteria.criteria_code,
        },
      }
    );

    entry = await Criteria712.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      },
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

// score 7.1.2
const score712 = asyncHandler(async (req, res) => {
  const criteria_code = '070102'; // Directly using the code since we know it
  const currentYear = new Date().getFullYear();
  const session = currentYear;

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 7.1.2 not found in criteria_master");
  }

  const response = await Criteria712.findOne({
    where: { criteria_code: criteria.criteria_code },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 7.1.2");
  }

  // Ensure facility_type is a valid number
  const facilityTypeNumber = Number(response.facility_type);
  if (isNaN(facilityTypeNumber) || facilityTypeNumber < 0 || facilityTypeNumber > 4) {
    throw new apiError(400, "Invalid facility_type value in database");
  }

  const score = facilityTypeNumber; // Score directly maps to facility_type
  const grade = facilityTypeNumber; // Grade directly maps to facility_type


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
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
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



// 7.1.4

const createResponse714 = asyncHandler(async (req, res) => {
  /*
  1. Get the user input from the req body
  2. Validate the user input (check missing data, year between 1990 and current year, facility_type 0–4)
  3. Query the criteria_master table to get id & criteria_code
  4. Fetch the latest IIQA session
  5. Check if the session is within the valid IIQA session window
  6. Create a new response or update the existing one
  7. Return the response
  */

  const { session, facility_type, photo_link, additional_info } = req.body;

  // Step 1: Validate inputs
  if (!session || facility_type == null ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (facility_type < 0 || facility_type > 4) {
    throw new apiError(400, "Facility type must be between 0 and 4");
  }

  const facilityTypeString = String(facility_type);

  // Step 2: Fetch criteria from criteria_master
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: "070104",
      sub_criterion_id: "0701",
      criterion_id: "07",
    },
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Fetch latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) throw new apiError(404, "No IIQA form found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Create or update entry
  let [entry, created] = await Criteria714.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      facility_type: facilityTypeString,
      photo_link,
      additional_info,
    },
  });

  if (!created) {
    await Criteria714.update(
      {
        facility_type: facilityTypeString,
        photo_link,
        additional_info,
      },
      {
        where: {
          session,
          criteria_code: criteria.criteria_code,
        },
      }
    );

    entry = await Criteria714.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      },
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


// score 7.1.4
const score714 = asyncHandler(async (req, res) => {
  const criteria_code = '070104'; // Directly using the code since we know it
  const session = new Date().getFullYear();

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 7.1.4 not found in criteria_master");
  }

  const response = await Criteria714.findOne({
    where: { criteria_code: criteria.criteria_code },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 7.1.4");
  }

  // Ensure facility_type is a valid number
  const facilityTypeNumber = Number(response.facility_type);
  if (isNaN(facilityTypeNumber) || facilityTypeNumber < 0 || facilityTypeNumber > 4) {
    throw new apiError(400, "Invalid facility_type value in database");
  }

  const score = facilityTypeNumber; // Score directly maps to facility_type
  const grade = facilityTypeNumber; // Grade directly maps to facility_type

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
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
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
// 7.1.5

const createResponse715 = asyncHandler(async (req, res) => {
  /*
  1. Get the user input from the req body
  2. Validate the user input (check missing data, year between 1990 and current year, facility_type 0–4)
  3. Query the criteria_master table to get id & criteria_code
  4. Fetch the latest IIQA session
  5. Check if the session is within the valid IIQA session window
  6. Create a new response or update the existing one
  7. Return the response
  */

  const { session, initiative, photo_link, document_link } = req.body;

  // Step 1: Validate inputs
  if (!session || initiative == null ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (initiative < 0 || initiative > 4) {
    throw new apiError(400, "Facility type must be between 0 and 4");
  }

  const initiativeString = String(initiative);

  // Step 2: Fetch criteria from criteria_master
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: "070105",
      sub_criterion_id: "0701",
      criterion_id: "07",
    },
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Fetch latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) throw new apiError(404, "No IIQA form found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Create or update entry
  let [entry, created] = await Criteria715.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      initiative: initiativeString,
      photo_link,
      document_link,
    },
  });

  if (!created) {
    await Criteria715.update(
      {
        initiative: initiativeString,
        photo_link,
        document_link,
      },
      {
        where: {
          session,
          criteria_code: criteria.criteria_code,
        },
      }
    );

    entry = await Criteria715.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      },
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
// score 7.1.5
const score715 = asyncHandler(async (req, res) => {
  const criteria_code = '070105'; // Directly using the code since we know it
  const session = new Date().getFullYear();

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 7.1.5 not found in criteria_master");
  }

  const response = await Criteria715.findOne({
    where: { criteria_code: criteria.criteria_code },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 7.1.5");
  }

  // Ensure initiative is a valid number
  const initiativeNumber = Number(response.initiative);
  if (isNaN(initiativeNumber) || initiativeNumber < 0 || initiativeNumber > 4) {
    throw new apiError(400, "Invalid initiative value in database");
  }

  const score = initiativeNumber; // Score directly maps to initiative
  const grade = initiativeNumber; // Grade directly maps to initiative

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
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
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



// 7.1.6

const createResponse716 = asyncHandler(async (req, res) => {
  /*
  1. Get the user input from the req body
  2. Validate the user input (check missing data, year between 1990 and current year, facility_type 0–4)
  3. Query the criteria_master table to get id & criteria_code
  4. Fetch the latest IIQA session
  5. Check if the session is within the valid IIQA session window
  6. Create a new response or update the existing one
  7. Return the response
  */

  const { session, audit_type, report_link, certification, additional_info } = req.body;

  // Step 1: Validate inputs
  if (!session || audit_type == null ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (audit_type < 0 || audit_type > 4) {
    throw new apiError(400, "Facility type must be between 0 and 4");
  }

  const auditTypeString = String(audit_type);

  // Step 2: Fetch criteria from criteria_master
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: "070106",
      sub_criterion_id: "0701",
      criterion_id: "07",
    },
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Fetch latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) throw new apiError(404, "No IIQA form found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Create or update entry
  let [entry, created] = await Criteria716.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      audit_type: auditTypeString,
      report_link,
      certification,
      additional_info,
    },
  });

  if (!created) {
    await Criteria716.update(
      {
        audit_type: auditTypeString,
        report_link,
        certification,
        additional_info,
      },
      {
        where: {
          session,
          criteria_code: criteria.criteria_code,
        },
      }
    );

    entry = await Criteria716.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      },
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

const score716 = asyncHandler(async (req, res) => {
  const criteria_code = '070106'; // Directly using the code since we know it
  const session = new Date().getFullYear();

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 7.1.6 not found in criteria_master");
  }

  const response = await Criteria716.findOne({
    where: { criteria_code: criteria.criteria_code },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 7.1.6");
  }

  // Ensure audit_type is a valid number
  const auditTypeNumber = Number(response.audit_type);
  if (isNaN(auditTypeNumber) || auditTypeNumber < 0 || auditTypeNumber > 4) {
    throw new apiError(400, "Invalid audit_type value in database");
  }

  const score = auditTypeNumber; // Score directly maps to audit_type
  const grade = auditTypeNumber; // Grade directly maps to audit_type

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
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
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

// 7.1.7

const createResponse717 = asyncHandler(async (req, res) => {
  /*
  1. Get the user input from the req body
  2. Validate the user input (check missing data, year between 1990 and current year, facility_type 0–4)
  3. Query the criteria_master table to get id & criteria_code
  4. Fetch the latest IIQA session
  5. Check if the session is within the valid IIQA session window
  6. Create a new response or update the existing one
  7. Return the response
  */

  const { session, feature, photo_link, support_document, software_used } = req.body;

  // Step 1: Validate inputs
  if (!session || feature == null ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

  if (feature < 0 || feature > 4) {
    throw new apiError(400, "Facility type must be between 0 and 4");
  }

  const featureString = String(feature);

  // Step 2: Fetch criteria from criteria_master
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: "070107",
      sub_criterion_id: "0701",
      criterion_id: "07",
    },
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Fetch latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) throw new apiError(404, "No IIQA form found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Create or update entry
  let [entry, created] = await Criteria717.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      feature: featureString,
      photo_link,
      support_document,
      software_used,
    },
  });

  if (!created) {
    await Criteria717.update(
      {
        feature: featureString,
        photo_link,
        support_document,
        software_used,
      },
      {
        where: {
          session,
          criteria_code: criteria.criteria_code,
        },
      }
    );

    entry = await Criteria717.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      },
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

const score717 = asyncHandler(async (req, res) => {
  const criteria_code = '070107'; // Directly using the code since we know it
  const session = new Date().getFullYear();

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 7.1.7 not found in criteria_master");
  }

  const response = await Criteria717.findOne({
    where: { criteria_code: criteria.criteria_code },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 7.1.7");
  }

  // Ensure feature is a valid number
  const featureNumber = Number(response.feature);
  if (isNaN(featureNumber) || featureNumber < 0 || featureNumber > 4) {
    throw new apiError(400, "Invalid feature value in database");
  }

  const score = featureNumber; // Score directly maps to feature
  const grade = featureNumber; // Grade directly maps to feature

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
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
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

// 7.1.10

const createResponse7110 = asyncHandler(async (req, res) => {
  /*
  1. Get the user input from the req body
  2. Validate the user input (check missing data, year between 1990 and current year, facility_type 0–4)
  3. Query the criteria_master table to get id & criteria_code
  4. Fetch the latest IIQA session
  5. Check if the session is within the valid IIQA session window
  6. Create a new response or update the existing one
  7. Return the response
  */

  const { session, options, year, code_published, monitoring_committee, ethics_programs, awareness_programs, additional_info } = req.body;

  // Step 1: Validate inputs
  if (!session || options == null ) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Session year must be between 1990 and current year");
  }

 
  if (options < 0 || options > 4) {
    throw new apiError(400, "Facility type must be between 0 and 4");
  }

  const optionsString = String(options);

  // Step 2: Fetch criteria from criteria_master
  const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: "070110",
      sub_criterion_id: "0701",
      criterion_id: "07",
    },
  });

  if (!criteria) throw new apiError(404, "Criteria not found");

  // Step 3: Fetch latest IIQA session
  const latestIIQA = await IIQA.findOne({
    attributes: ["session_end_year"],
    order: [["created_at", "DESC"]],
  });

  if (!latestIIQA) throw new apiError(404, "No IIQA form found");

  const endYear = latestIIQA.session_end_year;
  const startYear = endYear - 5;

  if (session < startYear || session > endYear) {
    throw new apiError(400, `Session must be between ${startYear} and ${endYear}`);
  }

  // Step 4: Create or update entry
  let [entry, created] = await Criteria7110.findOrCreate({
    where: {
      session,
      criteria_code: criteria.criteria_code,
    },
    defaults: {
      id: criteria.id,
      criteria_code: criteria.criteria_code,
      session,
      options: optionsString,
      year:year||null,
      code_published,
      monitoring_committee,
      ethics_programs,
      awareness_programs,
      additional_info,
    },
  });

  if (!created) {
    await Criteria7110.update(
      {
        options: optionsString,
        year:year||null,
        code_published,
        monitoring_committee,
        ethics_programs,
        awareness_programs,
        additional_info,
      },
      {
        where: {
          session,
          criteria_code: criteria.criteria_code,
        },
      }
    );

    entry = await Criteria7110.findOne({
      where: {
        session,
        criteria_code: criteria.criteria_code,
      },
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


const score7110 = asyncHandler(async (req, res) => {
  const criteria_code = '070110'; // Fixed: Changed from 0701010 to 070110
  const session = new Date().getFullYear();

  const criteria = await CriteriaMaster.findOne({
    where: { 
      sub_sub_criterion_id: criteria_code
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria 7.1.10 not found in criteria_master");
  }

  const response = await Criteria7110.findOne({
    where: { criteria_code: criteria.criteria_code },
    order: [['session', 'DESC']],
    raw: true
  });

  if (!response) {
    throw new apiError(404, "No response found for criteria 7.1.10");
  }

  // Ensure options is a valid number
  const optionsNumber = Number(response.options);
  if (isNaN(optionsNumber) || optionsNumber < 0 || optionsNumber > 4) {
    throw new apiError(400, "Invalid options value in database");
  }

  const score = optionsNumber; // Score directly maps to options
  const grade = optionsNumber; // Grade directly maps to options

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
      score_sub_sub_criteria: score,
      sub_sub_cr_grade: grade,
      session: session,
      cycle_year: 1
    }
  });

  if (!created) {
    await Score.update(
      {
        score_sub_sub_criteria: score,
        sub_sub_cr_grade: grade,
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


export {

  createResponse712,
  score712,
  createResponse714,
  score714,
  createResponse715,
  score715,
  createResponse716,
  score716,
  createResponse717,
  score717,
  createResponse7110,
  score7110,
  getResponsesByCriteriaCode,
};



