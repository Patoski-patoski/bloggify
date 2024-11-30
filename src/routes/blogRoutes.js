// routes/blogRoutes.js

import { Router } from 'express';
import authenticateToken from '../middleware/authenticate.js';
import authorizeRole from '../middleware/authorize.js';
import {
    postBlog,
    deleteBlog,
    getAllPublishedBlogs,
    searchBlogs,
    getBlogs,
    getPostsByAuthor,
    getPostsBySlug,
    updateBlog
} from '../controllers/blogControllers.js';

const blogRouter = Router();

// home page

blogRouter.get(['/', 'home', 'index'], (_req, res, next) => res.render('index'))
//Create a blog 
blogRouter.get('/create', authenticateToken, authorizeRole('author'), (_req, res, next) => res.render('create_blog'));

// Post a blog
blogRouter.post('/blogs', authenticateToken, authorizeRole('author'), postBlog);

// Update a POST
blogRouter.put('/blogs/:slug', authenticateToken, authorizeRole('author'), updateBlog);

// Delete a blog by slug
blogRouter.delete('/blogs/:slug', authenticateToken, authorizeRole('author'), deleteBlog);

// Get all published blogs
// blogRouter.get('/blogs', getAllPublishedBlogs);

// Get published blogs by author name
blogRouter.get('/blogs/author/:username', getPostsByAuthor);

// Get published blogs by slug
blogRouter.get('/blogs/:slug', getPostsBySlug);

blogRouter.get('/blogs', getBlogs);
blogRouter.get('/api/blogs/search', searchBlogs);

export default blogRouter;
