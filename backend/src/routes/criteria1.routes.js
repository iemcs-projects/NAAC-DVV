import express from 'express';
const router = express.Router();
import { checkAccess, checkDynamicCriteriaAccess } from '../middlewares/rbacMiddlewares.js';
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

// Criteria 1.1.3 routes - Faculty only
router.route('/createResponse113')
    .post(checkAccess('createResponse113'), createResponse113);

router.route('/updateResponse113/:sl_no')
    .put(checkAccess('updateResponse113'), updateResponse113);

router.route('/deleteResponse113/:sl_no')
    .delete(checkAccess('deleteResponse113'), deleteResponse113);

router.route('/score113')
    .get(checkAccess('score113'), score113);

// Criteria 1.2.1 routes - Faculty only
router.route('/createResponse121')
    .post(checkAccess('createResponse121'), createResponse121);

router.route('/updateResponse121/:sl_no')
    .put(checkAccess('updateResponse121'), updateResponse121);

router.route('/deleteResponse121/:sl_no')
    .delete(checkAccess('deleteResponse121'), deleteResponse121);

router.route('/score121')
    .get(checkAccess('score121'), score121);

// Criteria 1.2.2 & 1.2.3 routes - Faculty only (shared controllers)
router.route('/createResponse122_123')
    .post(checkAccess('createResponse122_123'), createResponse122_123);

router.route('/updateResponse122_123/:sl_no')
    .put(checkAccess('updateResponse122_123'), updateResponse122_123);

router.route('/deleteResponse122_123/:sl_no')
    .delete(checkAccess('deleteResponse122_123'), deleteResponse122_123);

router.route('/score122')
    .get(checkAccess('score122'), score122);
    
router.route('/score123')
    .get(checkAccess('score123'), score123);

// Criteria 1.3.2 routes - Faculty only
router.route('/createResponse132')
    .post(checkAccess('createResponse132'), createResponse132);

router.route('/updateResponse132/:sl_no')
    .put(checkAccess('updateResponse132'), updateResponse132);

router.route('/deleteResponse132/:sl_no')
    .delete(checkAccess('deleteResponse132'), deleteResponse132);

router.route('/score132')
    .get(checkAccess('score132'), score132);

// Criteria 1.3.3 routes - Faculty only
router.route('/createResponse133')
    .post(checkAccess('createResponse133'), createResponse133);

router.route('/updateResponse133/:sl_no')
    .put(checkAccess('updateResponse133'), updateResponse133);

router.route('/deleteResponse133/:sl_no')
    .delete(checkAccess('deleteResponse133'), deleteResponse133);

router.route('/score133')
    .get(checkAccess('score133'), score133);

// Criteria 1.4.1 routes - Faculty only
router.route('/createResponse141')
    .post(checkAccess('createResponse141'), createResponse141);

router.route('/updateResponse141/:sl_no')
    .put(checkAccess('updateResponse141'), updateResponse141);

router.route('/deleteResponse141/:sl_no')
    .delete(checkAccess('deleteResponse141'), deleteResponse141);

router.route('/score141')
    .get(checkAccess('score141'), score141);

// Criteria 1.4.2 routes - College Admin only
router.route('/createResponse142')
    .post(checkAccess('createResponse142'), createResponse142);

router.route('/updateResponse142/:sl_no')
    .put(checkAccess('updateResponse142'), updateResponse142);

router.route('/deleteResponse142/:sl_no')
    .delete(checkAccess('deleteResponse142'), deleteResponse142);

router.route('/score142')
    .get(checkAccess('score142'), score142);

// Dynamic criteria route - checks if user has access to the specific criteria
router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(checkDynamicCriteriaAccess, getResponsesByCriteriaCode);

export default router;