// routes/blogRoutes.js

import { Router } from 'express';
import authenticateToken from '../middleware/authenticate.js';
import authorizeRole from '../middleware/authorize.js';
import {
    postBlog,
    deleteBlog,
    getAllPublishedBlogs,
    getPostsByAuthor
} from '../controllers/blogControllers.js';

const blogRouter = Router();

// Post a blog
blogRouter.post('/blogs', authenticateToken, authorizeRole('author'), postBlog);

// Delete a blog by slug
blogRouter.delete('/blogs/:slug', authenticateToken, authorizeRole('author'), deleteBlog);

// Get all published blogs
blogRouter.get('/blogs', getAllPublishedBlogs);

// Get published blogs by author name
blogRouter.get('/blogs/author/:username', getPostsByAuthor);

export default blogRouter;
