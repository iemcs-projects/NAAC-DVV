import express from 'express';
const router = express.Router();
import {  createResponse511_512, createResponse513, createResponse514,createResponse521, createResponse522,createResponse523, createResponse531, createResponse533, getResponsesByCriteriaCode } from '../controllers/criteria5.controller.js';



router.route('/createResponse511_512')
    .post(createResponse511_512);

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

router.route('/createResponse533')
    .post(createResponse533);

router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

export default router;
    
