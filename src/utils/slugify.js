// utils/slugify.js
import slugify from 'slugify';
import Blog from '../models/Blog.js';

const generateUniqueSlug = async (title) => {
    try {
        let slug = slugify(title, { lower: true, trim: true });
        slug = slug.substring(0, 50); // Limit to 50 characters.
        let exists = await Blog.findOne({ slug, status: 'published' });
        let count = 1;

        while (exists) {
            slug = `${slugify(title, { lower: true })}-${count}`;
            exists = await Blog.findOne({ slug });
            count++;
        }
        return slug;

    } catch (error) {
        console.error(error);
        throw new Error('Unable to generate slug');
    }
};

export default generateUniqueSlug;
    