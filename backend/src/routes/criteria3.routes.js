import express from 'express';
const router = express.Router();
import { createResponse311_312,createResponse313,createResponse334, score311, score312, score334, score313, createResponse321, createResponse322, createResponse332,createResponse333, createResponse341, createResponse342, getResponsesByCriteriaCode, score321, score322, score332, score333, score341, score342 } from '../controllers/criteria3.controller.js';



router.route('/createResponse311_312')
    .post(createResponse311_312);

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

router.route('/createResponse334')
    .post(createResponse334);

router.route('/createResponse341')
    .post(createResponse341);

router.route('/createResponse342')
    .post(createResponse342);

router.route('/getResponsesByCriteriaCode/:criteriaCode')
    .get(getResponsesByCriteriaCode);

router.route('/score313')
    .get(score313);

router.route('/score321')
    .get(score321);

router.route('/score322')
    .get(score322);

router.route('/score332')
    .get(score332);

router.route('/score333')
    .get(score333);

router.route('/score311')
    .get(score311);

router.route('/score312')
    .get(score312);

router.route('/score334')
    .get(score334);

router.route('/score341')
    .get(score341);

router.route('/score342')
    .get(score342);

export default router;

