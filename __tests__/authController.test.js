// authController.test.js
import bcrypt from 'bcrypt';
import request from "supertest";

import { jest, describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { startTestServer, closeTestServer, clearUsers, createTestUser } from '../testUtils.js';
import { HTTP_STATUS } from '../config/constant.js';
import app from "../app.js";
import User from '../src/models/User.js';

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

describe('API Tests', () => {
    describe('GET/api/hello', () => {
        test('should return a hello message', async () => {
            const res = await request(app)
                .get('/tester')
                .expect('Content-Type', /json/)
                .expect(HTTP_STATUS.OK);

            expect(res.body.message).toBe('Hello, world!');
        });
    });

    describe('POST /register', () => {
        const validUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password',
            bio: 'User bio content'
        };

        test('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/register')
                .send(validUser)
                .expect('Content-Type', /json/)
                .expect(HTTP_STATUS.CREATED);

            expect(res.body).toEqual({
                message: 'User created successfully',
                user: expect.objectContaining({
                    username: validUser.username,
                    email: validUser.email,
                    bio: validUser.bio
                })
            });

            const user = await User.findOne({ email: validUser.email }).select('+password');
            expect(user).toBeTruthy();
            expect(await bcrypt.compare(validUser.password, user.password)).toBe(true);
        });

        test('should return 409 if valid user credential exists', async () => {
            await createTestUser(validUser);
            const res = await request(app)
                .post('/register')
                .send(validUser)
                .expect('Content-Type', /json/)
                .expect(HTTP_STATUS.CONFLICT);

            expect(res.body.message).toBe('User with this email or username already exists');
        });
    });

    describe('POST /login', () => {
        beforeEach(async () => {
            await clearUsers();
        });

        const testUser = {
            username: 'testuser',
            email: 'test@email.com',
            password: 'password',
            bio: 'User bio content',
            role: 'author'
        };

        test('should login a user successfully with correct credentials', async () => {
            await createTestUser(testUser);

            const res = await request(app)
                .post('/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(res.body).toEqual({
                message: 'Login successful',
                user: expect.objectContaining({
                    username: testUser.username,
                    email: testUser.email,
                    role: testUser.role
                })
            });
        });

        // Additional login tests...
    });
});
