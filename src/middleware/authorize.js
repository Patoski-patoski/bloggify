// middleware/authorize.js

const authorizeRole = (role) => (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'Access denied. No user role found.' });
    }

    // Use strict equality and ensure both values are strings
    if (req.user.role.toString() !== role.toString()) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
};

export default authorizeRole;