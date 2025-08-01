import express from 'express';
const router = express.Router();
import { 
  createResponse113,
  createResponse121, 
  createResponse122_123,
  createResponse132, 
  createResponse133, 
  createResponse141,
  createResponse142,
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

router.route('/createResponse121')
    .post(createResponse121);

router.route('/createResponse122_123')
    .post(createResponse122_123);


router.route('/createResponse132')
    .post(createResponse132);

router.route('/createResponse133')
    .post(createResponse133);

router.route('/createResponse141')
    .post(createResponse141);

router.route('/createResponse142')
    .post(createResponse142);

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

