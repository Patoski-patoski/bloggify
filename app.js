// app.js

import express from 'express';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './src/routes/authRoutes.js';
import blogRouter from './src/routes/blogRoutes.js';
import { connectMongoDB } from './src/database/database.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
app.use('/', limiter);

// Serve static files from the public directory
app.use(express.static('public'));

// Set view engine to EJS
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Routes
app.use( authRouter);
app.use( blogRouter);

connectMongoDB();

app.listen(PORT, () => {
    console.log(`Listening live at port ${PORT}`);
});
