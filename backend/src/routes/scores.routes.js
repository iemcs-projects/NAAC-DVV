import express from 'express';
const router = express.Router();
import { score21, score22, score23, score24, score26, 
    score2, score11, score12, score13, score14, score1, 
    score6, score62, score63, score64, score65, 
    score31, score32, score33, score34, score3,
    score41, score42, score43, score44, score4,
    score51, score52, score53, score54, score5,
    score71, score7, scoreTotal, getCollegeSummary, radarGrade} from '../controllers/score.controller.js';
// Create a new score
router.route('/grade21')
    .post(score21);

router.route('/grade22')
    .post(score22);

router.route('/grade23')
    .post(score23);

router.route('/grade24')
    .post(score24);

router.route('/grade26')
    .post(score26);

router.route('/grade2')
    .post(score2);

router.route('/grade11')
    .post(score11);

router.route('/grade12')
    .post(score12);

router.route('/grade13')
    .post(score13);

router.route('/grade14')
    .post(score14);

router.route('/grade1')
    .post(score1);

router.route('/grade62')
    .post(score62);

router.route('/grade63')
    .post(score63);

router.route('/grade64')
    .post(score64);

router.route('/grade65')
    .post(score65);

router.route('/grade6')
    .post(score6);

router.route('/grade31')
    .post(score31);

router.route('/grade32')
    .post(score32);

router.route('/grade33')
    .post(score33);

router.route('/grade34')
    .post(score34);

router.route('/grade3')
    .post(score3);    

router.route('/grade41')
    .post(score41);

router.route('/grade42')
    .post(score42);

router.route('/grade43')
    .post(score43);

router.route('/grade44')
    .post(score44);

router.route('/grade4')
    .post(score4);

router.route('/grade51')
    .post(score51);

router.route('/grade52')
    .post(score52);

router.route('/grade53')
    .post(score53);

router.route('/grade54')
    .post(score54);

router.route('/grade5')
    .post(score5);

router.route('/grade71')
    .post(score71);

router.route('/grade7')
    .post(score7);

router.route('/gradeTotal')
    .post(scoreTotal);    

router.route('/getCollegeSummary')
    .post(getCollegeSummary);

router.route('/radarGrade')
    .get(radarGrade);

export default router;