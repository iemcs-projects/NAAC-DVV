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

const CriteriaMaster = db.criteria_master;

const getAllCriteria712 = asyncHandler(async (req, res) => {
    const criteria = await Criteria712.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route POST /api/response/7.1.2
 * @description Create a new response for criteria 7.1.2
 * @access Private/Admin
 */
const createResponse712 = asyncHandler(async (req, res) => {
        console.log(CriteriaMaster)
        const criteria = await CriteriaMaster.findOne({
            where: {
              sub_sub_criterion_id: '070102',
              sub_criterion_id: '0701',
              criterion_id: '07'
            }
          });
      
          if (!criteria) {
            throw new apiError(404, "Criteria not found");
          }
      
          // Validate required fields
          const {session,facility_type,photo_link,additional_info,submitted_at } = req.body;
          if (!session || !facility_type || !photo_link || !additional_info || !submitted_at) {
            throw new apiError(400, "Missing required fields");
          }

          // Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)
          // Insert into response_1_1_3_data
          const entry = await Criteria712.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,  // Store as Date object
            facility_type,
            photo_link,
            additional_info,
            submitted_at
          });
      
          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );

});
/**
 * @route GET /api/response/7.1.2/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_7_1_2.findAll({
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
export { getAllCriteria712,
    createResponse712,
    getResponsesByCriteriaCode
 };



 const getAllCriteria714 = asyncHandler(async (req, res) => {
    const criteria = await Criteria714.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route POST /api/response/7.1.2
 * @description Create a new response for criteria 7.1.2
 * @access Private/Admin
 */
 const createResponse714 = asyncHandler(async (req, res) => {
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '070104',
          sub_criterion_id: '0701',
          criterion_id: '07'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
      const {session,facility_type,photo_link,additional_info,submitted_at } = req.body;
      if (!session || !facility_type || !photo_link || !additional_info || !submitted_at) {
        throw new apiError(400, "Missing required fields");
      }

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_1_1_3_data
      const entry = await Criteria714.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
        facility_type,
        photo_link,
        additional_info,
        submitted_at
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});
/**
* @route GET /api/response/7.1.2/:criteriaCode
* @description Get all responses for a specific criteria code
* @access Public
*/
const getResponsesByCriteriaCode714= async (req, res, next) => {
try {
    const { criteriaCode } = req.params;
    
    const responses = await db.response_7_1_4.findAll({
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
export { getAllCriteria714,
createResponse714,
getResponsesByCriteriaCode714
};




const getAllCriteria715 = asyncHandler(async (req, res) => {
    const criteria = await Criteria715.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route POST /api/response/7.1.2
 * @description Create a new response for criteria 7.1.2
 * @access Private/Admin
 */
const createResponse715 = asyncHandler(async (req, res) => {
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '070105',
          sub_criterion_id: '0701',
          criterion_id: '07'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
    const {session,initiative,photo_link,document_link,submitted_at } = req.body;
      if (!session || !initiative || !photo_link || !document_link || !submitted_at) {
        throw new apiError(400, "Missing required fields");
      }

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_1_1_3_data
      const entry = await Criteria715.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
        initiative,
        photo_link,
        document_link,
        submitted_at
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});
/**
* @route GET /api/response/7.1.2/:criteriaCode
* @description Get all responses for a specific criteria code
* @access Public
*/
const getResponsesByCriteriaCode715 = async (req, res, next) => {
try {
    const { criteriaCode } = req.params;
    
    const responses = await db.response_7_1_5.findAll({
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
export { getAllCriteria715,
createResponse715,
getResponsesByCriteriaCode715
};




const getAllCriteria716 = asyncHandler(async (req, res) => {
    const criteria = await Criteria716.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});
    
/**
 * @route POST /api/response/7.1.6
 * @description Create a new response for criteria 7.1.6
 * @access Private/Admin
 */
const createResponse716 = asyncHandler(async (req, res) => {
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '070106',
          sub_criterion_id: '0701',
          criterion_id: '07'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
    const {session,audit_type,photo_link,report_link,certification,additional_info,submitted_at } = req.body;
      if (!session || !audit_type || !photo_link || !report_link || !certification || !additional_info || !submitted_at) {
        throw new apiError(400, "Missing required fields");
      }

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_1_1_3_data
      const entry = await Criteria716.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: session,  // Store as Date object
        audit_type,
        photo_link,
        report_link,
        certification,
        additional_info,
        submitted_at
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});

/**
 * @route GET /api/response/7.1.6/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode716 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_7_1_6.findAll({
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

export { getAllCriteria716,
    createResponse716,
    getResponsesByCriteriaCode716
 };





 const getAllCriteria717 = asyncHandler(async (req, res) => {
    const criteria = await Criteria717.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});
    
/**
 * @route POST /api/response/7.1.6
 * @description Create a new response for criteria 7.1.6
 * @access Private/Admin
 */
const createResponse717 = asyncHandler(async (req, res) => {
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '070107',
          sub_criterion_id: '0701',
          criterion_id: '07'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
    const {session,feature,photo_link,support_document,software_used,submitted_at } = req.body;
      if (!session || !feature || !photo_link || !support_document || !software_used || !submitted_at) {
        throw new apiError(400, "Missing required fields");
      }

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_1_1_3_data
      const entry = await Criteria717.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: session,  // Store as Date object
        feature,
        photo_link,
        support_document,
        software_used,
        submitted_at
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});

/**
 * @route GET /api/response/7.1.7/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode717 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_7_1_7.findAll({
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

export { getAllCriteria717,
    createResponse717,
    getResponsesByCriteriaCode717
 };




 const getAllCriteria7110 = asyncHandler(async (req, res) => {
    const criteria = await Criteria7110.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});
    
/**
 * @route POST /api/response/7.1.6
 * @description Create a new response for criteria 7.1.6
 * @access Private/Admin
 */
const createResponse7110 = asyncHandler(async (req, res) => {
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '070110',
          sub_criterion_id: '0701',
          criterion_id: '07'
        }
      });
  
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
  
      // Validate required fields
    const {session,options,year,code_published, monitoring_committee,ethics_programs, awareness_programs, report_links, additional_info,submitted_at } = req.body;
      if (!session || !options || !year || !code_published || !monitoring_committee || !ethics_programs || !awareness_programs || !report_links || !additional_info || !submitted_at) {
        throw new apiError(400, "Missing required fields");
      }
      
      if (year < 1990 || year > new Date().getFullYear()) {
        throw new apiError(400, "Year must be between 1990 and current year");
      }
      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_1_1_3_data
      const entry = await Criteria7110.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: session,  // Store as Date object
        options,
        year,
        code_published,
        monitoring_committee,
        ethics_programs,
        awareness_programs,
        report_links,
        additional_info,
        submitted_at
      });
  
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );

});

/**
 * @route GET /api/response/7.1.7/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode7110 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_7_1_10.findAll({
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

export { getAllCriteria7110,
    createResponse7110,
    getResponsesByCriteriaCode7110
 };
