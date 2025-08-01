import express from 'express';
const router = express.Router();
import { getAllCriteria6, createResponse623,createResponse632, createResponse633, createResponse634,createResponse642, createResponse653, getResponsesByCriteriaCode,score623,score632,score633,score634,score642,score653 } from '../controllers/criteria6.controller.js';

router.route('/getAllCriteria6').get(getAllCriteria6);

router.route('/createResponse623')
    .post(createResponse623);

router.route('/createResponse632')
    .post(createResponse632);

router.route('/createResponse633')
    .post(createResponse633);

router.route('/createResponse634')
    .post(createResponse634);

router.route('/createResponse642')
    .post(createResponse642);

router.route('/createResponse653')
    .post(createResponse653);

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

