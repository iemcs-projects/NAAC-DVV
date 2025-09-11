import express from 'express';
const router = express.Router();
import { 
  createResponse113,
  updateResponse113,
  deleteResponse113,
  createResponse121, 
  updateResponse121,
  deleteResponse121,
  createResponse122_123,
  updateResponse122_123,
  deleteResponse122_123,
  createResponse132, 
  updateResponse132,
  deleteResponse132, 
  createResponse133, 
  updateResponse133,
  deleteResponse133, 
  createResponse141,
  updateResponse141,
  deleteResponse141,
  createResponse142,
  updateResponse142,
  deleteResponse142,
  getResponsesByCriteriaCode,
  score113,
  score121,
  score122,
  score123,
  score132,
  score133,
  score141,
  score142 
} from '../controllers/criteria1.controller.js';


router.route('/createResponse113')
    .post(createResponse113);

router.route('/updateResponse113/:sl_no')
    .put(updateResponse113);

router.route('/deleteResponse113/:sl_no')
    .delete(deleteResponse113);

router.route('/createResponse121')
    .post(createResponse121);

router.route('/updateResponse121/:sl_no')
    .put(updateResponse121);

router.route('/deleteResponse121/:sl_no')
    .delete(deleteResponse121);

router.route('/createResponse122_123')
    .post(createResponse122_123);

router.route('/updateResponse122_123/:sl_no')
    .put(updateResponse122_123);

router.route('/deleteResponse122_123/:sl_no')
    .delete(deleteResponse122_123);

router.route('/createResponse132')
    .post(createResponse132);

router.route('/updateResponse132/:sl_no')
    .put(updateResponse132);

router.route('/deleteResponse132/:sl_no')
    .delete(deleteResponse132);

router.route('/createResponse133')
    .post(createResponse133);

router.route('/updateResponse133/:sl_no')
    .put(updateResponse133);

router.route('/deleteResponse133/:sl_no')
    .delete(deleteResponse133);

router.route('/createResponse141')
    .post(createResponse141);

router.route('/updateResponse141/:sl_no')
    .put(updateResponse141);

router.route('/deleteResponse141/:sl_no')
    .delete(deleteResponse141);

router.route('/createResponse142')
    .post(createResponse142);

router.route('/updateResponse142/:sl_no')
    .put(updateResponse142);

router.route('/deleteResponse142/:sl_no')
    .delete(deleteResponse142);
    
router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

router.route('/score113')
    .get(score113);

router.route('/score121')
    .get(score121);
    
router.route('/score122')
    .get(score122);
    
router.route('/score123')
    .get(score123); 

router.route('/score132')
    .get(score132);

router.route('/score133')
    .get(score133);

router.route('/score141')
    .get(score141);

router.route('/score142')
    .get(score142);

export default router;

