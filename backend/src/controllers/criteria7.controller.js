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
  let {
    session,
    facility_type,
    photo_link,
    additional_info,
  } = req.body;

  // Input validation
  session = parseInt(session, 10);
  if (isNaN(session) || session < 2000 || session > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid session year");
  }

  // Validate facility_type is a number between 0-4
  const facilityTypeNum = Number(facility_type);
  if (isNaN(facilityTypeNum) || facilityTypeNum < 0 || facilityTypeNum > 4) {
    throw new apiError(400, "facility_type must be a number between 0 and 4");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '07',
      sub_criterion_id: '0701',
      sub_sub_criterion_id: '070102'
    }
  });

  if (!criteria?.id) {
    throw new apiError(404, "Criteria not found or incomplete");
  }

  const [record, created] = await Criteria712.upsert({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    facility_type: facilityTypeNum,
    photo_link: photo_link || null,
    additional_info: additional_info || null
  }, {
    conflictFields: ['session', 'criteria_code'],
    returning: true
  });
  

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      record,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});
// score 7.1.2
const score712 = asyncHandler(async (req, res) => {
  const criteria_code = '070102'; // Directly using the code since we know it
  const currentYear = new Date().getFullYear();

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

  const [entry, created] = await Score.upsert({
    
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: response.session, // Use the session from the response
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year'],
    returning: true
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      facility_type: facilityTypeNumber,
      grade,
      message: `Grade is ${grade} (Selected option: ${facilityTypeNumber})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});



// 7.1.4

const createResponse714 = asyncHandler(async (req, res) => {
  let {
    session,
    facility_type,
    photo_link,
    additional_info,
  } = req.body;

  // Input validation
  session = parseInt(session, 10);
  if (isNaN(session) || session < 2000 || session > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid session year");
  }

  // Validate facility_type is a number between 0-4
  const facilityTypeNum = Number(facility_type);
  if (isNaN(facilityTypeNum) || facilityTypeNum < 0 || facilityTypeNum > 4) {
    throw new apiError(400, "facility_type must be a number between 0 and 4");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '07',
      sub_criterion_id: '0701',
      sub_sub_criterion_id: '070104'
    }
  });

  if (!criteria?.id) {
    throw new apiError(404, "Criteria not found or incomplete");
  }

  const [record, created] = await Criteria714.upsert({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    facility_type: facilityTypeNum,
    photo_link: photo_link || null,
    additional_info: additional_info || null
  }, {
    conflictFields: ['session', 'criteria_code'],
    returning: true
  });

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      record,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});
// score 7.1.4
const score714 = asyncHandler(async (req, res) => {
  const criteria_code = '070104'; // Directly using the code since we know it
  const currentYear = new Date().getFullYear();

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

  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: response.session, // Use the session from the response
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year'],
    returning: true
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      facility_type: facilityTypeNumber,
      grade,
      message: `Grade is ${grade} (Selected option: ${facilityTypeNumber})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

// 7.1.5

const createResponse715 = asyncHandler(async (req, res) => {
  let {
    session,
    initiative,
    photo_link,
    document_link,
  } = req.body;

  // Input validation
  session = parseInt(session, 10);
  if (isNaN(session) || session < 2000 || session > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid session year");
  }

  // Validate initiative is a number between 0-4
  const initiativeNum = Number(initiative);
  if (isNaN(initiativeNum) || initiativeNum < 0 || initiativeNum > 4) {
    throw new apiError(400, "initiative must be a number between 0 and 4");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '07',
      sub_criterion_id: '0701',
      sub_sub_criterion_id: '070105'
    }
  });

  if (!criteria?.id) {
    throw new apiError(404, "Criteria not found or incomplete");
  }

  const [record, created] = await Criteria715.upsert({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    initiative: initiativeNum,
    photo_link: photo_link || null,
    document_link: document_link || null
  }, {
    conflictFields: ['session', 'criteria_code'],
    returning: true
  });

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      record,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});
// score 7.1.5
const score715 = asyncHandler(async (req, res) => {
  const criteria_code = '070105'; // Directly using the code since we know it
  const currentYear = new Date().getFullYear();

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

  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: response.session,
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year'],
    returning: true
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      initiative: initiativeNumber,
      grade,
      message: `Grade is ${grade} (Selected option: ${initiativeNumber})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});



// 7.1.6

const createResponse716 = asyncHandler(async (req, res) => {
  let {
    session,
    audit_type,
    report_link,
    certification,
    additional_info,
  } = req.body;

  // Input validation
  session = parseInt(session, 10);
  if (isNaN(session) || session < 2000 || session > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid session year");
  }

  // Validate audit_type is a number between 0-4
  const auditTypeNum = Number(audit_type);
  if (isNaN(auditTypeNum) || auditTypeNum < 0 || auditTypeNum > 4) {
    throw new apiError(400, "audit_type must be a number between 0 and 4");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '07',
      sub_criterion_id: '0701',
      sub_sub_criterion_id: '070106'
    }
  });

  if (!criteria?.id) {
    throw new apiError(404, "Criteria not found or incomplete");
  }

  const [record, created] = await Criteria716.upsert({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    audit_type: auditTypeNum,
    report_link: report_link || null,
    certification: certification || null,
    additional_info: additional_info || null
  }, {
    conflictFields: ['session', 'criteria_code'],
    returning: true
  });

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      record,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});

const score716 = asyncHandler(async (req, res) => {
  const criteria_code = '070106'; // Directly using the code since we know it
  const currentYear = new Date().getFullYear();

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

  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: response.session, // Use the session from the response
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year'],
    returning: true
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      audit_type: auditTypeNumber,
      grade,
      message: `Grade is ${grade} (Selected option: ${auditTypeNumber})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});


// 7.1.7

const createResponse717 = asyncHandler(async (req, res) => {
  let {
    session,
    feature,
    photo_link,
    support_document,
    software_used,
  } = req.body;

  // Input validation
  session = parseInt(session, 10);
  if (isNaN(session) || session < 2000 || session > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid session year");
  }

  // Validate feature is a number between 0-4
  const featureNum = Number(feature);
  if (isNaN(featureNum) || featureNum < 0 || featureNum > 4) {
    throw new apiError(400, "feature must be a number between 0 and 4");
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '07',
      sub_criterion_id: '0701',
      sub_sub_criterion_id: '070107'
    }
  });

  if (!criteria?.id) {
    throw new apiError(404, "Criteria not found or incomplete");
  }

  const [record, created] = await Criteria717.upsert({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    feature: featureNum,
    photo_link: photo_link || null,
    support_document: support_document || null,
    software_used: software_used || null
  }, {
    conflictFields: ['session', 'criteria_code'],
    returning: true
  });

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      record,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});

const score717 = asyncHandler(async (req, res) => {
  const criteria_code = '070107'; // Directly using the code since we know it
  const currentYear = new Date().getFullYear();

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

  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: response.session, // Use the session from the response
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year'],
    returning: true
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      feature: featureNumber,
      grade,
      message: `Grade is ${grade} (Selected option: ${featureNumber})`
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});


// 7.1.10

const createResponse7110 = asyncHandler(async (req, res) => {
  let {
    session,
    options,
    year,
    code_published,
    monitoring_committee,
    ethics_programs,
    awareness_programs,
    additional_info,
  } = req.body;

  // Input validation
  session = parseInt(session, 10);
  if (isNaN(session) || session < 2000 || session > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid session year");
  }

  // Validate options is a number between 0-4
  const optionsNum = Number(options);
  if (isNaN(optionsNum) || optionsNum < 0 || optionsNum > 4) {
    throw new apiError(400, "options must be a number between 0 and 4");
  }

  // Validate year if provided
  if (year !== undefined) {
    const yearNum = Number(year);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear()) {
      throw new apiError(400, "Invalid year");
    }
  }

  const criteria = await CriteriaMaster.findOne({
    where: {
      criterion_id: '07',
      sub_criterion_id: '0701',
      sub_sub_criterion_id: '070110' // Fixed: Changed from 0701010 to 070110
    }
  });

  if (!criteria?.id) {
    throw new apiError(404, "Criteria not found or incomplete");
  }

  const [record, created] = await Criteria7110.upsert({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session,
    options: optionsNum,
    year: year ? Number(year) : null,
    code_published: code_published || null,
    monitoring_committee: monitoring_committee || null,
    ethics_programs: ethics_programs || null,
    awareness_programs: awareness_programs || null,
    additional_info: additional_info || null
  }, {
    conflictFields: ['session', 'criteria_code'],
    returning: true
  });

  return res.status(created ? 201 : 200).json(
    new apiResponse(
      created ? 201 : 200,
      record,
      created ? "Response created successfully" : "Response updated successfully"
    )
  );
});

const score7110 = asyncHandler(async (req, res) => {
  const criteria_code = '070110'; // Fixed: Changed from 0701010 to 070110
  const currentYear = new Date().getFullYear();

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

  const [entry, created] = await Score.upsert({
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: 0,
    score_sub_criteria: 0,
    score_sub_sub_criteria: score,
    sub_sub_cr_grade: grade,
    session: response.session, // Use the session from the response
    year: currentYear,
    cycle_year: 1
  }, {
    conflictFields: ['criteria_code', 'session', 'year'],
    returning: true
  });

  return res.status(200).json(
    new apiResponse(200, {
      score,
      options: optionsNumber,
      grade,
      message: `Grade is ${grade} (Selected option: ${optionsNumber})`
    }, created ? "Score created successfully" : "Score updated successfully")
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



