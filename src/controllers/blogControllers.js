// controllers/blogControllers

import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../../config/constant.js';
import generateUniqueSlug from '../utils/slugify.js';
import asyncHandler from 'express-async-handler';
import { getBlogsByAuthor, findUserByUsername} from '../services/blogServices.js';


// POST a blog
export const postBlog = asyncHandler(async (req, res) => {
    const { title, subtitle, content, status, image } = req.body;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        { message: "Authentication failed. Please check your credentials." });

    try {
        const slug = await generateUniqueSlug(title);
        const newBlog = await Blog.findOneAndUpdate(
            { slug },
            {
            title,
            subtitle,
            content,
            status,
            updatedAt: new Date(),
            slug,
            image,
            author: user._id,
            }, // Update or create with these fields
            {
                new: true,
                upsert: true,
            }
        );

        return res.status(HTTP_STATUS.CREATED).json(
            { message: "Blog post created", blog: newBlog });

    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            { message: error.message });
    }
});


// open a draft for editing(and then post afterwards)
export const draftBlog = asyncHandler(async (req, res) => { 
    const { slug } = req.params;

    const draft = await Blog.findOne({ slug, status: 'draft' });
    if (!draft) return res.status(HTTP_STATUS.NOT_FOUND).render('error', {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'draft not found',
        href: '/profile',
    })
    const author = await User.findOne({ _id: draft.author });
    const user = await User.findOne({ id: req.user.userId });

    if (author.id === user.id) {
        return res.render('edit_blog', { 
            title: draft.title,
            subtitle: draft.subtitle,
            image: draft.image,
            content: draft.content,
            unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY
         });
    }
    return res.status(HTTP_STATUS.UNAUTHORIZED).render('error', {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Unauthorized user',
        href: '/blogs'
    });
    
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


// Search and GET all published post
export const getAllPublishedBlogs = asyncHandler(async (_req, res) => {
    const publishedBlogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .select('-__v -comments -author');
    
        if(!publishedBlogs){
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

// Search and GET post by author name
export const getPostsByAuthor = asyncHandler(async( req, res) => {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;

    const user = await findUserByUsername(username);
    if (!user) {
        // Check if it's an API request or browser request
        if (req.headers.accept.includes('application/json')) {
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

    const {blogs, totalPages, currentPage, totalBlogs} = await getBlogsByAuthor(user._id, page);
    return res.status(HTTP_STATUS.OK).render('author', {
        user,
        blogs,
        totalPublishedPages: totalPages,
        currentPublishedPage: currentPage,
        countPublishedBlog: totalBlogs
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

