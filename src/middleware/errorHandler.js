// middleware/errorHandler.js
import { HTTP_STATUS } from '../../config/constant.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error Handler:', err);

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';

    // For API routes, send JSON
    if (req.originalUrl.startsWith('/api')) {
        return res.status(statusCode).json({
            status: 'error',
            statusCode,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // For web routes, render an error page
    res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message
    });
};