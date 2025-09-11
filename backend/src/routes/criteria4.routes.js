import express from 'express';
const router = express.Router();
import { 
  createResponse413, 
  updateResponse413,
  deleteResponse413,
  createResponse414_441,
  updateResponse414_441,
  deleteResponse414_441,
  createResponse422,
  updateResponse422,
  deleteResponse422,
  createResponse423,
  updateResponse423,
  deleteResponse423,
  createResponse424,
  updateResponse424,
  deleteResponse424,
  createResponse432,
  updateResponse432,
  deleteResponse432,
  createResponse433,
  updateResponse433,
  deleteResponse433,
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

router.route('/updateResponse413/:sl_no')
  .put(updateResponse413);

router.route('/deleteResponse413/:sl_no')
  .delete(deleteResponse413);

router.route('/createResponse414_441')
  .post(createResponse414_441);

router.route('/updateResponse414_441/:sl_no')
  .put(updateResponse414_441);

router.route('/deleteResponse414_441/:sl_no')
  .delete(deleteResponse414_441);

router.route('/createResponse422')
  .post(createResponse422);

router.route('/updateResponse422/:sl_no')
  .put(updateResponse422);

router.route('/deleteResponse422/:sl_no')
  .delete(deleteResponse422);

router.route('/createResponse423')
  .post(createResponse423);

router.route('/updateResponse423/:sl_no')
  .put(updateResponse423);

router.route('/deleteResponse423/:sl_no')
  .delete(deleteResponse423);

router.route('/createResponse424')
  .post(createResponse424);

router.route('/updateResponse424/:sl_no')
  .put(updateResponse424);

router.route('/deleteResponse424/:sl_no')
  .delete(deleteResponse424);

router.route('/createResponse432')
  .post(createResponse432);

router.route('/updateResponse432/:sl_no')
  .put(updateResponse432);

router.route('/deleteResponse432/:sl_no')
  .delete(deleteResponse432);

router.route('/createResponse433')
  .post(createResponse433);

router.route('/updateResponse433/:sl_no')
  .put(updateResponse433);

router.route('/deleteResponse433/:sl_no')
  .delete(deleteResponse433);

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
