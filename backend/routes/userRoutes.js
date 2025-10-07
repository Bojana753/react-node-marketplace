import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js'; // Možete oba importovati u jednoj liniji

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protect, userController.getMyProfile);

router.put('/profile/basic', protect, userController.updateBasic);
router.put('/profile/sensitive', protect, userController.updateSensitive);

router.get('/:userId', optionalProtect, userController.getPublicProfileById);

export default router;