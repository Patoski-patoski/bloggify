// controllers/authControllers.js

import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { HTTP_STATUS, SALT_ROUNDS } from '../../constant.js';

import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('JWT_SECRET not set in environmental variable');
    process.exit(1);
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
    const hashedPAssword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = User.create({
        username,
        email,
        bio,
        password: hashedPAssword
    });

    // Not sending password back in response
    newUser.password = undefined;

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
    await user.save();

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '1h' });

    // Set secure cookie
    res.cookie('token', token, {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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