import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', protect, userController.getMyProfile);

export default router;