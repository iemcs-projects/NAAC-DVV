import express from 'express';
const router = express.Router();
import { getAllCriteria3, createResponse313,createResponse321, createResponse322, createResponse332,createResponse333, createResponse341, createResponse342, getResponsesByCriteriaCode } from '../controllers/criteria3.controller.js';

router.route('/getAllCriteria3').get(getAllCriteria3);

router.route('/createResponse313')
    .post(createResponse313);

router.route('/createResponse321')
    .post(createResponse321);

router.route('/createResponse322')
    .post(createResponse322);

router.route('/createResponse332')
    .post(createResponse332);

router.route('/createResponse333')
    .post(createResponse333);

router.route('/createResponse341')
    .post(createResponse341);

router.route('/createResponse342')
    .post(createResponse342);

router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

export default router;

