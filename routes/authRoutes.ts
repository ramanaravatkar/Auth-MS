// routes/authRoutes.ts

import express from 'express';
import { register,signIn,changeTwoFAMethod,forgotPassword, resetPassword, updatePhoneNumber, updateEmail, viewProfile, updateProfile, sendOtp, verifyOtp } from '../controllers/authController';

const router = express.Router();
router.post('/register',register);
router.post('/signIn',signIn);
router.post('/changeTwoFAMethod',changeTwoFAMethod);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/update-phone', updatePhoneNumber);
router.post('/update-email', updateEmail);
router.get('/profile/:userId', viewProfile);
router.put('/profile/:userId', updateProfile);
router.post('/send-otp', sendOtp); // Route to send OTP
router.post('/verify-otp', verifyOtp); // Route to verify OTP

export default router;
