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
    image: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minlength: [20, 'Content must be at least 20 characters']
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
blogSchema.pre('save', async function (next) {
    if (!this.isModified('slug')) return next();

    let count = 1;
    let originalSlug = this.slug;
    while (await Blog.findOne({ slug: this.slug })) {
        this.slug = `${originalSlug}-${count}`;
        count++;
    }
    next();
});



// The sensitive _id, author, __v, e.t.c fields will be excluded automatically.
blogSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.author;
        delete ret.__v;
        delete ret.comments;
        delete ret.updatedAt;
        delete ret.meta;
    }
});

// Add indexes for common queries
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });

const Blog = model('Blog', blogSchema);
export default Blog;
