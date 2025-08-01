import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

const Criteria413 = db.response_4_1_3;
const Criteria414 = db.response_4_1_4;
const CriteriaMaster = db.criteria_master;
const Criteria422423 = db.response_4_2_2_4_2_3;
const Criteria432 = db.response_4_3_2;
const Criteria441 = db.response_4_4_1;

const getAllCriteria413 = asyncHandler(async (req, res) => {
    const criteria = await Criteria413.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route POST /api/response/4.1.3
 * @description Create a new response for criteria 4.1.3
 * @access Private/Admin
 */
const createResponse413 = asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */
        // Fetch 4.1.3 criterion from criteria_master
        console.log(CriteriaMaster)
        const criteria = await CriteriaMaster.findOne({
            where: {
              sub_sub_criterion_id: '040103',
              sub_criterion_id: '0401',
              criterion_id: '04'
            }
          });
      
          if (!criteria) {
            throw new apiError(404, "Criteria not found");
          }
      
          // Validate required fields
          const { session, room_identifier, typeict_facility } = req.body;
          if (!session || !room_identifier || !typeict_facility) {
            throw new apiError(400, "Missing required fields");
          }

          if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          

          // Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)
          // Insert into response_4_1_3_data
          const entry = await Criteria413.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,  // Store as Date object
            room_identifier,
            typeict_facility,
            
          });
      
          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );

});
/**
 * @route GET /api/response/4.1.3/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode413 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_4_1_3.findAll({
            where: { criteria_code: criteriaCode },
            include: [{
                model: db.criteria_master,
                as: 'criteria',
                attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
            }],
            order: [['submitted_at', 'DESC']]
        });

        return res.status(200).json(
            new apiResponse(200, responses, 'Responses retrieved successfully')
        );

    } catch (error) {
        next(error);
    }
};
export { getAllCriteria413,
    createResponse413,
    getResponsesByCriteriaCode413
 };


 //4.1.4


 

 const getAllCriteria414 = asyncHandler(async (req, res) => {
    const criteria = await Criteria414.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

 /**
 * @route POST /api/response/4.1.4
 * @description Create a new response for criteria 4.1.4
 * @access Private/Admin
 */


 const createResponse414 = asyncHandler(async (req, res) => {
  /*
  1. get the user input from the req body
  2. query the criteria_master table to get the id and criteria_code 
  3. validate the user input
  4. create a new response
  5. return the response
  */
      // Fetch 4.1.4 criterion from criteria_master
      console.log(CriteriaMaster)
      const criteria = await CriteriaMaster.findOne({
          where: {
            sub_sub_criterion_id: '040104',
            sub_criterion_id: '0401',
            criterion_id: '04'
          }
        });
    
        if (!criteria) {
          throw new apiError(404, "Criteria not found");
        }
    
        // Validate required fields
        const { session, year, budget_allocated_infra_aug, expenditure_infra_aug, total_expenditure_excl_salary, expenditure_academic_maint, expenditure_physical_maint } = req.body;
        if (!session || !year || !budget_allocated_infra_aug || !expenditure_infra_aug || !total_expenditure_excl_salary || !expenditure_academic_maint || !expenditure_physical_maint) {
          throw new apiError(400, "Missing required fields");
        }

        if (session < 1990 || session > new Date().getFullYear()) {
          throw new apiError(400, "Year must be between 1990 and current year");
        }

        if (year < 1990 || year > new Date().getFullYear()) {
          throw new apiError(400, "Year must be between 1990 and current year");
        }

        

        // Create proper Date objects for session
        const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
        console.log(criteria.criteria_code)
        // Insert into response_4_1_4_data
        const entry = await Criteria414.create({
          id: criteria.id,
          criteria_code: criteria.criteria_code,
          session: sessionDate,  // Store as Date object
          year,
          budget_allocated_infra_aug,
          expenditure_infra_aug,
          total_expenditure_excl_salary,
          expenditure_academic_maint,
          expenditure_physical_maint,
          
        });
    
        res.status(201).json(
          new apiResponse(201, entry, "Response created successfully")
        );

});
/**
* @route GET /api/response/4.1.3/:criteriaCode
* @description Get all responses for a specific criteria code
* @access Public
*/
const getResponsesByCriteriaCode414 = async (req, res, next) => {
  try {
      const { criteriaCode } = req.params;
      
      const responses = await db.response_4_1_4.findAll({
          where: { criteria_code: criteriaCode },
          include: [{
              model: db.criteria_master,
              as: 'criteria',
              attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
          }],
          order: [['submitted_at', 'DESC']]
      });

      return res.status(200).json(
          new apiResponse(200, responses, 'Responses retrieved successfully')
      );

  } catch (error) {
      next(error);
  }
};
export { getAllCriteria414,
  createResponse414,
  getResponsesByCriteriaCode414
};


//4.2.2 & 4.2.3


const getAllCriteria422423 = asyncHandler(async (req, res) => {
  const criteria = await Criteria422423.findAll();
  if (!criteria) {
      throw new apiError(404, "Criteria not found");
  }
  
  res.status(200).json(
      new apiResponse(200, criteria, "Criteria found")
  );
});

/**
 * @route POST /api/response/4.2.2 & 4.2.3
 * @description Create a new response for criteria 4.2.2 & 4.2.3
 * @access Private/Admin
 */

const createResponse422423 = asyncHandler(async (req, res) => {
/*
1. get the user input from the req body
2. query the criteria_master table to get the id and criteria_code 
3. validate the user input
4. create a new response
5. return the response
*/
    // Fetch 4.2.2 & 4.2.3 criterion from criteria_master
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '040202' || '040203',
          sub_criterion_id: '0402' || '0402',
          criterion_id: '04' || '04'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
      const { session, year, resource_type, subscription_detail, expenditure_lakhs, total_expenditure} = req.body;
      if (!session || !year || !resource_type || !subscription_detail || !expenditure_lakhs || !total_expenditure) {
        throw new apiError(400, "Missing required fields");
      }

      if (session < 1990 || session > new Date().getFullYear()) {
        throw new apiError(400, "Year must be between 1990 and current year");
      }

      if (year < 1990 || year > new Date().getFullYear()) {
        throw new apiError(400, "Year must be between 1990 and current year");
      }

      

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_4_2_2_4_2_3_data
      const entry = await Criteria422423.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
        year,
        resource_type,
        subscription_detail,
        expenditure_lakhs,
        total_expenditure,
        
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});
/**
* @route GET /api/response/4.2.2_4.2.3/:criteriaCode
* @description Get all responses for a specific criteria code
* @access Public
*/
const getResponsesByCriteriaCode422423 = async (req, res, next) => {
try {
    const { criteriaCode } = req.params;
    
    const responses = await db.response_4_2_2_4_2_3.findAll({
        where: { criteria_code: criteriaCode },
        include: [{
            model: db.criteria_master,
            as: 'criteria',
            attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
        }],
        order: [['submitted_at', 'DESC']]
    });

    return res.status(200).json(
        new apiResponse(200, responses, 'Responses retrieved successfully')
    );

} catch (error) {
    next(error);
}
};
export { getAllCriteria422423,
createResponse422423,
getResponsesByCriteriaCode422423
};

//4.2.4


const getAllCriteria424 = asyncHandler(async (req, res) => {
  const criteria = await Criteria424.findAll();
  if (!criteria) {
      throw new apiError(404, "Criteria not found");
  }
  
  res.status(200).json(
      new apiResponse(200, criteria, "Criteria found")
  );
});

/**
 * @route POST /api/response/4.2.4
 * @description Create a new response for criteria 4.2.4
 * @access Private/Admin
 */

const createResponse424 = asyncHandler(async (req, res) => {
/*
1. get the user input from the req body
2. query the criteria_master table to get the id and criteria_code 
3. validate the user input
4. create a new response
5. return the response
*/
    // Fetch 4.2.4 criterion from criteria_master
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '040204',
          sub_criterion_id: '0402',
          criterion_id: '04'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
      const { session, no_of_teachers_stds, total_teachers_stds } = req.body;
      if (!session || !no_of_teachers_stds || !total_teachers_stds) {
        throw new apiError(400, "Missing required fields");
      }

      if (session < 1990 || session > new Date().getFullYear()) {
        throw new apiError(400, "Year must be between 1990 and current year");
      }

    

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_4_2_4_data
      const entry = await Criteria424.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
          no_of_teachers_stds,
        total_teachers_stds,
        
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});
/**
* @route GET /api/response/4.2.4/:criteriaCode
* @description Get all responses for a specific criteria code
* @access Public
*/
const getResponsesByCriteriaCode424 = async (req, res, next) => {
try {
    const { criteriaCode } = req.params;
    
    const responses = await db.response_4_2_4.findAll({
        where: { criteria_code: criteriaCode },
        include: [{
            model: db.criteria_master,
            as: 'criteria',
            attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
        }],
        order: [['submitted_at', 'DESC']]
    });

    return res.status(200).json(
        new apiResponse(200, responses, 'Responses retrieved successfully')
    );

} catch (error) {
    next(error);
}
};
export { getAllCriteria424,
createResponse424,
getResponsesByCriteriaCode424
};


//4_3_2


const getAllCriteria432 = asyncHandler(async (req, res) => {
  const criteria = await Criteria432.findAll();
  if (!criteria) {
      throw new apiError(404, "Criteria not found");
  }
  
  res.status(200).json(
      new apiResponse(200, criteria, "Criteria found")
  );
});

/**
 * @route POST /api/response/4.3.2
 * @description Create a new response for criteria 4.3.2
 * @access Private/Admin
 */

const createResponse432 = asyncHandler(async (req, res) => {
/*
1. get the user input from the req body
2. query the criteria_master table to get the id and criteria_code 
3. validate the user input
4. create a new response
5. return the response
*/
    // Fetch 4.3.2 criterion from criteria_master
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '040302',
          sub_criterion_id: '0403',
          criterion_id: '01'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
      const { session, academic_year, total_students, working_computers, student_computer_ratio } = req.body;
      if (!session || !academic_year || !total_students || !working_computers || !student_computer_ratio) {
        throw new apiError(400, "Missing required fields");
      }

      if (session < 1990 || session > new Date().getFullYear()) {
        throw new apiError(400, "Year must be between 1990 and current year");
      }

      if (  academic_year < 1990 || academic_year > new Date().getFullYear()) {
        throw new apiError(400, "Academic year must be between 1990 and current year");
      }

      

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_4_3_2_data
      const entry = await Criteria432.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
        academic_year,
        total_students,
        working_computers,
        student_computer_ratio,
        
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});
/**
* @route GET /api/response/4.3.2/:criteriaCode
* @description Get all responses for a specific criteria code
* @access Public
*/
const getResponsesByCriteriaCode432 = async (req, res, next) => {
try {
    const { criteriaCode } = req.params;
    
    const responses = await db.response_4_3_2.findAll({
        where: { criteria_code: criteriaCode },
        include: [{
            model: db.criteria_master,
            as: 'criteria',
            attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
        }],
        order: [['submitted_at', 'DESC']]
    });

    return res.status(200).json(
        new apiResponse(200, responses, 'Responses retrieved successfully')
    );

} catch (error) {
    next(error);
}
};
export { getAllCriteria432,
createResponse432,
getResponsesByCriteriaCode432
};


//4_4_1



const getAllCriteria441 = asyncHandler(async (req, res) => {
    const criteria = await Criteria441.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route POST /api/response/4.4.1
 * @description Create a new response for criteria 4.4.1
 * @access Private/Admin
 */
const createResponse441 = asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */
        // Fetch 4.4.1 criterion from criteria_master
        console.log(CriteriaMaster)
        const criteria = await CriteriaMaster.findOne({
            where: {
              sub_sub_criterion_id: '040401',
              sub_criterion_id: '0404',
              criterion_id: '04'
            }
          });
      
          if (!criteria) {
            throw new apiError(404, "Criteria not found");
          }
      
          // Validate required fields
          const { session, year, budget_allocated_infra, expenditure_infra_lakhs, total_exp_infra_lakhs, exp_maintainance_acad, exp_maintainance_physical } = req.body;
          if (!session || !year || !budget_allocated_infra || !expenditure_infra_lakhs || !total_exp_infra_lakhs || !exp_maintainance_acad || !exp_maintainance_physical) {
            throw new apiError(400, "Missing required fields");
          }

          if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          

          // Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)
          // Insert into response_4_4_1_data
          const entry = await Criteria441.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,  // Store as Date object
              year,
            budget_allocated_infra,
            expenditure_infra_lakhs,
            total_exp_infra_lakhs,
            exp_maintainance_acad,
            exp_maintainance_physical,
          });
      
          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );

});
/**
 * @route GET /api/response/4.4.1/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode441 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_4_4_1.findAll({
            where: { criteria_code: criteriaCode },
            include: [{
                model: db.criteria_master,
                as: 'criteria',
                attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
            }],
            order: [['submitted_at', 'DESC']]
        });

        return res.status(200).json(
            new apiResponse(200, responses, 'Responses retrieved successfully')
        );

    } catch (error) {
        next(error);
    }
};
export { getAllCriteria441,
    createResponse441,
    getResponsesByCriteriaCode441
 };

