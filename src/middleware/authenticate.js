// middleware/authenticate.js

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).render('unauthorized', {
            message: 'Authentication required. Please log in to create a blog post.',
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decode user info to req object
        res.locals.user = decoded; // Make user info available in EJS templates
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token Expired" });
        }
        return res.status(403).json({ message: "Invalid token" });
    }
}

export default authenticateToken;
