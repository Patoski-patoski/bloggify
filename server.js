import app from './app.js';
import connectMongoDB from './src/database/database.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    connectMongoDB();
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
