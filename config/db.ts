// src/config/db.ts

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connect('mongodb://localhost:27017/auth-db', {
         // useNewUrlParser: true,
          
      });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
