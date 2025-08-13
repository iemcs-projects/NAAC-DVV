import express from 'express';
const router = express.Router();
import { 
  createResponse413, 
  createResponse414_441,
  createResponse422,
  createResponse423,
  createResponse424,
  createResponse432,
  createResponse433,
  score413,
  score414,
  score422,
  score423,
  score424,
  score432,
  score433,
  score441,
  getResponsesByCriteriaCode 
} from '../controllers/criteria4.controller.js';

// Response creation routes
router.route('/createResponse413')
  .post(createResponse413);

router.route('/createResponse414_441')
  .post(createResponse414_441);

router.route('/createResponse422')
  .post(createResponse422);

router.route('/createResponse423')
  .post(createResponse423);

router.route('/createResponse424')
  .post(createResponse424);

router.route('/createResponse432')
  .post(createResponse432);

router.route('/createResponse433')
  .post(createResponse433);

// Score calculation routes
router.route('/score413')
  .get(score413);

router.route('/score414')
  .get(score414);

router.route('/score422')
  .get(score422);

router.route('/score423')
  .get(score423);

router.route('/score424')
  .get(score424);

router.route('/score432')
  .get(score432);

router.route('/score433')
  .get(score433);

router.route('/score441')
  .get(score441);

// General purpose route
router.route('/getResponsesByCriteriaCode/:criteriaCode')
  .get(getResponsesByCriteriaCode);

export default router;
