

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import { sendResetEmail } from '../utils/email';
import { sendTwoFactorAuthEmail, sendTwoFactorAuthSMS } from '../utils/twoFactorAuth';

// Generate and Send 2FA Token
export const generateAndSend2FAToken = async (req: Request, res: Response) => {
  const { userId, method } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(3).toString('hex'); // 6-character token
    user.twoFactorAuthToken = token;
    user.twoFactorAuthTokenExpiration = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    if (method === 'email') {
      await sendTwoFactorAuthEmail(user.email, token);
    } else if (method === 'sms') {
      await sendTwoFactorAuthSMS(user.phone, token);
    } else {
      return res.status(400).json({ message: 'Invalid 2FA method' });
    }

    res.status(200).json({ message: '2FA token sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify 2FA Token
export const verify2FAToken = async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.twoFactorAuthToken === token  ){
      user.twoFactorAuthToken = undefined;
      user.twoFactorAuthTokenExpiration = undefined;
      await user.save();

      res.status(200).json({ message: '2FA token verified' });
    } else {
      res.status(400).json({ message: 'Invalid or expired 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User Registration
export const register = async (req: Request, res: Response) => {
  const { email, password, phone, username } = req.body;

  console.log('Register request received with email:', email);

  try {
    // Check if all fields are provided
    if (!email || !password || !phone || !username) {
      console.log('All fields are required');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already in use');
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Check if the username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Username already in use');
      return res.status(400).json({ message: 'Username already in use' });
    }

    // Ensure the phone number includes the country code
    const countryCode = '+91';
    let formattedPhone = phone;
    if (!phone.startsWith(countryCode)) {
      formattedPhone = `${countryCode}${phone}`;
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, phone: formattedPhone, username });
    await user.save();

    console.log('User registered successfully');

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error', error: error });
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    console.log(`Forgot password request received for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(400).json({ message: 'No user found with that email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    console.log(`Generated reset token: ${token}`);

    // Store the reset token and expiration
    // user.resetToken = token;
    // user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour
    // await user.save();

    console.log(`Reset token stored in database for user: ${email}`);

    await sendResetEmail(email, token);

    console.log(`Password reset email sent to: ${email}`);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during forgot password process:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    console.log(`Reset password request received with token: ${token}`);

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: new Date() }
    });

    if (!user) {
      console.log('Invalid or expired token');
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    // user.resetToken = undefined;
    // user.resetTokenExpiration = undefined;
    // await user.save();

    console.log('Password has been reset for user:', user.email);

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Error during reset password process:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Phone Number
export const updatePhoneNumber = async (req: Request, res: Response) => {
  const { userId, newPhoneNumber } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.phone = newPhoneNumber;
    await user.save();

    res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Email
export const updateEmail = async (req: Request, res: Response) => {
  const { userId, newEmail } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
