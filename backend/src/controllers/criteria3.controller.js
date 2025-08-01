import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

const Criteria313 = db.response_3_1_3_data;
const Criteria321 = db.response_3_2_1;
const Criteria322 = db.response_3_2_2;
const Criteria332 = db.response_3_3_2;
const Criteria333 = db.response_3_3_3;
const Criteria341 = db.response_3_4_1;
const Criteria342 = db.response_3_4_2;
const CriteraMaster=db.criteria_master;

const getAllCriteria313 = asyncHandler(async (req, res) => {
    const criteria = await Criteria313.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});


console.log(CriteriaMaster)
const criteria = await CriteriaMaster.findOne({
    where: {
      sub_sub_criterion_id: '030103',
      sub_criterion_id: '0301',
      criterion_id: '03'
    }
  });

  if (!criteria) {
    throw new apiError(404, "Criteria not found");
  }

  const { session, workshop_name, participants, date_from, date_to } = req.body;
  if (!session || !workshop_name || !participants || !date_from || !date_to) {
    throw new apiError(400, "Missing required fields");
  }

  if (session < 1990 || session > new Date().getFullYear()) {
    throw new apiError(400, "Year must be between 1990 and current year");
  }

  // Create proper Date objects for session
  const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
  console.log(criteria.criteria_code)
  // Insert into response_3_1_3_data
  const entry = await Criteria313.create({
    id: criteria.id,
    criteria_code: criteria.criteria_code,
    session: sessionDate,  // Store as Date object
    workshop_name,
    participants,
    date_from,
    date_to
  });

  res.status(201).json(
    new apiResponse(201, entry, "Response created successfully")
  );

  const getResponsesByCriteriaCode313 = async (req, res, next) => {
    try {
        const { criteriaCode } = req.params;
        
        const responses = await Criteria313.findAll({
            where: { criteria_code: criteriaCode },
            include: [{
                model: db.criteria_master,
                as: 'criteria',
                attributes: ['criterion_id', 'sub_criterion_id', 'sub_sub_criterion_id']
            }],
            order: [['submitted_at', 'DESC']]
        });

        return res.status(200).json(
            new apiResponse(200, responses, "Responses found")
        );
    } catch (error) {
        next(error);
    }
};

export { getAllCriteria313,
    CreateResponse321,
    getResponsesByCriteriaCode313
 };

 //3.2.1

 /**
  * @route GET /api/response/3.2.1
  * @description Get all responses for criteria 3.2.1
  * @access Public
  */

 const getAllCriteria321 = asyncHandler(async (req, res) => {
    const criteria = await Criteria321.findAll();
    if (!criteria) {
        throw new apiError(404, "Criteria not found");
    }
    
    res.status(200).json(
        new apiResponse(200, criteria, "Criteria found")
    );
});

const CreateResponse321=asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */
        // Fetch 1.2.1 criterion from criteria_master
        console.log(CriteriaMaster)
        const criteria = await CriteriaMaster.findOne({
            where: {
              sub_sub_criterion_id: '030201',
              sub_criterion_id: '0302',
              criterion_id: '03'
            }
          });

          if (!criteria) {
            throw new apiError(404, "Criteria not found");
          }

          const { session, paper_title, author_names, department, journal_name, year_of_publication, issn_number, indexation_status } = req.body;
          if (!session || !paper_title || !author_names || !department || !journal_name || !year_of_publication || !issn_number || !indexation_status) {
            throw new apiError(400, "Missing required fields");
          }

          if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          if (year_of_publication < 1990 || year_of_publication > new Date().getFullYear()) {
            throw new apiError(400, "Year of publication must be between 1990 and current year");
          }

          // Create proper Date objects for session
          const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code)
          // Insert into response_3_2_1_data
          const entry = await Criteria321.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,  // Store as Date object
            paper_title,
            author_names,
            department,
            journal_name,
            year_of_publication,
            issn_number,
            indexation_status
          });

          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );

          const getResponsesByCriteriaCode321 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_3_2_1.findAll({
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

        export { getAllCriteria321,
            createResponse321,
            getResponsesByCriteriaCode321
         };

//3.2.2
         /**
          * @route GET /api/response/3.2.2
          * @description Get all responses for criteria 3.2.2
          * @access Public
          */

         const GetAllCriteria322 = asyncHandler(async (req, res) => {
            const criteria = await Criteria322.findAll();
            if (!criteria) {
                throw new apiError(404, "Criteria not found");
            }
            
            res.status(200).json(
                new apiResponse(200, criteria, "Criteria found")
            );
        });

const createResponse322 = asyncHandler(async (req, res) => {
    /*
    1. get the user input from the req body
    2. query the criteria_master table to get the id and criteria_code 
    3. validate the user input
    4. create a new response
    5. return the response
    */
        // Fetch 3.2.2 criterion from criteria_master
        console.log(CriteriaMaster)
        const criteria = await CriteraMaster.findOne({
            where: {
              sub_sub_criterion_id: '030202',
              sub_criterion_id: '0302',
              criterion_id: '03'
            }
          });
      
          if (!criteria) {
            throw new apiError(404, "Criteria not found");
          }

          const {
            session,
            teacher_name,
            book_chapter_title,
            paper_title,
            conference_title,
            year_of_publication,
            isbn_issn_number,
            institution_affiliated,
            publisher_name
          } = req.body;

          if (
            !session ||
            !teacher_name ||
            !book_chapter_title ||
            !paper_title ||
            !conference_title ||
            !year_of_publication ||
            !isbn_issn_number ||
            !institution_affiliated ||
            !publisher_name
          ) {
            throw new apiError(400, "Missing required fields");
          }

          if (session < 1990 || session > new Date().getFullYear()) {
            throw new apiError(400, "Year must be between 1990 and current year");
          }

          if (year_of_publication < 1990 || year_of_publication > new Date().getFullYear()) {
            throw new apiError(400, "Year of publication must be between 1990 and current year");
          }

          // Create proper Date objects for session
          const sessionDate = new Date(session, 0, 1); // Jan 1st of the given year
          console.log(criteria.criteria_code);
          // Insert into response_3_2_2_data
          const entry = await Criteria322.create({
            id: criteria.id,
            criteria_code: criteria.criteria_code,
            session: sessionDate,  // Store as Date object
            teacher_name,
            book_chapter_title,
            paper_title,
            conference_title,
            year_of_publication,
            isbn_issn_number,
            institution_affiliated,
            publisher_name
          });

          res.status(201).json(
            new apiResponse(201, entry, "Response created successfully")
          );
          
          const getResponsesByCriteriaCode322 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_3_2_2.findAll({
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
        
        export { getAllCriteria322,
            createResponse322,
            getResponsesByCriteriaCode322
         };

         //3.3.2

         const getAllCriteria332 = asyncHandler(async (req, res) => {
            const criteria = await Criteria332.findAll();
            if (!criteria) {
                throw new apiError(404, "Criteria not found");
            }
            
            res.status(200).json(
                new apiResponse(200, criteria, "Criteria found")
            );
        });

        /**
         * @route GET /api/response/3.3.2
         * @description Get all responses for criteria 3.3.2
         * @access Public
         */

        const createResponse332 = asyncHandler(async (req, res) => {
            
            /*
            1. get the user input from the req body
            2. query the criteria_master table to get the id and criteria_code 
            3. validate the user input
            4. create a new response
            5. return the response
            */
            
            //Fetch 3.3.2 criterion from criteria_master
            console.log(CriteriaMaster) 
            const criteria = await CriteriaMaster.findOne({
                where: {
                  sub_sub_criterion_id: '030302',
                  sub_criterion_id: '0303',
                  criterion_id: '03'
                }
              });
          
              if (!criteria) {
                throw new apiError(404, "Criteria not found");
              }
              
              const {session, activity_name, award_name, awarding_body, year_of_award } = req.body;
              if (!session || !activity_name || !award_name || !awarding_body || !year_of_award) {
                throw new apiError(400, "Missing required fields");
              }

              if (session < 1990 || session > new Date().getFullYear()) {
                throw new apiError(400, "Year must be between 1990 and current year");
              }

              if (year_of_award < 1990 || year_of_award > new Date().getFullYear()) {
                throw new apiError(400, "Year of award must be between 1990 and current year");
              }

              // Create proper Date objects for session
              const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
              console.log(criteria.criteria_code)
              // Insert into response_3_3_2_data
              const entry = await Criteria332.create({
                id: criteria.id,
                criteria_code: criteria.criteria_code,
                session: sessionDate,  // Store as Date object
                activity_name,
                award_name,
                awarding_body,
                year_of_award
              });

              res.status(201).json(
                new apiResponse(201, entry, "Response created successfully")
              );
        });
        /**
         * @route GET /api/response/3.3.2/:criteriaCode
         * @description Get all responses for a specific criteria code
         * @access Public
         */
        const getResponsesByCriteriaCode332 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_3_3_2.findAll({
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
        export { getAllCriteria332,
            createResponse332,
            getResponsesByCriteriaCode332
         };



         //3.3.3
         const getAllCriteria333 = asyncHandler(async (req, res) => {
            const criteria = await Criteria333.findAll();
            if (!criteria) {
                throw new apiError(404, "Criteria not found");
            }
            
            res.status(200).json(
                new apiResponse(200, criteria, "Criteria found")
            );
        });
        /**
         * @route GET /api/response/3.3.3
         * @description Get all responses for criteria 3.3.3
         * @access Public
         */

        const createResponse333 = asyncHandler(async (req, res) => {
           /*
           1. get the user input from the req body
           2. query the criteria_master table to get the id and criteria_code 
           3. validate the user input
           4. create a new response
           5. return the response
           */
              //Fetch 3.3.3 criterion from criteria_master
              console.log(CriteriaMaster)
              const Criteria = await CriteriaMaster.findOne({
                where: {
                  sub_sub_criterion_id: '030303',
                  sub_criterion_id: '0303',
                  criterion_id: '03'
                }
              });
          
              if (!Criteria) {
                throw new apiError(404, "Criteria not found");
              }
          
              // Validate required fields
              const {  session, activity_name, collaborating_agency, scheme_name, activity_type, student_count, year} = req.body;
              if (!session || !activity_name || !collaborating_agency || !scheme_name || !activity_type || !student_count || !year) {
                throw new apiError(400, "Missing required fields");
              }

              if (session < 1990 || session > new Date().getFullYear()) {
                throw new apiError(400, "Year must be between 1990 and current year");
              }

              if (year < 1990 || year > new Date().getFullYear()) {
                throw new apiError(400, "Year of introduction must be between 1990 and current year");
              }

              // Create proper Date objects for session
              const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
              console.log(criteria.criteria_code)
              // Insert into response_3_3_3_data
              const entry = await Criteria333.create({
                id: criteria.id,
                criteria_code: criteria.criteria_code,
                session: sessionDate,  // Store as Date object
                activity_name,
                collaborating_agency,
                scheme_name,
                activity_type,
                student_count,
                year
              });

              res.status(201).json(
                new apiResponse(201, entry, "Response created successfully")
              );

        });
        /**
         * @route GET /api/response/3.3.3/:criteriaCode
         * @description Get all responses for a specific criteria code
         * @access Public
         */
        const getResponsesByCriteriaCode333 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_3_3_3.findAll({
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
        export { getAllCriteria333,
            createResponse333,
            getResponsesByCriteriaCode333
         };

         // 3.4.1
         const getAllCriteria341 = asyncHandler(async (req, res) => {
            const criteria = await Criteria341.findAll();
            if (!criteria) {
                throw new apiError(404, "Criteria not found");
            }
            
            res.status(200).json(
                new apiResponse(200, criteria, "Criteria found")
            );
        });
        /**
         * @route POST /api/response/3.4.1
         * @description Create a new response for criteria 3.4.1
         * @access Private/Admin
         */
        const createResponse341 = asyncHandler(async (req, res) => {
            /*
            1. get the user input from the req body
            2. query the criteria_master table to get the id and criteria_code 
            3. validate the user input
            4. create a new response
            5. return the response
            */
               //Fetch 3.4.1 criterion from criteria_master
               console.log(CriteriaMaster)
               const criteria = await CriteriaMaster.findOne({
                   where: {
                     sub_sub_criterion_id: '030401',
                     sub_criterion_id: '0304',
                     criterion_id: '03'
                   }
                 });
             
                 if (!criteria) {
                   throw new apiError(404, "Criteria not found");
                 }
             
                 // Validate required fields
                 const {  session, title_of_activity, collaborating_agency, participant_name, year_of_collaboration, duration, document_link } = req.body;
                 if (!session || !title_of_activity || !collaborating_agency || !participant_name || !year_of_collaboration || !duration || !document_link) {
                   throw new apiError(400, "Missing required fields");
                 }
                if (session < 1990 || session > new Date().getFullYear()) {
                    throw new apiError(400, "Year must be between 1990 and current year");
                  }
                if (year_of_collaboration < 1990 || year_of_collaboration > new Date().getFullYear()) {
                    throw new apiError(400, "Year of collaboration must be between 1990 and current year");
                  } 
                 // Create proper Date objects for session
                 const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
                 console.log(criteria.criteria_code)
                 // Insert into response_3_4_1_data
                 const entry = await Criteria341.create({
                   id: criteria.id,
                   criteria_code: criteria.criteria_code,
                   session: sessionDate,  // Store as Date object
                title_of_activity,
                   collaborating_agency,
                   participant_name,
                   year_of_collaboration,
                   duration,
                   document_link
                 });
            
                 res.status(201).json(
                   new apiResponse(201, entry, "Response created successfully")
                 );
            
        });
        /**
         * @route GET /api/response/3.4.1/:criteriaCode
         * @description Get all responses for a specific criteria code
         * @access Public
         */
        const getResponsesByCriteriaCode341 = async (req, res, next) => {
            try {
                const { criteriaCode } = req.params;
                
                const responses = await db.response_3_4_1.findAll({
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
        
        export { getAllCriteria341,
            createResponse341,
            getResponsesByCriteriaCode341
         };

         //3.4.2
        const getAllCriteria342 = asyncHandler(async (req, res) => {
            const criteria = await Criteria342.findAll();
            if (!criteria) {
                throw new apiError(404, "Criteria not found");
            }
            
            res.status(200).json(
                new apiResponse(200, criteria, "Criteria found")
            );
        });

        /**
         * @route POST /api/response/3.4.2
         * @description Create a new response for criteria 3.4.2
         * @access Private/Admin
         */

        const createResponse342 = asyncHandler(async (req, res) => {
            /*
            1. get the user input from the req body
            2. query the criteria_master table to get the id and criteria_code 
            3. validate the user input
            4. create a new response
            5. return the response
            */
        })
            //Fetch 3.4.2 criterion from criteria_master
            console.log(CriteriaMaster)
            const criteria = await CriteriaMaster.findOne({
                where: {
                  sub_sub_criterion_id: '030402',
                  sub_criterion_id: '0304',
                  criterion_id: '03'
                }
              });
          
              if (!criteria) {
                throw new apiError(404, "Criteria not found");
              }
          
              // Validate required fields
              const { session, institution_name, year_of_mou, duration, activity_list} = req.body;
              if (!session || !institution_name || !year_of_mou || !duration || !activity_list) {
                throw new apiError(400, "Missing required fields");
              } 
              if (session < 1990 || session > new Date().getFullYear()) {
                throw new apiError(400, "Year must be between 1990 and current year");
              }
              if (year_of_mou < 1990 || year_of_mou > new Date().getFullYear()) {
                throw new apiError(400, "Year of MOU must be between 1990 and current year");
              }
              // Create proper Date objects for session
              const sessionDate = new Date(year, 0, 1); // Jan 1st of the given year
              console.log(criteria.criteria_code)
              // Insert into response_3_4_2_data
              const entry = await Criteria342.create({
                id: criteria.id,
                criteria_code: criteria.criteria_code,
                session: sessionDate,  // Store as Date object
                institution_name,
                year_of_mou,
                duration,
                activity_list
              });
          
              res.status(201).json(
                new apiResponse(201, entry, "Response created successfully")
              );
            
            });
            /**
             * @route GET /api/response/3.4.2/:criteriaCode
             * @description Get all responses for a specific criteria code
             * @access Public
             */
            const getResponsesByCriteriaCode342 = async (req, res, next) => {
                try {
                    const { criteriaCode } = req.params;
                    
                    const responses = await db.response_3_4_2.findAll({
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

            export { getAllCriteria342,
                createResponse342,
                getResponsesByCriteriaCode342
             };
                