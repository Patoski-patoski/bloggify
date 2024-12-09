// controllers/authControllers.js

import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { HTTP_STATUS, SALT_ROUNDS } from '../../constant.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
const isProductionEnv = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
    console.error('JWT_SECRET not set in environmental variable');
    process.exit(1);
}

// Generate Access token
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user.id
        },
        REFRESH_JWT_SECRET,
        { expiresIn: '7d' }
    )
}
export const register = asyncHandler(async (req, res) => {
    const { username, password, email, bio } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            message: "User with this email or username already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = User.create({
        username,
        email,
        bio,
        password: hashedPassword
    });

    res.status(HTTP_STATUS.CREATED).json({
        message: "User created successfully:",
        user: newUser
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: "Invalid credentials"
        });
    }

    user.lastLogin = new Date();
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh taken in database 
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Set secure cookie
    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
        secure: isProductionEnv,
        sameSite: 'strict'
    });

    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: isProductionEnv,
        sameSite: 'strict'
    });

    res.status(HTTP_STATUS.OK).json({
        message: "Login successful",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }
    });
});

export const logout = asyncHandler(async (req, res) => {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (user) {
        // Clear refresh token in database
        user.refreshToken = undefined;
        user.refreshTokenExpiresAt = undefined;
        await user.save();
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(HTTP_STATUS.OK).json({
        message: "Logout successful"
    });
})

export const authenticateToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
        if (!refreshToken) {
            return res.status(HTTP_STATUS.FORBIDDEN).render('unauthorized', {
                message: "Invalid or expired access token.",
            });
        }
        return refreshTokens(req, res);
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded; // Attach decoded user info to req object
        res.locals.user = decoded; // Make user info available in EJS templates
        next();

    } catch (error) {
        return res.status(HTTP_STATUS.FORBIDDEN).render('unauthorized', {
            message: "Invalid or expired access token.",
        });
    }
};

export const refreshTokens = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    console.log('refreshToken', refreshToken);

    if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: "Refresh token required"
        });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);

        // Find user with this refresh token
        const user = await User.findOne({
            refreshToken,
            refreshTokenExpiresAt: { $gt: new Date() }
        });

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                message: 'Invalid or expired refresh token'
            });
        }

        // Generate new access token and refresh token
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update user's refresh token in the database
        user.refreshToken = newRefreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await user.save();

        // Set cookies for the new tokens
        res.cookie('accessToken', newAccessToken, {
            maxAge: 1000 * 60 * 60, // 1 hour
            httpOnly: true,
            secure: isProductionEnv,
            sameSite: 'Strict'
        });

        res.cookie('refreshToken', newRefreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            secure: isProductionEnv,
            sameSite: 'Strict'
        });

        return res.status(HTTP_STATUS.OK).render('create_blog');

    } catch (error) {
        console.error("RefreshTokens Error", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: "Invalid Refresh token"
        });
    }
});
