// models/user.ts

import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    email: string;
    password: string;
    phoneNumber?: string;
    twoFAMethod?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    address?: string;
    dob?: Date;
    gender?: string;
    isVerified?: boolean; // New field for verification status
}

const userSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    twoFAMethod: { type: String, default: 'email' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String },
    isVerified: { type: Boolean, default: false }, // Initialize verification status as false
});

export default mongoose.model<IUser>('User', userSchema);
