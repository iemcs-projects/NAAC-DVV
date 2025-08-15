import express from 'express';
const router = express.Router();
import {  createResponse511_512, createResponse513, createResponse514,createResponse515,createResponse521, createResponse522,createResponse523, createResponse531, createResponse533, createResponse542, score511, score512, score513, score514,score515, score521, score522, score523, score531, score533, score542, getResponsesByCriteriaCode } from '../controllers/criteria5.controller.js';



router.route('/createResponse511_512')
    .post(createResponse511_512);

router.route('/createResponse513')
    .post(createResponse513);

router.route('/createResponse514')
    .post(createResponse514);

router.route('/createResponse515')
    .post(createResponse515);

router.route('/createResponse521')
    .post(createResponse521);

router.route('/createResponse522')
    .post(createResponse522);

router.route('/createResponse523')
    .post(createResponse523);

router.route('/createResponse531')
    .post(createResponse531);

router.route('/createResponse533')
    .post(createResponse533);

router.route('/createResponse542')
    .post(createResponse542);
    
router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

router.route('/score511')
    .get(score511);

router.route('/score512')
    .get(score512);

router.route('/score513')
    .get(score513);

router.route('/score514')
    .get(score514);

router.route('/score515')
    .get(score515);

router.route('/score521')
    .get(score521);

router.route('/score522')
    .get(score522);

router.route('/score523')
    .get(score523);

router.route('/score531')
    .get(score531);

router.route('/score533')
    .get(score533);

router.route('/score542')
    .get(score542);    



export default router;
