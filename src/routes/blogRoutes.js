// routes/blogRoutes.js

import { Router } from 'express';
import {authenticateToken} from '../middleware/authenticate.js';
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


// GET     /home                 -> Render homepage
// GET     /blogs                -> Get all blogs (with pagination)
// POST    /blogs                -> Create a new blog
// GET     /blogs/:slug          -> Get a specific blog by slug (HTML rendering)
// PUT     /blogs/:slug          -> Update a blog by slug
// DELETE  /blogs/:slug          -> Delete a blog by slug

// GET     /api/blogs            -> Get all blogs (API)
// GET     /api/blogs/:slug      -> Get a blog by slug (API)
// GET     /api/blogs/search     -> Search blogs by query
// GET     /api/blogs/author/:username -> Get blogs by author


const blogRouter = Router();

// Render homepage
blogRouter.get(['/home', '/'], (_req, res, next) => res.render('index'))
// GET all blogs
blogRouter.get('/blogs', getBlogs);
// POST a blog
blogRouter.post('/blogs', authenticateToken, authorizeRole('author'), postBlog);
// Get published blogs by slug
blogRouter.get('/blogs/:slug', getPostsBySlug);
// Update a blog by slug
blogRouter.put('/blogs/:slug', authenticateToken, authorizeRole('author'), updateBlog);
// DELETE a blog by slug
blogRouter.delete('body/:slug', authenticateToken, authorizeRole('author'), deleteBlog);

blogRouter.get('/create', authenticateToken, authorizeRole('author'), (req, res, next) => {
 
    res.render('create_blog', { unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY });
});

// Update a POST
blogRouter.put('/:slug', authenticateToken, authorizeRole('author'), updateBlog);

// Get all published blogs
// blogRouter.get('/blogs', getAllPublishedBlogs);

// Get published blogs by author name
// blogRouter.get('/author/:username', getPostsByAuthorAPI);

blogRouter.get('/search/api', searchBlogs);

export default blogRouter;
