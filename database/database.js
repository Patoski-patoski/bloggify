//database.js

import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import slugify from 'slugify';
import config from '../config.js';


const MONGODB_URI = config.mongodb.url || 'mongodb://127.0.0.1/blog';

export async function connectMongoDB() {
    try {
        mongoose.connect(MONGODB_URI, {
            dbName: config.mongodb.dbName
        });
        console.log('mongoDB connected');
    } catch (error) {
        console.error('Failed to connect to mongogDB', err);
        process.exit(1);
    }
}

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

const blogSchema = new Schema({
    slug: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxLength: [200, 'Title cannot be longer han 200 characters']
    },

    subtitle: {
        type: String,
        trim: true,
        maxLength: [500, 'Subtitle cannot be longer than 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minlength: [20, 'Content must be at least 20 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    comments: [{
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isEdited: { type: Boolean, default: false }
    }],
    meta: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add middleware to update the updatedAt field
blogSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Add middleware to set or update slug from the title
blogSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title);
    }
    next();
});


// The sensitive _id, author, and __v fields will be excluded automatically.
blogSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.author;
        delete ret.__v;
    }
});

// Add indexes for common queries
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });

export const User = model('User', userSchema);
export const Blog = model('Blog', blogSchema);
