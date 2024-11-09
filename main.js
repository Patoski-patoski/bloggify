import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import express from 'express';
import cookieParser from 'cookie-parser';
import { connectMongoDB, User } from "./database.js";

const app = express();
app.use(express.json());
app.use(cookieParser())

const userData = {};
const JWT_SECRET = ';,lmnyt6t7ye8u9i--x,,..8883';


app.get('/', (req, res) => {
    res.json({ message: "Index Page" });
});

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing Credentials" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPAssword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPAssword
        });
        await newUser.save();
        res.status(200).json({ message: `New user created: ${username}` });


    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
        console.error(error);
    }

});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing Credentials" });
    }
    try {
        const validEmail = await User.findOne({ email });
        if (!validEmail) {
            return res.status(400).json({message: "Invalid email or password"});
        }

        const isPasswordValid = await bcrypt.compare(password, validEmail.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or Password" });
        }
        const token = jwt.sign(
            { userId: validEmail._id, role: validEmail.role, email: validEmail.email },
            JWT_SECRET,
            { expiresIn: '1h' });

        res.cookie('token', token, {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to Login User" });
    }
});

connectMongoDB();


app.listen(3000, () => {
    console.log(`Listening live at port ${process.env.PORT}`);
});
