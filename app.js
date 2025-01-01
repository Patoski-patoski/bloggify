// app.js

import cookieParser from 'cookie-parser';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
// import cors from 'cors';
// import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from "morgan";


import config from './config.js';
import authRouter from './src/routes/authRoutes.js';
import blogRouter from './src/routes/blogRoutes.js';
import profileRouter from './src/routes/profileRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Security middleware
// app.use(helmet(config.security.helmet));
// app.use(cors(config.security.cors));
app.use(express.json({ limit: '2MB' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit(config.security.rateLimit));
app.use(morgan('dev')); // Logs HTTP requests

// Serve static files from the public directory
app.use(express.static('./src/public'));

// Set view engine to EJS
app.set('views', join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');


// Routes
app.use( authRouter );
app.use( blogRouter );
app.use( profileRouter);

// Global middlewares
app.use(errorHandler);


export default app;
