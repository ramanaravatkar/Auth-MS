import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  phone: string;
  username: string;
  twoFactorAuthToken?: string;
  twoFactorAuthTokenExpiration?: Date;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  twoFactorAuthToken: { type: String },
  twoFactorAuthTokenExpiration: { type: Date },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
