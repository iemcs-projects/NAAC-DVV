import express from 'express';
const router = express.Router();
import { createResponse211, updateResponse211, deleteResponse211, score211,createResponse212, updateResponse212, deleteResponse212, score212, createResponse263, updateResponse263, deleteResponse263, score263, createResponse233, updateResponse233, deleteResponse233, createResponse222_241_243, updateResponse222_241_243, deleteResponse222_241_243, createResponse242, updateResponse242, deleteResponse242, score222, score242, score243, score241, score233,score271,createResponse271, getResponsesByCriteriaCode } from '../controllers/criteria2.controller.js';
import verifyToken from '../middlewares/auth.middlewares.js';

router.route('/createResponse211')
    .post(verifyToken, createResponse211);

router.route('/updateResponse211/:sl_no')
    .put(verifyToken, updateResponse211);

router.route('/deleteResponse211/:sl_no')
    .delete(verifyToken, deleteResponse211);

router.route('/score211')
    .get(verifyToken, score211);

router.route('/createResponse212')
    .post(verifyToken, createResponse212);

router.route('/updateResponse212/:sl_no')
    .put(verifyToken, updateResponse212);

router.route('/deleteResponse212/:sl_no')
    .delete(verifyToken, deleteResponse212);

router.route('/score212')
    .get(verifyToken, score212);

router.route('/createResponse222_241_243')
    .post(verifyToken, createResponse222_241_243);

router.route('/updateResponse222_241_243/:sl_no')
    .put(verifyToken, updateResponse222_241_243);

router.route('/deleteResponse222_241_243/:sl_no')
    .delete(verifyToken, deleteResponse222_241_243);
    
router.route('/score233')
    .get(verifyToken, score233);

router.route('/createResponse233')
    .post(verifyToken, createResponse233);

router.route('/updateResponse233/:sl_no')
    .put(verifyToken, updateResponse233);

router.route('/deleteResponse233/:sl_no')
    .delete(verifyToken, deleteResponse233);

router.route('/score263')
    .get(verifyToken, score263);

router.route('/createResponse263')
    .post(verifyToken, createResponse263);

router.route('/updateResponse263/:sl_no')
    .put(verifyToken, updateResponse263);

router.route('/deleteResponse263/:sl_no')
    .delete(verifyToken, deleteResponse263);

router.route('/createResponse242')
    .post(verifyToken, createResponse242);

router.route('/updateResponse242/:sl_no')
    .put(verifyToken, updateResponse242);

router.route('/deleteResponse242/:sl_no')
    .delete(verifyToken, deleteResponse242);

router.route('/createResponse271')
    .post(verifyToken, createResponse271);

router.route('/score222')
    .get(verifyToken, score222);


router.route('/score242')
    .get(verifyToken, score242);

router.route('/score243')
    .get(verifyToken, score243);

router.route('/score241')
    .get(verifyToken, score241);

router.route('/score271')
    .get(verifyToken, score271);

router.route('/getResponse/:criteriaCode')
    .get(verifyToken, getResponsesByCriteriaCode);
// router.route('/score233')
//     .get(score233);

// router.route('/createResponse241243222233')
//     .post(createResponse241243222233);


// router.route('/createResponse242')
//     .post(createResponse242);


// router.route('/createResponse263')
//     .post(createResponse263);

// router.route('/createResponse271')
//     .post(createResponse271);

// router.route('/getResponsesByCriteriaCode/:criteriaCode')
//     .get(getResponsesByCriteriaCode);

export default router;