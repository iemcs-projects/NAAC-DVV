import express from 'express';
const router = express.Router();
import { createExtendedProfile } from '../controllers/extendedprofile.controller.js';


router.route('/createExtendedProfile')
    .post(createExtendedProfile);

export default router;