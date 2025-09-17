import express from 'express';
const router = express.Router();    
import {  createResponse511_512,updateResponse511_512,deleteResponse511_512, 
    createResponse513, updateResponse513,deleteResponse513, createResponse514,
     updateResponse514,deleteResponse514,createResponse515,updateResponse515,
     deleteResponse515, createResponse521, updateResponse521,deleteResponse521,
     createResponse522,updateResponse522,deleteResponse522,createResponse523, updateResponse523,deleteResponse523, 
      createResponse531, updateResponse531,deleteResponse531,createResponse533,
       updateResponse533, deleteResponse533, createResponse542, updateResponse542,
       deleteResponse542,score511, score512, score513, score514,score515, score521,
        score522, score523, score531, score533, score542, getResponsesByCriteriaCode } from '../controllers/criteria5.controller.js';



router.route('/createResponse511_512')
    .post(createResponse511_512);

router.route('/updateResponse511_512/:sl_no')
    .put(updateResponse511_512);

router.route('/deleteResponse511_512/:sl_no')
    .delete(deleteResponse511_512);

router.route('/createResponse513')
    .post(createResponse513);

router.route('/updateResponse513/:sl_no')
    .put(updateResponse513);

router.route('/deleteResponse513/:sl_no')
    .delete(deleteResponse513);



router.route('/createResponse514')
    .post(createResponse514);

router.route('/updateResponse514/:sl_no')
    .put(updateResponse514);

router.route('/deleteResponse514/:sl_no')
    .delete(deleteResponse514);

router.route('/createResponse515')
    .post(createResponse515);

router.route('/updateResponse515/:sl_no')
    .put(updateResponse515);

router.route('/deleteResponse515/:sl_no')
    .delete(deleteResponse515);

router.route('/createResponse521')
    .post(createResponse521);

router.route('/updateResponse521/:sl_no')
    .put(updateResponse521);

router.route('/deleteResponse521/:sl_no')
    .delete(deleteResponse521);

router.route('/createResponse522')
    .post(createResponse522);

router.route('/updateResponse522/:sl_no')
    .put(updateResponse522);

router.route('/deleteResponse522/:sl_no')
    .delete(deleteResponse522);



router.route('/createResponse523')
    .post(createResponse523);

router.route('/updateResponse523/:sl_no')
    .put(updateResponse523);

router.route('/deleteResponse523/:sl_no')
    .delete(deleteResponse523);


router.route('/createResponse531')
    .post(createResponse531);

router.route('/updateResponse531/:sl_no')
    .put(updateResponse531);

router.route('/deleteResponse531/:sl_no')
    .delete(deleteResponse531);

router.route('/createResponse533')
    .post(createResponse533);

router.route('/updateResponse533/:sl_no')
    .put(updateResponse533);

router.route('/deleteResponse533/:sl_no')
    .delete(deleteResponse533);

router.route('/createResponse542')
    .post(createResponse542);

router.route('/updateResponse542/:sl_no')
    .put(updateResponse542);

router.route('/deleteResponse542/:sl_no')
    .delete(deleteResponse542);

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
