// controllers/blogControllers

import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../../constant.js';
import generateUniqueSlug from '../utils/slugify.js';
import asyncHandler from 'express-async-handler';


// POST a blog
export const postBlog = asyncHandler(async (req, res) => {
    const { title, subtitle, content, status } = req.body;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        { message: "Authentication failed. Please check your credentials." });

    try {
        const slug = await generateUniqueSlug(title);
        const newBlog = await Blog.create({
            title,
            subtitle,
            content,
            status,
            slug,
            author: user._id
        });

        return res.status(HTTP_STATUS.CREATED).json(
            { message: "Blog post created", blog: newBlog });

    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            { message: error.message });
    }
});

// PUT a blog
export const updateBlog = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const updates = req.body;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json(
        { message: "User not found" })

    const blog = await Blog.findOneAndUpdate(
        { slug, author: user._id },
        updates,
        { new: true, runValidators: true }
    );

    if (!blog) return res.status(HTTP_STATUS.NOT_FOUND).json(
        { message: "Blog not found or not authorized" });

    return res.status(HTTP_STATUS.OK).json({
        message: "Blog Updated",
        blog
    });
});

// GET post by slug
export const getPostsBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: 'published' });
    if (!blog) return res.status(HTTP_STATUS.NOT_FOUND).json(
        { message: "Blog not found" }
    )
    const acceptHeader = req.get('Accept');
    console.log(acceptHeader);
    
    // if (acceptHeader && acceptHeader.includes('text/html')) {
    //     return res.render('blog', { blog });
    // }

    return res.status(HTTP_STATUS.OK).json({
        message: "Published posts",
        blog
    });
});

// Search and GET all published post
export const getAllPublishedBlogs = asyncHandler(async (_req, res) => {
    const publishedBlogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .select('-__v -comments -author');

    return res.status(HTTP_STATUS.OK).json({
        message: "List of published posts",
        blogs: publishedBlogs
    });
});

// Search and GET post by author name
export const getPostsByAuthor = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Author not found"
    });

    const authorBlogs = await Blog.find({ status: 'published', author: user._id })
        .sort({ createdAt: -1 })
        .select('-__v -comments');

    return res.status(HTTP_STATUS.OK).json({
        message: `List of published posts by ${username}`,
        blogs: authorBlogs
    });
});

// delete a blog
export const deleteBlog = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOneAndDelete({ slug });
    if (!blog) return res.status(HTTP_STATUS.NOT_FOUND).json(
        { message: "Blog not found or not authorized" });

    return res.status(HTTP_STATUS.OK).json({ message: 'Blog deleted' });
});

export const getBlogs = async (req, res) => {
    try {
        // Get featured posts (you can determine featured posts based on views, likes, etc.)
        const featuredPosts = await Blog.find({ status: 'published' })
            .sort({ 'meta.views': -1 })
            .limit(5)
            .populate('author', 'username');

        // Get regular posts with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;

        const posts = await Blog.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username');

        const total = await Blog.countDocuments({ status: 'published' });

        res.render('blogs', {
            featuredPosts, // Ensure this is passed to the template
            posts,
            hasMore: total > page * limit,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error fetching blogs',
            error: error.message,
        });
    }
};

export const searchBlogs = async (req, res) => {
    try {
        const { q, sort, page = 1, limit = 9 } = req.query;

        let query = { status: 'published' };
        if (q) {
            query.$text = { $search: q };
        }

        let sortQuery = {};
        switch (sort) {
            case 'oldest':
                sortQuery = { createdAt: 1 };
                break;
            case 'popular':
                sortQuery = { 'meta.views': -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        const posts = await Blog.find(query)
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username');

        const total = await Blog.countDocuments(query);

        return res.json({
            posts,
            hasMore: total > page * limit
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error searching blogs',
            error: error.message
        });
    }
};