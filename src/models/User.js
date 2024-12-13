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
        minlength: 6,
        select: false  // Prevents returning this field in queries
    },
    role: {
        type: String,
        enum: ['reader', 'author'],
        default: 'author'
    },
    bio: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 150
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
    },
    refreshToken: {
        type: String,
        select: false 
    },
    refreshTokenExpiresAt: {
        type: Date
    }
});

// The sensitive id, password and createdAt fields will be excluded
// automatically.
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.id;
        delete ret.createdAt;
    }
});

const User = model('User', userSchema);
export default User;