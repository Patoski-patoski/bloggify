// middleware/authenticate.js

import jwt, { decode } from "jsonwebtoken";
import { HTTP_STATUS } from "../../constant.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const acceptHeader = req.headers.accept;

    if (!accessToken) {
        if (acceptHeader && acceptHeader.includes('application/json')) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required. Please log in to create a blog post.",
            });
        }
        return res.status(401).render('unauthorized', {
            message: 'Authentication required. Please log in to create a blog post.',
        });
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded; // Attach decoded user info to req object
        res.locals.user = decoded; // Make user info available in EJS templates
        next();

    } catch (error) {
        if (acceptHeader && acceptHeader.includes('application/json')) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                error: "Forbidden",
                message: "Invalid or expired access token.",
            });
        }
        return res.status(HTTP_STATUS.FORBIDDEN).render('unauthorized', {
            message: "Invalid or expired access token.",
        });
    }
};
