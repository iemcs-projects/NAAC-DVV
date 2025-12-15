import express from 'express';
const router = express.Router();
import { 
    createResponse311_312, updateResponse311_312, deleteResponse311_312,
    createResponse313, updateResponse313, deleteResponse313,
    createResponse334, updateResponse334, deleteResponse334, 
    score311, score312, score334, score313, 
    createResponse321, updateResponse321, deleteResponse321, 
    createResponse322, updateResponse322, deleteResponse322, 
    createResponse332, updateResponse332, deleteResponse332, 
    createResponse333, updateResponse333, deleteResponse333, 
    createResponse341, updateResponse341, deleteResponse341, 
    createResponse342, updateResponse342, deleteResponse342, 
    getResponsesByCriteriaCode, 
    score321, score322, score332, score333, score341, score342 
} from '../controllers/criteria3.controller.js';

// IMPORT THE SECURITY GUARD
import verifyToken from '../middlewares/auth.middlewares.js'; 

// Criteria 3.1.1 & 3.1.2 Routes
router.route('/createResponse311_312')
    .post(verifyToken, createResponse311_312);

router.route('/updateResponse311_312/:sl_no')
    .put(verifyToken, updateResponse311_312);

router.route('/deleteResponse311_312/:sl_no')
    .delete(verifyToken, deleteResponse311_312);

// Criteria 3.1.3 Routes
router.route('/createResponse313')
    .post(verifyToken, createResponse313);

router.route('/updateResponse313/:sl_no')
    .put(verifyToken, updateResponse313);

router.route('/deleteResponse313/:sl_no')
    .delete(verifyToken, deleteResponse313);

// Criteria 3.2.1 Routes
router.route('/createResponse321')
    .post(verifyToken, createResponse321);

router.route('/updateResponse321/:sl_no')
    .put(verifyToken, updateResponse321);

router.route('/deleteResponse321/:sl_no')
    .delete(verifyToken, deleteResponse321);

// Criteria 3.2.2 Routes
router.route('/createResponse322')
    .post(verifyToken, createResponse322);

router.route('/updateResponse322/:sl_no')
    .put(verifyToken, updateResponse322);

router.route('/deleteResponse322/:sl_no')
    .delete(verifyToken, deleteResponse322);

// Criteria 3.3.2 Routes
router.route('/createResponse332')
    .post(verifyToken, createResponse332);

router.route('/updateResponse332/:sl_no')
    .put(verifyToken, updateResponse332);

router.route('/deleteResponse332/:sl_no')
    .delete(verifyToken, deleteResponse332);

// Criteria 3.3.3 Routes
router.route('/createResponse333')
    .post(verifyToken, createResponse333);

router.route('/updateResponse333/:sl_no')
    .put(verifyToken, updateResponse333);

router.route('/deleteResponse333/:sl_no')
    .delete(verifyToken, deleteResponse333);

// Criteria 3.3.4 Routes
router.route('/createResponse334')
    .post(verifyToken, createResponse334);

router.route('/updateResponse334/:sl_no')
    .put(verifyToken, updateResponse334);

router.route('/deleteResponse334/:sl_no')
    .delete(verifyToken, deleteResponse334);

// Criteria 3.4.1 Routes
router.route('/createResponse341')
    .post(verifyToken, createResponse341);

router.route('/updateResponse341/:sl_no')
    .put(verifyToken, updateResponse341);

router.route('/deleteResponse341/:sl_no')
    .delete(verifyToken, deleteResponse341);

// Criteria 3.4.2 Routes
router.route('/createResponse342')
    .post(verifyToken, createResponse342);

router.route('/updateResponse342/:sl_no')
    .put(verifyToken, updateResponse342);

router.route('/deleteResponse342/:sl_no')
    .delete(verifyToken, deleteResponse342);

// Dynamic Fetch Route
router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(verifyToken, getResponsesByCriteriaCode);

// Scoring Routes (Protected)
router.route('/score313').get(verifyToken, score313);
router.route('/score321').get(verifyToken, score321);
router.route('/score322').get(verifyToken, score322);
router.route('/score332').get(verifyToken, score332);
router.route('/score333').get(verifyToken, score333);
router.route('/score311').get(verifyToken, score311);
router.route('/score312').get(verifyToken, score312);
router.route('/score334').get(verifyToken, score334);
router.route('/score341').get(verifyToken, score341);
router.route('/score342').get(verifyToken, score342);

export default router;