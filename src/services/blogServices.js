// services/blogService.js
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import {HTTP_STATUS} from '../../constant.js';

export const findUserByUsername = async(username) => {
    return await User.findOne({username});
};

export const getBlogsByAuthor = async (userId, page = 1, limit = 6) => {
    const skip = (page - 1) * limit;

    const [blogs, totalCount] = await Promise.all([
        Blog.find({author: userId, status: 'published'})
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1})
        .populate('author', 'username profilePicture bio'),
        Blog.countDocuments({ author: userId, status: 'published'})
    ]);
    return {
        blogs,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalBlogs: totalCount
    };
}
