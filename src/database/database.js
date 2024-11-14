//database.js

import mongoose from 'mongoose';
import config from '../config.js';

const MONGODB_URI = config.mongodb.url || 'mongodb://127.0.0.1/blog';

export async function connectMongoDB() {
    try {
        mongoose.connect(MONGODB_URI, {
            dbName: config.mongodb.dbName
        });
        console.log('mongoDB connected');
    } catch (error) {
        console.error('Failed to connect to mongogDB', err);
        process.exit(1);
    }
}
