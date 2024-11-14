// controllers/blogControllers

import Blog from '../models/Blog.js';
import User from '../models/User.js';
import generateUniqueSlug from '../utils/slugify.js';
import asyncHandler from 'express-async-handler';

export const postBlog = asyncHandler(async (req, res) => {
    const { title, subtitle, content } = req.body;

    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    try {
        const slug = await generateUniqueSlug(title);

        const newBlog = await Blog.create({
            title,
            subtitle,
            content,
            slug,
            author: user._id
        });

        res.status(201).json({ message: "Blog post created", blog: newBlog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// delete a blog
export const deleteBlog = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOneAndDelete({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found or not authorized" });

    res.status(200).json({ message: 'Blog deleted' });
});


// Search and GET all published post
export const getAllPublishedBlogs = asyncHandler(async (_req, res) => {
    const publishedBlogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .select('-__v -comments -author');

    res.status(200).json({
        message: "List of published posts",
        blogs: publishedBlogs
    });
});

// Search and GET post by author name
export const getPostsByAuthor = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Author not found" });

    const authorBlogs = await Blog.find({ status: 'draft', author: user._id })
        .sort({ createdAt: -1 })
        .select('-__v -comments');

    res.status(200).json({
        message: `List of published posts by ${username}`,
        blogs: authorBlogs
    });
});
