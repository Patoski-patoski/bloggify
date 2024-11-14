// app.js

import express from 'express';
import cookieParser from 'cookie-parser';
import { connectMongoDB } from './src/database/database.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './src/routes/authRoutes.js';
import blogRouter from './src/routes/blogRoutes.js';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100 // Limits each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api', authRouter);
app.use('/api', blogRouter);

connectMongoDB();

app.listen(PORT, () => {
    console.log(`Listening live at port ${PORT}`);
});
