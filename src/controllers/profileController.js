// controller/profileController.js
import asyncHandler from 'express-async-handler';
import Blog from '../models/Blog.js';
import User from '../models/User.js';

export const profile = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    const blogs = await Blog.find({ author: user._id });
    console.log("user_id", user);
    // console.log(blogs);
    return res.render('profile', {
        blogs,
        user,
    });
});