// controllers/authControllers.js

import { generateToken, updateRefreshTokenInDb, setCookies } from '../middleware/authenticate.js'
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

import { HTTP_STATUS, SALT_ROUNDS } from '../../config/constant.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;

if (!JWT_SECRET || !REFRESH_JWT_SECRET) {
    console.error('JWT secrets are not set in environment variables');
    process.exit(1);
}

export const tester = asyncHandler(async (req, res) => {
    return res.status(200).json({ message: 'Hello, world!' });
});

// Register user
export const register = asyncHandler(async (req, res) => {
    try {
        const { username, password, email, bio } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: 'User with this email or username already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await User.create({ username, email, bio, password: hashedPassword });

        res.status(HTTP_STATUS.CREATED).json({
            message: 'User created successfully',
            user: newUser,
        });
    } catch (error) {
        console.error('Error in register function:', error)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while registering the user',
            error: error.message
        });
    }
   
});


// Login user
export const login = asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();

    // Set refreshToken expiration
    const accessTokenExpiry = '1h'; //Keep access token short-lived
    const refreshTokenExpiry = rememberMe
        ? '30d' // 30 days 
        : '1d'; // 1 day
    
    const refreshTokenCookieMaxAge = rememberMe
        ? 30 * 24 * 3600 * 1000 // 30 days
        : 24 * 3600 * 1000; // 1 day
    
    
    const accessToken = generateToken(user, JWT_SECRET, accessTokenExpiry);
    const refreshToken = generateToken(user, REFRESH_JWT_SECRET, refreshTokenExpiry);
    
    await updateRefreshTokenInDb(user, refreshToken, rememberMe);

    setCookies(res, {
        accessToken: { value: accessToken, maxAge: 3600 * 1000 }, // 1 hour
        refreshToken: { value: refreshToken, maxAge: refreshTokenCookieMaxAge }, // 1 day
    });

    res.status(HTTP_STATUS.OK).json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpiresAt = undefined;
        await user.save();
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(HTTP_STATUS.OK).json({ message: 'Logout successful' });
});
