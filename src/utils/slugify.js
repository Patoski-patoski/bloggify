import slugify from 'slugify';
import Blog from '../models/Blog.js';

const generateUniqueSlug = async (title) => {
    try {
        let slug = slugify(title, { lower: true });
        let exists = await Blog.findOne({ slug });
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
