// models/User.js

import { Schema, model } from 'mongoose';
import { v4 as uuid4 } from 'uuid';

const userSchema = new Schema({
    id: {
        type: String,
        default: uuid4,
        unique: true,
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [3, 'Username must be at least 3 characters'],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email'],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['reader', 'author'],
        default: 'author'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true,
    }
});

const User = model('User', userSchema);
export default User;