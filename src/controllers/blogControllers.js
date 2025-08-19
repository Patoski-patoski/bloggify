import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../../config/constant.js';
import asyncHandler from 'express-async-handler';

import * as blogService from '../services/blogServices.js';

// POST a new blog (publish)
export const postBlog = asyncHandler(async (req, res, next) => {
    try {
        const newBlog = await blogService.createBlogPostService(req.body, req.user);
        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        next(error);
    }
});

// PUT (update) a blog
export const updateBlog = asyncHandler(async (req, res, next) => {
    try {
        const updatedBlog = await blogService.updateBlogService(req.params.slug, req.user._id, req.body);
        res.status(HTTP_STATUS.OK).json({
            message: "Blog Updated",
            blog: updatedBlog
        });
    } catch (error) {
        next(error);
    }
});

// Delete blog
export const deleteBlog = asyncHandler(async (req, res, next) => {
    try {
        const result = await blogService.deleteBlogService(req.params.slug, req.user._id);
        res.status(HTTP_STATUS.OK).json({
            message: 'Blog deleted successfully',
            ...result
        });
    } catch (error) {
        next(error);
    }
});

// POST a new draft
export const createDraft = asyncHandler(async (req, res, next) => {
    try {
        const draftData = { ...req.body, status: 'draft' };
        const newDraft = await blogService.createBlogPostService(draftData, req.user);
        res.status(HTTP_STATUS.CREATED).json({
            message: "Draft created",
            blog: newDraft
        });
    } catch (error) {
        next(error);
    }
});

// Open a draft for editing
export const draftBlog = asyncHandler(async (req, res, next) => {
    try {
        const { slug } = req.params;
        const draft = await blogService.draftBlogService(slug, req.user);

        if (!draft) {
            return res.status(HTTP_STATUS.NOT_FOUND).render('error', {
                statusCode: HTTP_STATUS.NOT_FOUND,
                message: 'Draft not found',
                href: '/profile',
            });
        }

        res.render('edit_blog', {
            title: draft.title,
            subtitle: draft.subtitle,
            image: draft.image,
            content: draft.content,
            slug: draft.slug,
            unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY
        });
    } catch (error) {
        next(error);
    }
});

export const getPostsBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' });
    if (!blog) {
        return res.status(HTTP_STATUS.NOT_FOUND).render('unauthorized', {
            message: "Blog not found",
        });
    }

    const author = await User.findOne({ _id: blog.author });
    if (!author) {
        return res.status(HTTP_STATUS.NOT_FOUND).render('unauthorized', {
            message: "Author not found",
        });
    }

    const moreBlogsFromAuthor = await Blog.find({
        author: author._id,
        status: "published",
        _id: { $ne: blog._id },
    }).limit(6);

    const username = author.username;

    return res.render('new_blog', { blog, username, moreBlogsFromAuthor });
});

export const getAllPublishedBlogs = asyncHandler(async (_req, res) => {
    const publishedBlogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .select('-__v -comments -author');

    if (!publishedBlogs) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: "No blogs Posts",
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

    const user = await blogService.findUserByUsername(username);
    if (!user) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Author not found',
            });
        } else {
            return res.status(HTTP_STATUS.NOT_FOUND).render('error', {
                message: `Author "${username}" not found`,
                href: '/blogs'
            });
        }
    }

    const { blogs, totalPages, currentPage, totalBlogs } = await blogService.getBlogsByAuthor(user._id, page);
    return res.status(HTTP_STATUS.OK).render('author', {
        user,
        blogs,
        totalPublishedPages: totalPages,
        currentPublishedPage: currentPage,
        countPublishedBlog: totalBlogs
    });
});

export const getBlogs = asyncHandler(async (req, res) => {
    try {
        const featuredPosts = await Blog.find({ status: 'published' })
            .sort({ 'meta.views': -1 })
            .limit(5)
            .populate('author', 'username');

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
});

export const searchBlogs = asyncHandler(async (req, res) => {
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
});
