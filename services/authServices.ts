import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

export const register = async (email: string, password: string, phoneNumber: string) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, phoneNumber });
    await user.save();
    return user;
};

export const signIn = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
    return token;
};

export const changeTwoFAMethod = async (userId: string, method: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    user.twoFAMethod = method;
    await user.save();
    return user;
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    //user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    
    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    await sendEmail(user.email, 'Password Reset Request', `Please reset your password by visiting the following link: ${resetUrl}`);

    return 'Password reset link sent to your email';
};

export const resetPassword = async (token: string, newPassword: string) => {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        throw new Error('Invalid or expired token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return 'Password has been reset';
};

export const updatePhoneNumber = async (userId: string, newPhoneNumber: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    user.phoneNumber = newPhoneNumber;
    await user.save();
    return user;
};

export const updateEmail = async (userId: string, newEmail: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    user.email = newEmail;
    await user.save();
    return user;
};
