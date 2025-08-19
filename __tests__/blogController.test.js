// blogController.test.js
import request from "supertest";

import { jest, describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { startTestServer, closeTestServer, clearUsers, createTestUser } from '../testUtils.js';
import Blog from '../src/models/Blog.js';
import User from '../src/models/User.js';
import app from "../app.js";

jest.setTimeout(30000);

beforeAll(async () => {
    await startTestServer();
});

afterAll(async () => {
    await closeTestServer();
});

beforeEach(async () => {
    await clearUsers();
});

describe('POST /blogs', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password',
        bio: 'User bio content',
        role: 'author'
    };

    const mockBlogData = {
        title: 'Test Blog',
        subtitle: 'Test Subtitle',
        content: 'This is a test blog post with enough content to pass validation',
        status: 'published',
        image: 'http://example.com/test-image.jpg'
    };

    test('should create a new blog post with authentication', async () => {
        await createTestUser(testUser);
        
        // First, login to get cookies
        const loginResponse = await request(app)
            .post('/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });
        
        const cookies = loginResponse.headers['set-cookie'];
        
        // Create blog post using cookies from login
        const blogResponse = await request(app)
            .post('/blogs/publish')
            .set('Cookie', cookies)
            .send(mockBlogData)
            .expect(201);

        expect(blogResponse.body).toMatchObject({
            message: 'Blog created successfully',
            blog: expect.objectContaining({
                title: mockBlogData.title,
                subtitle: mockBlogData.subtitle
            })
        });

        // Verify blog was created in database
        const blog = await Blog.findOne({ title: mockBlogData.title });
        expect(blog).toBeTruthy();
        expect(blog.author.toString()).toBe((await User.findOne({ email: testUser.email }))._id.toString());
    });
});

describe('PUT /blogs/update/:slug', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password',
        bio: 'User bio content',
        role: 'author'
    };

    let blogToUpdate;
    let cookies;

    beforeEach(async () => {
        await createTestUser(testUser);
        const user = await User.findOne({ email: testUser.email });

        blogToUpdate = await Blog.create({
            title: 'Original Title',
            subtitle: 'Original Subtitle',
            content: 'Original content for the blog post.',
            author: user._id,
            slug: 'original-title',
            status: 'published'
        });

        const loginResponse = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: testUser.password });
        cookies = loginResponse.headers['set-cookie'];
    });

    test('should update a blog post successfully', async () => {
        const updates = {
            title: 'Updated Title',
            subtitle: 'Updated Subtitle'
        };

        const response = await request(app)
            .put(`/blogs/update/${blogToUpdate.slug}`)
            .set('Cookie', cookies)
            .send(updates)
            .expect(200);

        expect(response.body.message).toBe('Blog Updated');
        expect(response.body.blog.title).toBe(updates.title);

        const updatedBlog = await Blog.findById(blogToUpdate._id);
        expect(updatedBlog.title).toBe(updates.title);
        expect(updatedBlog.subtitle).toBe(updates.subtitle);
    });
});

describe('DELETE /blogs/:slug', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password',
        bio: 'User bio content',
        role: 'author'
    };

    let blogToDelete;
    let cookies;

    beforeEach(async () => {
        await createTestUser(testUser);
        const user = await User.findOne({ email: testUser.email });

        blogToDelete = await Blog.create({
            title: 'To Be Deleted',
            content: 'This blog will be deleted.',
            author: user._id,
            slug: 'to-be-deleted',
            status: 'published'
        });

        const loginResponse = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: testUser.password });
        cookies = loginResponse.headers['set-cookie'];
    });

    test('should delete a blog post successfully', async () => {
        const response = await request(app)
            .delete(`/blogs/${blogToDelete.slug}`)
            .set('Cookie', cookies)
            .expect(200);

        expect(response.body.message).toBe('Blog deleted successfully');
        expect(response.body.deletedSlug).toBe(blogToDelete.slug);

        const deletedBlog = await Blog.findById(blogToDelete._id);
        expect(deletedBlog).toBeNull();
    });
});

describe('GET /:username/blogs/:slug', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password',
        bio: 'User bio content',
        role: 'author'
    };

    let publicBlog;

    beforeEach(async () => {
        await createTestUser(testUser);
        const user = await User.findOne({ email: testUser.email });

        publicBlog = await Blog.create({
            title: 'Public Blog Post',
            content: 'This is a public blog post.',
            author: user._id,
            slug: 'public-blog-post',
            status: 'published'
        });
    });

    test('should return a blog post page for a published blog', async () => {
        const response = await request(app)
            .get(`/${testUser.username}/blogs/${publicBlog.slug}`)
            .expect(200);

        expect(response.text).toContain(publicBlog.title);
    });

    test('should return 404 for a non-existent blog', async () => {
        await request(app)
            .get(`/${testUser.username}/blogs/non-existent-slug`)
            .expect(404);
    });
});
