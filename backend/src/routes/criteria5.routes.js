import express from 'express';
const router = express.Router();
import { getAllCriteria5, createResponse511512, createResponse513, createResponse514,createResponse521, createResponse522, createResponse523, createResponse531, createResponse532, createResponse533, createResponse531, createResponse533, getResponsesByCriteriaCode } from '../controllers/criteria5.controller.js';

router.route('/getAllCriteria5').get(getAllCriteria5);

router.route('/createResponse511512')
    .post(createResponse511512);

router.route('/createResponse513')
    .post(createResponse513);

router.route('/createResponse514')
    .post(createResponse514);

router.route('/createResponse521')
    .post(createResponse521);

router.route('/createResponse522')
    .post(createResponse522);

router.route('/createResponse523')
    .post(createResponse523);

router.route('/createResponse531')
    .post(createResponse531);

router.route('/createResponse532')
    .post(createResponse532);

router.route('/createResponse533')
    .post(createResponse533);

router.route('/createResponse531')
    .post(createResponse531);

router.route('/createResponse533')
    .post(createResponse533);

router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

export default router;
    
