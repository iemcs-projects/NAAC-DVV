import express from 'express';
const router = express.Router();

import {iqacRegister, userLogin, refreshAccessToken, getAuthStatus, logout} from '../controllers/auth.controller.js';
//http://localhost:3000/api/v1/auth/iqacRegister
import verifyToken from '../middlewares/auth.middlewares.js';
router.route('/iqacRegister')
    .post(iqacRegister);

router.route('/userLogin')
    .post(userLogin);

router.route('/refresh')
    .post(refreshAccessToken);

router.route('/me')
    .get(verifyToken, getAuthStatus);

router.route('/logout')
    .post(logout);

export default router;
