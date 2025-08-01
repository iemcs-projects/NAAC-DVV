import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

const Criteria511and512 = db.response_5_1_1and2;
const Criteria513 = db.response_5_1_3;
const Criteria514 = db.response_5_1_4;
const Criteria521 = db.response_5_2_1;
const Criteria522 = db.response_5_2_2;
const Criteria523 = db.response_5_2_3;
const Criteria531 = db.response_5_3_1;
const Criteria533 = db.response_5_3_3;
const CriteriaMaster = db.criteria_master;

const getAllCriteria511and512 = asyncHandler(async (req, res) => {
    const criteria = await Criteria511and512.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});
/**
 * @route GET /api/response/5.1.1and5.1.2
 * @description Get all responses for criteria 5.1.1 and 5.1.2
 * @access Public
 */

const createResponse511512 = asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */
        // Fetch 5.1.1 and 5.1.2 criterion from criteria_master
        console.log(CriteriaMaster)
        const criteria = await CriteriaMaster.findOne({
            where: {
                sub_sub_criterion_id: '050101' || '050102',
                sub_criterion_id: '0501' || '0501',
                criterion_id: '05' || '05'
            }
        });
        if (!criteria) {
            throw new apiError(404, "Criteria not found");
        }

        //Validate required fields
        const { session, year, scheme_name, gov_students_count, gov_amount, inst_students_count, inst_amount,} = req.body;
        if (!session || !year || !scheme_name || !gov_students_count || !gov_amount || !inst_students_count || !inst_amount) {
            throw new apiError(400, "Missing required fields");
        }

        if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
        }

        if (year < 1990 || year > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
        }

        if (gov_students_count < 0 || inst_students_count < 0) {
            throw new apiError(400, "Students count must be greater than 0");
        }

        if (gov_amount < 0 || inst_amount < 0) {
            throw new apiError(400, "Amount must be greater than 0");
        }

        //Create proper Date objects for session
        const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
        console.log(criteria.criteria_code)
        
        const entry = await Criteria511and512.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,
            year: year,
            scheme_name: scheme_name,
            gov_students_count: gov_students_count,
            gov_amount: gov_amount,
            inst_students_count: inst_students_count,
            inst_amount: inst_amount
        });
        res.status(201).json(
            new apiResponse(201, entry, "Response created")
        );
    });
    /**
     * @route GET /api/response/5.1.1and5.1.2/:criteriaCode
     * @description Get all responses for a specific criteria code
     * @access Public
     */

    const getResponsesByCriteriaCode511512 = async (req, res, next) => {
        try {
            const { criteriaCode } = req.params;
            
            const responses = await db.response_5_1_1and2.findAll({
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

    export { getAllCriteria511512,
        createResponse511512,
        getResponsesByCriteriaCode511512
     };

     //5.1.3

     const getAllCriteria513 = asyncHandler(async (req, res) => {
        const criteria = await Criteria513.findAll();
        if (!criteria) {
            throw new apiError(404, "Criteria not found");
        }
        
        res.status(200).json(
            new apiResponse(200, criteria, "Criteria found")
        );
    });
    /**
     * @route GET /api/response/5.1.3
     * @description Get all responses for criteria 5.1.3
     * @access Public
     */

    const createResponse513 = asyncHandler(async (req, res) => {
        /*
        1. get the user input from the req body
        2. query the criteria_master table to get the id and criteria_code 
        3. validate the user input
        4. create a new response
        5. return the response
        */
       //Fetch 5.1.3 criterion from criteria_master
       console.log(CriteriaMaster)
       const criteria = await CriteriaMaster.findOne({
           where: {
             sub_sub_criterion_id: '050103',
             sub_criterion_id: '0501',
             criterion_id: '05'
           }
         });
     
         if (!criteria) {
           throw new apiError(404, "Criteria not found");
         }

         //Validate required fields
         const { session, program_name, implementation_date, students_enrolled, agency_name} = req.body;
         if (!session || !program_name || !implementation_date || !students_enrolled || !agency_name) {
             throw new apiError(400, "Missing required fields");
         }

         if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          if (implementation_date < 1990 || implementation_date > new Date().getFullYear()) {
            throw new apiError(400, "Implementation date must be between 1990 and current year");
          }

          if (students_enrolled < 0) {
            throw new apiError(400, "Students enrolled must be greater than 0");
          }

          if (agency_name < 0) {
            throw new apiError(400, "Agency name must be greater than 0");
          }

          //Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)
          
          const entry = await Criteria513.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,
            year:year,
            program_name: program_name,
            implementation_date: implementation_date,
            students_enrolled: students_enrolled,
            agency_name: agency_name
          });
      
          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );
    });
    /**
     * @route GET /api/response/1.2.1/:criteriaCode
     * @description Get all responses for a specific criteria code
     * @access Public
     */
    const getResponsesByCriteriaCode513 = async (req, res, next) => {
        try {
            const { criteriaCode } = req.params;
            
            const responses = await db.response_1_2_1.findAll({
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
    export { getAllCriteria513,
        createResponse513,
        getResponsesByCriteriaCode513
     };

     //5.1.4
     const getAllCriteria514 = asyncHandler(async (req, res) => {
        const criteria = await Criteria514.findAll();
        if (!criteria) {
            throw new apiError(404, "Criteria not found");
        }
        
        res.status(200).json(
            new apiResponse(200, criteria, "Criteria found")
        );
    });
    /**
     * @route GET /api/response/5.1.4
     * @description Get all responses for criteria 5.1.4
     * @access Public
     */

    const createResponse514 = asyncHandler(async (req,res)=>{
        /*
        1. get the user input from the req body
        2. query the criteria_master table to get the id and criteria_code 
        3. validate the user input
        4. create a new response
        5. return the response
        */
        //Fetch 5.1.4 criterion from criteria_master
        console.log(CriteriaMaster)
        const Criteria = await CriteriaMaster.findOne({
            where: {
                sub_sub_criterion_id: '050104',
                sub_criterion_id: '0501',
                criterion_id: '05'
            }
        })
        if (!Criteria) {
            throw new apiError(404, "Criteria not found");
        }
        //Validate required fields
        const { session, year, activity_name, students_participated} = req.body;
        if (!session || !year || !activity_name || !students_participated) {
            throw new apiError(400, "Missing required fields");
        }

        if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          if (students_participated < 0) {
            throw new apiError(400, "Students count must be greater than 0");
          }

          //Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)   
          //Insert into response_5_1_4_data
          const entry = await Criteria514.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,
            year: year,
            activity_name: activity_name,
            students_participated: students_participated
          });
          
          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );
         });
         /**
          * @route GET /api/response/5.1.4/:criteriaCode
          * @description Get all responses for a specific criteria code
          * @access Public
          */
         const getResponsesByCriteriaCode514 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_5_1_4.findAll({
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
        export { getAllCriteria514,
            createResponse514,
            getResponsesByCriteriaCode514
         };


         //5.2.1
         const getAllCriteria521 = asyncHandler(async (req, res) => {
            const criteria = await Criteria521.findAll();
            if (!criteria) {
                throw new apiError(404, "Criteria not found");
            }
            
            res.status(200).json(
                new apiResponse(200, criteria, "Criteria found")
            );
        });
        /**
         * @route GET /api/response/5.2.1
         * @description Get all responses for criteria 5.2.1
         * @access Public
         */

        const createResponse521 = asyncHandler(async (req, res)=>{
            /*
            1. get the user input from the req body
            2. query the criteria_master table to get the id and criteria_code 
            3. validate the user input
            4. create a new response
            5. return the response
            */
                //Fetch 5.2.1 criterion from criteria_master
                console.log(CriteriaMaster)
                const criteria = await CriteriaMaster.findOne({
                    where: {
                      sub_sub_criterion_id: '050201',
                      sub_criterion_id: '0502',
                      criterion_id: '05'
                    }
                })
                if (!criteria) {
                    throw new apiError(404, "Criteria not found");
                }
                //Validate required fields
                const { session, year, student_name_contact, program_graduated_from, employer_details, pay_package_inr} = req.body;
                if (!session || !year || !student_name_contact || !program_graduated_from || !employer_details || !pay_package_inr) {
                    throw new apiError(400, "Missing required fields");
                }

                if (session < 1990 || session > new Date().getFullYear()) {
                    throw new apiError(400, "Year must be between 1990 and current year");
                  }

                  if (year < 1990 || year > new Date().getFullYear()) {
                    throw new apiError(400, "Year must be between 1990 and current year");
                  }

                  if (pay_package_inr < 0) {
                    throw new apiError(400, "Pay package must be greater than 0");
                  }

                  //Create proper Date objects for session
                  const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
                  console.log(criteria.criteria_code)
                  //Insert into response_5_2_1_data
                  const entry = await Criteria521.create({
                    id: criteria.id,
                    criteria_code: criteria.criteria_code,
                    session: sessionDate,
                    year: year,
                    student_name_contact,
                    program_graduated_from,
                    employer_details,
                    pay_package_inr
                  });
                  res.status(201).json(
                    new apiResponse(201, entry, "Response created successfully")
                  );
            
        })
        /**
         * @route GET /api/response/5.2.1/:criteriaCode
         * @description Get all responses for a specific criteria code
         * @access Public
         */
        const getResponsesByCriteriaCode521 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_5_2_1.findAll({
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
        export { getAllCriteria521,
            createResponse521,
            getResponsesByCriteriaCode521
         };


//5.2.2

const getAllCriteria522 = asyncHandler(async (req, res) => {
    const criteria = await Criteria522.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route GET /api/response/5.2.2
 * @description Get all responses for criteria 5.2.2
 * @access Public
 */

const createResponse522 = asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */

        //Fetch 5.2.2 criterion from criteria_master
        console.log(CriteriaMaster)
        const criteria = await CriteriaMaster.findOne({
            where: {
              sub_sub_criterion_id: '050202',
              sub_criterion_id: '0502',
              criterion_id: '05'
            }
          });
        
          if(!criteria){
            throw new apiError(404, "Criteria not found");
          }

          //Validate required fields
          const { session, year, student_name, program_graduated_from, institution_joined, program_admitted_to} = req.body;
          if (!session || !year || !student_name || !program_graduated_from || !institution_joined || !program_admitted_to) {
              throw new apiError(400, "Missing required fields");
          }

          if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          if (year < 1990 || year > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          //Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)
          //Insert into response_5_2_2_data
          const entry = await Criteria522.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,
            year: year,
            student_name,
            program_graduated_from,
            institution_joined,
            program_admitted_to
          });
          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );
});

/**
 * @route GET /api/response/5.2.2/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */

const getResponsesByCriteriaCode522 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_5_2_2.findAll({
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
        export { getAllCriteria522,
            createResponse522,
            getResponsesByCriteriaCode522
         };


//5.2.3
const getAllCriteria523 = asyncHandler(async (req, res) => {
    const criteria = await Criteria523.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});
 /**
 * @route GET /api/response/5.2.3
 * @description Get all responses for criteria 5.2.3
 * @access Public
 */

 const createResponse523 = asyncHandler(async(req,res)=>{
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */

    //Fetch 5.2.3 criterion from criteria_master
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '050203',
          sub_criterion_id: '0502',
          criterion_id: '05'
        }
      });
    
    if(!criteria){
        throw new apiError(404, "Criteria not found");
    }

    //Validate required fields
    const{session, year, registeration_number, exam_net, exam_slet, exam_gate, exam_gmat, exam_cat, exam_gre, exam_jam, exam_ielts, exam_toefl, exam_civil_services, exam_state_services, exam_other} = req.body;
    if(!session || !year || !registeration_number || !exam_net || !exam_slet || !exam_gate || !exam_gmat || !exam_cat || !exam_gre || !exam_jam || !exam_ielts || !exam_toefl || !exam_civil_services || !exam_state_services || !exam_other){
        throw new apiError(400, "Missing required fields");
    }

    if(session < 1990 || session > new Date().getFullYear()){
        throw new apiError(400, "Session must be between 1990 and current year");
    }

    if(year < 1990 || year > new Date().getFullYear()){
        throw new apiError(400, "Year must be between 1990 and current year");
    }

    //Create proper Date objects for session
    const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
    console.log(criteria.criteria_code)
    
    //Insert into response_5_2_3_data
    const entry = await Criteria523.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
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
    });
    
    res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
    );
});
/**
 * @route GET /api/response/5.2.3/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode523 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_5_2_3.findAll({
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
export { getAllCriteria523,
    createResponse523,
    getResponsesByCriteriaCode523
 };

 //5.3.1
 const getAllCriteria531 = asyncHandler(async (req, res) => {
    const criteria = await Criteria531.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

/**
 * @route POST /api/response/5.3.1
 * @description Create a new response for criteria 5.3.1
 * @access Private/Admin
 */

const createResponse531 = asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */

    //Fetch 5.3.1 criterion from criteria_master
    console.log(CriteriaMaster)
    const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '050301',
          sub_criterion_id: '0503',
          criterion_id: '05'
        }
      });
    
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
    
      // Validate required fields
      const {session, year, award_name, team_or_individual, level, activity_type, student_name} = req.body;
      if (!session || !year || !award_name || !team_or_individual || !level || !activity_type || !student_name ) {
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
      // Insert into response_5_3_1_data
      const entry = await Criteria531.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,
        year,
        award_name,
        team_or_individual,
        level,
        activity_type,
        student_name
      });
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );
}); 

/**
 * @route GET /api/response/5.3.1/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode531 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_5_3_1.findAll({
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
export { getAllCriteria531,
    createResponse531,
    getResponsesByCriteriaCode531
 };


//5.3.3
const getAllCriteria533 = asyncHandler(async (req, res) => {
    const criteria = await Criteria533.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});
/**
 * @route GET /api/response/5.3.3
 * @description Get all responses for criteria 5.3.3
 * @access Public
 */
const createResponse533 = asyncHandler(async(req,res)=>{
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */

      //Fetch 5.3.3 criterion from criteria_master
      console.log(CriteriaMaster)
      const criteria = await CriteriaMaster.findOne({
        where: {
          sub_sub_criterion_id: '050303',
          sub_criterion_id: '0503',
          criterion_id: '05'
        }
      });
    
      if (!criteria) {
        throw new apiError(404, "Criteria not found");
      }
    
      // Validate required fields
      const {session, event_date, event_name, student_name} = req.body;
      if (!session || !event_date || !event_name || !student_name ) {
        throw new apiError(400, "Missing required fields");
      }

      if (session < 1990 || session > new Date().getFullYear()) {
        throw new apiError(400, "Session must be between 1990 and current year");
      }

      if (event_date < 1990 || event_date > new Date().getFullYear()) { 
        throw new apiError(400, "Event date must be between 1990 and current year");
      }

      // Create proper Date objects for session
      const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
      console.log(criteria.criteria_code)
      // Insert into response_5_3_3_data
      const entry = await Criteria533.create({
        id: criteria.id,
        criteria_code: criteria.criteria_code,
        session: sessionDate,  // Store as Date object
        event_date,
        event_name,
        student_name
      });
      res.status(201).json(
        new apiResponse(201, entry, "Response created successfully")
      );
});
/**
 * @route GET /api/response/5.3.3/:criteriaCode
 * @description Get all responses for a specific criteria code
 * @access Public
 */
const getResponsesByCriteriaCode533 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await db.response_5_3_3.findAll({
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