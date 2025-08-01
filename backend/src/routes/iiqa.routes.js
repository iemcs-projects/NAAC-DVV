import express from 'express';
const router = express.Router();
import { createIIQAForm, getSessions } from '../controllers/iiqa.controller.js';


router.route('/createIIQAForm')
    .post(createIIQAForm);

router.route('/sessions')
    .get(getSessions);
export default router;
