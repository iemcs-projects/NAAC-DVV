import express from 'express';
const router = express.Router();
import { getAllCriteria6, createResponse623,updateResponse623,deleteResponse623,createResponse632, updateResponse632, deleteResponse632, createResponse633, updateResponse633, deleteResponse633, createResponse634,updateResponse634,deleteResponse634,createResponse642, updateResponse642, deleteResponse642, createResponse653, updateResponse653, deleteResponse653, getResponsesByCriteriaCode,score623,score632,score633,score634,score642,score653 } from '../controllers/criteria6.controller.js';

router.route('/getAllCriteria6').get(getAllCriteria6);

router.route('/createResponse623')
    .post(createResponse623);

router.route('/updateResponse623/:sl_no')
    .put(updateResponse623);

router.route('/deleteResponse623/:sl_no')
    .delete(deleteResponse623);

router.route('/createResponse632')
    .post(createResponse632);

router.route('/updateResponse632/:sl_no')
    .put(updateResponse632);

router.route('/deleteResponse632/:sl_no')
    .delete(deleteResponse632);

router.route('/createResponse633')
    .post(createResponse633);

router.route('/updateResponse633/:sl_no')
    .put(updateResponse633);

router.route('/deleteResponse633/:sl_no')
    .delete(deleteResponse633);

router.route('/createResponse634')
    .post(createResponse634);

router.route('/updateResponse634/:sl_no')
    .put(updateResponse634);

router.route('/deleteResponse634/:sl_no')
    .delete(deleteResponse634);

router.route('/createResponse642')
    .post(createResponse642);

router.route('/updateResponse642/:sl_no')
    .put(updateResponse642);

router.route('/deleteResponse642/:sl_no')
    .delete(deleteResponse642);

router.route('/createResponse653')
    .post(createResponse653);

router.route('/updateResponse653/:sl_no')
    .put(updateResponse653);

router.route('/deleteResponse653/:sl_no')
    .delete(deleteResponse653);

router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

    router.route('/score623')
    .get(score623);

    router.route('/score632')
    .get(score632);

    router.route('/score633')
    .get(score633);

    router.route('/score634')
    .get(score634);

    router.route('/score642')
    .get(score642);

    router.route('/score653')
    .get(score653);

export default router;

