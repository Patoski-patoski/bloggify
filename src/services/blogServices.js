// services/blogService.js
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import { HTTP_STATUS } from '../../constant.js';

import generateUniqueSlug from '../utils/slugify.js';
import asyncHandler from 'express-async-handler';


// Utility function to create a common error response
export const createErrorResponse = (res, status, message) => {
    return res.status(status).json({ message });
};

// Utility function to validate user authentication
export const validateUserAuthentication = async (req) => {
    const user = await User.findOne({ id: req.user.userId });
    if (!user) {
        throw new Error("Authentication failed. Please check your credentials.");
    }
    return user;
};

// Shared blog creation logic
export const createBlogPost = async (blogData, user) => {
    try {
        // If no slug is provided, generate a unique one
        console.log('blogData', blogData);
        if (!blogData.slug) {
            blogData.slug = await generateUniqueSlug(blogData.title);
        }

        const newBlog = await Blog.create({
            ...blogData,
            author: user._id
        });
        console.log('newBlog', newBlog);
        return newBlog;

    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const findUserByUsername = async(username) => {
    return await User.findOne({username});
};

export const getBlogsByAuthor = async (userId, page = 1, limit = 6) => {
    const skip = (page - 1) * limit;

    const [blogs, totalCount] = await Promise.all([
        Blog.find({author: userId, status: 'published'})
        .skip(skip) // if totalCount exceeds limit, it "skip" blogs documents 
        .limit(limit)
        .sort({createdAt: -1})
        .populate('author', 'username profilePicture bio'),
        Blog.countDocuments({ author: userId, status: 'published'})
    ]);
    return {
        blogs,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalBlogs: totalCount
    };
}

