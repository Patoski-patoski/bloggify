//database.js

import mongoose from 'mongoose';
import config from '../../config/config.js';

const MONGODB_URI = config.mongodb.urls || 'mongodb://127.0.0.1/blog';

export default async function connectMongoDB() {
    try {
        mongoose.connect(MONGODB_URI, {
            dbName: config.mongodb.dbName
        });
        console.log('mongoDB connected');
    } catch (error) {
        console.error('Failed to connect to mongogDB', error);
        process.exit(1);
    }
}
