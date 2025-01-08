import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

import User from '../models/User.js';
import { HTTP_STATUS } from '../../config/constant.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
const isProductionEnv = process.env.NODE_ENV === 'production';


// Authenticate token middleware
export const authenticateToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) return res.redirect('/login');

    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded;
        return next();

    } catch(err) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            code: HTTP_STATUS.UNAUTHORIZED,
            message: 'Invalid or expired access token' 
        });
    }
};

// Refresh tokens
export const refreshTokens = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.redirect('/login');

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);
        const user = await User.findOne({
            refreshToken,
            refreshTokenExpiresAt: { $gt: new Date() },
        });

        if (!user) throw new Error();

        const newAccessToken = generateToken(user, JWT_SECRET, '1m');
        const newRefreshToken = generateToken(user, REFRESH_JWT_SECRET, '3m');
        await updateRefreshTokenInDb(user, newRefreshToken);

        setCookies(res, {
            accessToken: { value: newAccessToken, maxAge: 3600 * 1000 },
            refreshToken: { value: newRefreshToken, maxAge: 7 * 24 * 3600 * 1000 },
        });

        req.user = decoded;

        if(next) next();

        res.status(HTTP_STATUS.OK).render('create_blog');
    } catch (error) {
        console.error('RefreshTokens Error', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Invalid Refresh token' });
    }
});


// Helper to generate tokens
export const generateToken = (user, secret, expiresIn) => {
    const payload = { userId: user.id, role: user.role, email: user.email };
    if (secret === REFRESH_JWT_SECRET) delete payload.role; // Exclude role for refresh token
    return jwt.sign(payload, secret, { expiresIn });
};

// Helper to handle token updates
export const updateRefreshTokenInDb = async (user, refreshToken) => {
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
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