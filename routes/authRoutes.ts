import express from 'express';
import { register, login, forgotPassword, resetPassword, updatePhoneNumber, updateEmail } from '../controllers/authController';
import { Router } from 'express';
import { generateAndSend2FAToken, verify2FAToken } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.patch('/update-phone', updatePhoneNumber);
router.patch('/update-email', updateEmail);
router.post('/2fa/generate', generateAndSend2FAToken);
router.post('/2fa/verify', verify2FAToken);

export default router;

