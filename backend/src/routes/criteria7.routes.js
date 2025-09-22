import express from 'express';
const router = express.Router();
import { 
  createResponse712,
  createResponse714,
  createResponse715,
  createResponse716,
  createResponse717,
  createResponse7110,
  getResponsesByCriteriaCode,
  score712,
  score714,
  score715,
  score716,
  score717,
  score7110,
  deleteResponse712,
  deleteResponse714,
  deleteResponse715,
  deleteResponse716,
  deleteResponse717,
  deleteResponse7110
} from '../controllers/criteria7.controller.js';


router.route('/createResponse712')
    .post(createResponse712);

router.route('/createResponse714')
    .post(createResponse714);

router.route('/createResponse715')
    .post(createResponse715);


router.route('/createResponse716')
    .post(createResponse716);

router.route('/createResponse717')
    .post(createResponse717);

router.route('/createResponse7110')
    .post(createResponse7110);

router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

router.route('/score712')
    .get(score712);

router.route('/score714')
    .get(score714);
    
router.route('/score715')
    .get(score715);
    
router.route('/score716')
    .get(score716); 

router.route('/score717')
    .get(score717);

router.route('/score7110')
    .get(score7110);

router.route('/deleteResponse712/:sl_no')
    .delete(deleteResponse712);

router.route('/deleteResponse714/:sl_no')
    .delete(deleteResponse714);
    
router.route('/deleteResponse715/:sl_no')
    .delete(deleteResponse715);
    
router.route('/deleteResponse716/:sl_no')
    .delete(deleteResponse716);
    
router.route('/deleteResponse717/:sl_no')
    .delete(deleteResponse717);
    
router.route('/deleteResponse7110/:sl_no')
    .delete(deleteResponse7110);    

export default router;

