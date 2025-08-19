
import Joi from 'joi';

const blogSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    subtitle: Joi.string().max(255).optional(),
    content: Joi.string().min(10).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('draft', 'published').optional(),
    image: Joi.string().uri().optional()
});

export const validateBlog = (req, res, next) => {
    const { error } = blogSchema.validate(req.body);
    if (error) {
        // For a web route, you might render an error page
        // For an API, you would send a JSON response
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
