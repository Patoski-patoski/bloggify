// controller/profileController.js
import asyncHandler from 'express-async-handler';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../../config/constant.js';


export const profile = asyncHandler(async (req, res) => {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    
    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).redirect('/login');
    }

    const page = parseInt(req.query.published_page) || 1;
    const draftsPage = parseInt(req.query.drafts_page) || 1;
    const limit = 6; // blogs per page

    const [blogs, drafts, countPublishedBlog, countDraftBlog] = await Promise.all([
        Blog.find({ author: user._id, status: 'published' })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Blog.find({ author: user._id, status: 'draft' })
            .skip((draftsPage - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 }),
        Blog.countDocuments({author: user._id, status: 'published' }),
        Blog.countDocuments({author: user._id, status: 'draft' })
    ]);

    const totalPublishedPages = Math.ceil(countPublishedBlog / limit);
    const totalDraftPages = Math.ceil(countDraftBlog / limit);
    return res.status(HTTP_STATUS.OK).render('profile', {
        user,
        blogs,
        drafts,
        countPublishedBlog,
        currentPublishedPage: page,
        totalPublishedPages,
        currentDraftPage: draftsPage,
        totalDraftPages
    });
});
