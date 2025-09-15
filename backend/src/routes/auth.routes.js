import express from 'express';
const router = express.Router();

import {iqacRegister, userLogin, refreshAccessToken, getAuthStatus, logout, userRegister, approveUser, rejectUser, getPendingUsers, getApprovedUsers} from '../controllers/auth.controller.js';
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

router.route('/userRegister')
    .post(userRegister);

router.route('/getPendingUsers')
    .get(getPendingUsers);

router.route('/getApprovedUsers')
    .get(getApprovedUsers);


router.route('/approveUser/:uuid')
    .post(approveUser);

router.route('/rejectUser/:uuid')
    .post(rejectUser);

export default router;
