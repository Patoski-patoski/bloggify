// exp-test.js
import { jest, describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals';
import request from "supertest";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { SALT_ROUNDS, HTTP_STATUS } from '../constant.js';
import app from "../app.js";
import { setupTestDatabase, closeTestDatabase } from '../setup.js';
import User from '../src/models/User.js';
// import { JWT_SECRET, REFRESH_JWT_SECRET } from '../config.js';

jest.setTimeout(30000);

let server;
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await setupTestDatabase();
    let port = 3003
    server = app.listen(port, (err) => {
        if (err) {
            console.error(`Error starting server on port ${port}:`, err.message);
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is in use. Trying port ${port + SALT_ROUNDS}...`);
                server = app.listen(port + SALT_ROUNDS); // Try the next port
            }
        } else {
            console.log(`Server is running on port ${port}`);
        }
    });
    console.log(server.address()['port']);
});

afterAll(async () => {
    await closeTestDatabase();
    await server.close();
    await server.closeAllConnections();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('API Tests', () => {
    describe('GET/api/hello', () => {
        test('should return a hello message', async () => {
            const res = await request(app)
                .get('/tester')
                // .expect('Content-Type', /json/)
                .expect(HTTP_STATUS.OK);

            expect(res.body.message).toBe('Hello, world!');
        });
    });
});

describe('POST /register', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    const validUser = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password',
        bio: 'User bio content'
    };
    
    test('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/register')
            .send(validUser)
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

    test('should return 409 if validuser credential exists', async () => {
        await User.create({
            ...validUser,
            password: await bcrypt.hash(validUser.password, SALT_ROUNDS)
        });
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
        await User.deleteMany({});
    });

    const testUser = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password',
        bio: 'User bio content',
        role: 'author'
    };

    const createTestUser = async () => {
        const hashedPassword = await bcrypt.hash(testUser.password, SALT_ROUNDS);
        return User.create({
            ...testUser,
            password: hashedPassword
        })
    }

    test('should login a user successfully with correct credentials', async () => {
        await createTestUser();

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

        // Check cookies
        const cookies = res.headers['set-cookie'];
        expect(cookies).toHaveLength(2);
        expect(cookies[0]).toMatch(/accessToken/);
        expect(cookies[1]).toMatch(/refreshToken/);

        // Verfify tokens
        const accessToken = cookies[0].split(';')[0].split('=')[1];
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        expect(decodedToken).toHaveProperty('email', testUser.email);
    });

    test('should fail with incorrect password', async () => {
        await createTestUser();

        const res = await request(app)
            .post('/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            })
            .expect(HTTP_STATUS.UNAUTHORIZED);
        
        expect(res.body).toEqual({
            message: 'Invalid credentials'
        });
        expect(res.headers['set-cookie']).toBeUndefined();
    });

    test('should store refresh token in database', async () => {
        await createTestUser();

        const res = await request(app)
            .post('/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        const user = await User.findOne({ email: testUser.email }).select('+refreshToken');
        expect(user.refreshToken).toBeDefined();

        const refreshToken = res.headers['set-cookie'][1].split(';')[0].split('=')[1];
        expect(user.refreshToken).toBe(refreshToken);
    });
});