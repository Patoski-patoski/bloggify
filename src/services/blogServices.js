import User from '../models/User.js';
import Blog from '../models/Blog.js';
import generateUniqueSlug from '../utils/slugify.js';

// Utility function to create a common error response
export const createErrorResponse = (res, status, message) => {
    return res.status(status).json({ message });
};

export const findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

// Shared blog creation logic
export const createBlogPostService = async (blogData, user) => {
    try {
        if (!blogData.slug) {
            blogData.slug = await generateUniqueSlug(blogData.title);
        }

        const newBlog = await Blog.create({
            ...blogData,
            author: user._id
        });
        return newBlog;

    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateBlogService = async (slug, userId, updates) => {
    const existingBlog = await Blog.findOne({ slug, author: userId });

    if (!existingBlog) {
        const error = new Error('Blog not found or you do not have permission to edit it');
        error.statusCode = 404;
        throw error;
    }

    if (updates.title && updates.title !== existingBlog.title) {
        updates.slug = await generateUniqueSlug(updates.title, slug);
    }

    Object.assign(existingBlog, updates);
    existingBlog.updatedAt = new Date();

    await existingBlog.save();
    return existingBlog;
};

export const deleteBlogService = async (slug, userId) => {
    const blog = await Blog.findOne({ slug, author: userId });

    if (!blog) {
        const error = new Error('Blog not found or you do not have permission to delete it');
        error.statusCode = 404;
        throw error;
    }

    await Blog.findByIdAndDelete(blog._id);
    return { deletedSlug: slug };
};

export const draftBlogService = async (slug, user) => {
    // Find a blog with the given slug that belongs to the user, can be draft or published
    const draft = await Blog.findOne({ slug, author: user._id }).or([{ status: 'draft' }, { status: 'published' }]);
    return draft;
};

export const getBlogsByAuthor = async (userId, page = 1, limit = 6) => {
    const skip = (page - 1) * limit;

    const [blogs, totalCount] = await Promise.all([
        Blog.find({ author: userId, status: 'published' })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('author', 'username profilePicture bio'),
        Blog.countDocuments({ author: userId, status: 'published' })
    ]);
    
    return {
        blogs,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalBlogs: totalCount
    };
};
