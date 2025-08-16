// controllers/blogControllers.js (fixed version)

import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../../config/constant.js';
import generateUniqueSlug from '../utils/slugify.js';
import asyncHandler from 'express-async-handler';
import { getBlogsByAuthor, findUserByUsername } from '../services/blogServices.js';

// POST a new blog
export const postBlog = asyncHandler(async (req, res) => {
    const { title, subtitle, content, status, image, existingSlug } = req.body;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        { message: "Authentication failed. Please check your credentials." });

    try {
        // Check if we're updating an existing blog
        if (existingSlug) {
            // Find the existing blog
            const existingBlog = await Blog.findOne({ slug: existingSlug, author: user._id });

            if (existingBlog) {
                // Update existing blog
                const updatedBlog = await Blog.findOneAndUpdate(
                    { slug: existingSlug, author: user._id },
                    {
                        title,
                        subtitle,
                        content,
                        status,
                        updatedAt: new Date(),
                        image
                    },
                    { new: true }
                );

                return res.status(HTTP_STATUS.OK).json({
                    message: "Blog post updated",
                    blog: updatedBlog
                });
            }
        }

        // Create a new blog
        const slug = await generateUniqueSlug(title);

        const newBlog = await Blog.create({
            title,
            subtitle,
            content,
            status,
            slug,
            image,
            author: user._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const author = await User.findOne({ _id: newBlog.author });
        const username = author.username;


        return res.status(HTTP_STATUS.CREATED).json({
            message: "Blog post created",
            blog: newBlog,
            username
        });

    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
});

// Open a draft for editing
export const draftBlog = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    // First try to find a draft version
    let draft = await Blog.findOne({ slug, status: 'draft' });

    // If no draft found, try to find a published version
    if (!draft) {
        draft = await Blog.findOne({ slug, status: "published" });
    }

    if (!draft) return res.status(HTTP_STATUS.NOT_FOUND).render('error', {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'Draft not found',
        href: '/profile',
    });

    const author = await User.findOne({ _id: draft.author });
    const user = await User.findOne({ id: req.user.userId });

    if (author.id === user.id) {
        return res.render('edit_blog', {
            title: draft.title,
            subtitle: draft.subtitle,
            image: draft.image,
            content: draft.content,
            slug: draft.slug, // Pass the slug to the template
            unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY
        });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).render('error', {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Unauthorized user',
        href: '/blogs'
    });
});

// PUT (update) a blog
export const updateBlog = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const updates = req.body;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "User not found"
    });

    // Find the blog first to check if it exists
    const existingBlog = await Blog.findOne({ slug, author: user._id });
    if (!existingBlog) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: "Blog not found or not authorized"
        });
    }

    // If title is being updated, we might need a new slug
    if (updates.title && updates.title !== existingBlog.title) {
        // Keep the existing slug if possible, but generate a new one if necessary
        updates.slug = await generateUniqueSlug(updates.title, slug);
    }

    const blog = await Blog.findOneAndUpdate(
        { slug, author: user._id },
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
    );

    const author = await User.findOne({ _id: blog.author });
    const username = author.username;

    return res.status(HTTP_STATUS.OK).json({
        message: "Blog Updated",
        blog,
        username
    });
});

// The rest of the controllers remain the same...
export const getPostsBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    // Find the blog with the current slug
    const blog = await Blog.findOne({ slug, status: 'published' });
    if (!blog) {
        return res.status(HTTP_STATUS.NOT_FOUND).render('unauthorized', {
            message: "Blog not found",
        });
    }

    // Find the author of the blog
    const author = await User.findOne({ _id: blog.author });
    if (!author) {
        return res.status(HTTP_STATUS.NOT_FOUND).render('unauthorized', {
            message: "Author not found",
        });
    }

    // Fetch more blogs from the same author, excluding the current blog
    const moreBlogsFromAuthor = await Blog.find({
        author: author._id,
        status: "published",
        _id: { $ne: blog._id }, // Exclude the current blog by ID
    })
        .limit(6);

    const username = author.username;

    // Render the view with the blog and more blogs
    return res.render('new_blog', { blog, username, moreBlogsFromAuthor });
});

export const getAllPublishedBlogs = asyncHandler(async (_req, res) => {
    const publishedBlogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .select('-__v -comments -author');

    if (!publishedBlogs) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: " No blogs Posts",
            blogs: []
        });
    }

    return res.status(HTTP_STATUS.OK).json({
        message: "List of published posts",
        blogs: publishedBlogs
    });
});

export const getPostsByAuthor = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;

    const user = await findUserByUsername(username);
    if (!user) {
        // Check if it's an API request or browser request
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Author not found',
            });
        } else {
            // Render error page for browser requests
            return res.status(HTTP_STATUS.NOT_FOUND).render('error', {
                message: `Author "${username}" not found`,
                href: '/blogs'
            });
        }
    }

    const { blogs, totalPages, currentPage, totalBlogs } = await getBlogsByAuthor(user._id, page);
    return res.status(HTTP_STATUS.OK).render('author', {
        user,
        blogs,
        totalPublishedPages: totalPages,
        currentPublishedPage: currentPage,
        countPublishedBlog: totalBlogs
    });
});

export const deleteBlog = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Authentication failed"
    });

    const blog = await Blog.findOneAndDelete({ slug, author: user._id });
    if (!blog) return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Blog not found or not authorized"
    });

    return res.status(HTTP_STATUS.OK).json({ message: 'Blog deleted' });
});

export const getBlogs = async (req, res) => {
    try {
        // Get featured posts (One can determine featured posts based on views, likes, etc.)
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
            featuredPosts,
            posts,
            page,
            limit,
            total,
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