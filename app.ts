// app.ts

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

app.use(express.json());

const mongoUri = 'mongodb://localhost:27017/auth-db'; // for local MongoDB
// const mongoUri = 'mongodb+srv://username:password@cluster0.mongodb.net/your-database-name?retryWrites=true&w=majority'; // for MongoDB Atlas

mongoose.set('strictQuery', true); // Add this line to suppress the deprecation warning

mongoose.connect(mongoUri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.use('/api/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
