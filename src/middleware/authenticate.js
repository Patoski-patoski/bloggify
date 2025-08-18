// src/middleware/authenticate.js - Improved version

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

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
            return res.status(HTTP_STATUS.UNAUTHORIZED).redirect('/login');
        }
        return await refreshTokens(req, res, next);
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);

        // Verify user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).redirect('/login');
        }

        req.user = decoded;
        res.locals.user = decoded;
        return next();
    } catch (error) {
        console.log('Access token verification failed:', error.message);
        if (refreshToken) {
            return await refreshTokens(req, res, next);
        } else {
            return res.status(HTTP_STATUS.UNAUTHORIZED).redirect('/login');
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

        const user = await User.findOne({
            _id: decoded.userId,
            refreshToken,
            refreshTokenExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            // Clear invalid cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(HTTP_STATUS.UNAUTHORIZED).redirect('/login');
        }

        const isLongTermSession = user.longTermSession || false;

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
            refreshToken: { value: newRefreshToken, maxAge: refreshTokenCookieMaxAge }
        });

        // Set req.user with the full user data
        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role,
            username: user.username
        };
        res.locals.user = req.user;

        if (next) return next();
    } catch (error) {
        console.error('RefreshTokens Error:', error);
        // Clear invalid cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.redirect('/login');
    }
});

// Helper to generate tokens
export const generateToken = (user, secret, expiresIn) => {
    const payload = {
        userId: user._id || user.id,
        email: user.email,
        username: user.username
    };

    // Only include role in access tokens
    if (secret === JWT_SECRET) {
        payload.role = user.role;
    }

    return jwt.sign(payload, secret, { expiresIn });
};

// Helper to handle token updates
export const updateRefreshTokenInDb = async (user, refreshToken, rememberMe = false) => {
    const expiryDays = rememberMe ? 30 : 1;

    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    user.longTermSession = rememberMe;

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