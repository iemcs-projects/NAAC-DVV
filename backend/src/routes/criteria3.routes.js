import express from 'express';
const router = express.Router();
import { createResponse311_312,updateResponse311_312,deleteResponse311_312,createResponse313,updateResponse313,deleteResponse313,createResponse334,updateResponse334,deleteResponse334, score311, score312, score334, score313, createResponse321,updateResponse321,deleteResponse321, createResponse322, updateResponse322, deleteResponse322, createResponse332,updateResponse332,deleteResponse332,createResponse333, updateResponse333, deleteResponse333, createResponse341, updateResponse341, deleteResponse341, createResponse342, updateResponse342, deleteResponse342, getResponsesByCriteriaCode, score321, score322, score332, score333, score341, score342 } from '../controllers/criteria3.controller.js';



router.route('/createResponse311_312')
    .post(createResponse311_312);

router.route('/updateResponse311_312/:sl_no')
    .put(updateResponse311_312);

router.route('/deleteResponse311_312/:sl_no')
    .delete(deleteResponse311_312);

router.route('/createResponse313')
    .post(createResponse313);

router.route('/updateResponse313/:sl_no')
    .put(updateResponse313);

router.route('/deleteResponse313/:sl_no')
    .delete(deleteResponse313);

router.route('/createResponse321')
    .post(createResponse321);

router.route('/updateResponse321/:sl_no')
    .put(updateResponse321);

router.route('/deleteResponse321/:sl_no')
    .delete(deleteResponse321);

router.route('/createResponse322')
    .post(createResponse322);

router.route('/updateResponse322/:sl_no')
    .put(updateResponse322);

router.route('/deleteResponse322/:sl_no')
    .delete(deleteResponse322);

router.route('/createResponse332')
    .post(createResponse332);

router.route('/updateResponse332/:sl_no')
    .put(updateResponse332);

router.route('/deleteResponse332/:sl_no')
    .delete(deleteResponse332);

router.route('/createResponse333')
    .post(createResponse333);

router.route('/updateResponse333/:sl_no')
    .put(updateResponse333);

router.route('/deleteResponse333/:sl_no')
    .delete(deleteResponse333);

router.route('/createResponse334')
    .post(createResponse334);

router.route('/updateResponse334/:sl_no')
    .put(updateResponse334);

router.route('/deleteResponse334/:sl_no')
    .delete(deleteResponse334);

router.route('/createResponse341')
    .post(createResponse341);

router.route('/updateResponse341/:sl_no')
    .put(updateResponse341);

router.route('/deleteResponse341/:sl_no')
    .delete(deleteResponse341);

router.route('/createResponse342')
    .post(createResponse342);

router.route('/updateResponse342/:sl_no')
    .put(updateResponse342);

router.route('/deleteResponse342/:sl_no')
    .delete(deleteResponse342);

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

