//src/middleware/authenticate.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

// import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../../config/constant.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
const isProductionEnv = process.env.NODE_ENV === 'production';


// Authenticate token middleware
export const authenticateToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
        if (!refreshToken) {
            return res.status(HTTP_STATUS.FORBIDDEN).redirect('/login');
        }
        await refreshTokens(req, res, next);  // Pass `next` to proceed after refreshing tokens.
        return;
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded;
        return next();
    } catch {
        if (refreshToken) {
            await refreshTokens(req, res, next); // Try refreshing if accessToken is invalid.
        } else {
            res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Invalid or expired access token' });
        }
    }
};

// Refresh tokens
export const refreshTokens = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: 'Refresh token required'
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);
        console.log("Decoded", decoded);
        const user = await User.findOne({
            refreshToken,
            refreshTokenExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                message: 'Invalid or expired refresh token'
            });
        }

        const isLongTermSession = user.longTermSession || false; // Check if the user has a long-term session

        // Set token expirations based on original "Remember Me" choice
        const refreshTokenExpiry = isLongTermSession ? '30d' : '1d';
        const refreshTokenCookieMaxAge = isLongTermSession
            ? 30 * 24 * 3600 * 1000  // 30 days
            : 24 * 3600 * 1000;      // 1 day

        const newAccessToken = generateToken(user, JWT_SECRET, '1h');
        const newRefreshToken = generateToken(user, REFRESH_JWT_SECRET, refreshTokenExpiry);

        await updateRefreshTokenInDb(user, newRefreshToken, isLongTermSession);

        setCookies(res, {
            accessToken: { value: newAccessToken, maxAge: 3600 * 1000 },
            refreshToken: { value: newRefreshToken, refreshTokenCookieMaxAge }
        });

        req.user = decoded;

        if(next) return next();
    } catch (error) {
        console.error('RefreshTokens Error', error);
        res.redirect('/login');
    }
});

// Helper to generate tokens
export const generateToken = (user, secret, expiresIn) => {
    const payload = { userId: user.id, role: user.role, email: user.email };
    if (secret === REFRESH_JWT_SECRET) delete payload.role;
    return jwt.sign(payload, secret, { expiresIn });
};

// Helper to handle token updates
export const updateRefreshTokenInDb = async (user, refreshToken, rememberMe = false) => {
    user.refreshToken = refreshToken;

    const expiryDays = rememberMe ? 30 : 1; // 30 days if rememberMe is true, otherwise 1 day
    user.refreshTokenExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000); // Set expiration date

    user.longTermSession = rememberMe; // Store rememberMe status in the user document
    await user.save();
};


// Helper to set cookies
export const setCookies = (res, tokens) => {
    Object.entries(tokens).forEach(([name, { value, maxAge }]) => {
         res.cookie(name, value, {
            maxAge,
            httpOnly: true,
            secure: isProductionEnv,
            sameSite: 'Strict',
        });
    });
};