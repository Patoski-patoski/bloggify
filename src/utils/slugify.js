// utils/slugify.js
import slugify from 'slugify';
import Blog from '../models/Blog.js';

/**
 * Generates a unique slug for a blog post
 * @param {string} title - The title to slugify
 * @param {string} [existingSlug] - Optional existing slug to preserve when updating
 * @return {Promise<string>} The unique slug
 */
const generateUniqueSlug = async (title, existingSlug = null) => {
    try {
        // If updating an existing blog and we have its slug, just return it
        if (existingSlug) {
            return existingSlug;
        }

        // Create a new slug
        let slug = slugify(title, { lower: true, trim: true });
        slug = slug.substring(0, 50); // Limit to 50 characters

        let exists = await Blog.findOne({ slug });
        let count = 1;

        // Keep checking until we find a unique slug
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