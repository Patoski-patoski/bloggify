//database.js

import mongoose, { Schema, model } from "mongoose";

export async function connectMongoDB() {
    try {
        mongoose.connect('mongodb://127.0.0.1/blog', {
        });
        console.log('mongoDB connected');
    } catch (error) {
        console.error('Failed to connect to mongogDB', err);
        process.exit(1);
    }
}


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
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
        default: 'reader'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

const blogSchema = new Schema({
    topic: {
        type: String,
        required: true,
    },
    subtitle: String,
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    body: {
        type: String,
        minlength: 20
    },
    comments: [{
        body: String,
        date: Date
    }],
    date: {
        type: Date,
        default: Date.now
    },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const User = model('User', userSchema);
export const Blog = model('Blog', blogSchema);