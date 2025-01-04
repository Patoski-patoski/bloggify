// testUtils.js
import request from "supertest";
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './constant.js';
import app from "./app.js";
import User from './src/models/User.js';
import { setupTestDatabase, closeTestDatabase } from './setup.js';

export let server;

export const startTestServer = async () => {
    process.env.NODE_ENV = 'test';
    await setupTestDatabase();
    let port = 3003;

    server = app.listen(port, (err) => {
        if (err) {
            console.error(`Error starting server on port ${port}:`, err.message);
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is in use. Trying port ${port + SALT_ROUNDS}...`);
                server = app.listen(port + SALT_ROUNDS); // Try the next 10 port
            }
        } else {
            console.log(`Server is running on port ${port}`);
        }
    });
};

export const closeTestServer = async () => {
    await closeTestDatabase();
    await server.close();
    await server.closeAllConnections();
};

export const createTestUser = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    return User.create({
        ...userData,
        password: hashedPassword
    });
};

export const clearUsers = async () => {
    await User.deleteMany({});
};
