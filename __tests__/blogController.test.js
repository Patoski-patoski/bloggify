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
        content: 'Test Content',
        status: 'published',
        image: 'test-image.jpg'
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
            .post('/blogs')
            .set('Cookie', cookies)
            .send(mockBlogData)
            .expect(201);

        expect(blogResponse.body).toMatchObject({
            message: 'Blog post created',
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

    test('should fail to create blog post without authentication', async () => {
        const res = await request(app)
        .post('/blogs')
        .send(mockBlogData)
        .expect(403);

        expect(res.body.message).toBe('Access token is required');
    });
});
