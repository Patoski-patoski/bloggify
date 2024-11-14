// models/Blog.js

import { Schema, model } from 'mongoose';
import slugify from 'slugify';


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

const Blog = model('Blog', blogSchema);
export default Blog;
