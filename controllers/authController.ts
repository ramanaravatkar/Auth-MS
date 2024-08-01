import { Request, Response } from 'express';
import * as authServices from '../services/authServices';

export const register = async (req: Request, res: Response) => {
    const { email, password, phoneNumber } = req.body;
    try {
        const user = await authServices.register(email, password, phoneNumber);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const token = await authServices.signIn(email, password);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const changeTwoFAMethod = async (req: Request, res: Response) => {
    const { userId, method } = req.body;
    try {
        const updatedUser = await authServices.changeTwoFAMethod(userId, method);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error});
    }
};
// authControllers.ts

import User from '../models/user';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { sendVerification, verifyCode } from '../utils/twilio';
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    console.log('Received email:', email); // Add this line for debugging

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        console.log('Found user:', user); // Add this line for debugging

        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        //user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `http://localhost:3000/reset/${token}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.status(200).json({ message: 'Password reset link sent to your email' });
        });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    try {
        const message = await authServices.resetPassword(token, newPassword);
        res.status(200).json({ message });
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const updatePhoneNumber = async (req: Request, res: Response) => {
    const { userId, newPhoneNumber } = req.body;
    try {
        const updatedUser = await authServices.updatePhoneNumber(userId, newPhoneNumber);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error});
    }
};

export const updateEmail = async (req: Request, res: Response) => {
    const { userId, newEmail } = req.body;
    try {
        const updatedUser = await authServices.updateEmail(userId, newEmail);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};



// View Profile
export const viewProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in viewProfile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { address, dob, gender } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.address = address || user.address;
        user.dob = dob || user.dob;
        user.gender = gender || user.gender;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }}// controllers/authControllers.ts

// Send Verification OTP
export const sendOtp = async (req: Request, res: Response) => {
    const { contact, channel } = req.body; // channel should be 'sms' or 'email'
    try {
        await sendVerification(contact, channel);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
    const { contact, code } = req.body;
    try {
        const verificationCheck = await verifyCode(contact, code);
        if (verificationCheck.status === 'approved') {
            const user = await User.findOne({ $or: [{ email: contact }, { phoneNumber: contact }] });
            if (user) {
                //user.isVerified = true;
                await user.save();
                res.status(200).json({ message: 'Verification successful' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

