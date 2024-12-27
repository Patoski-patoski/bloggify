// middleware/errorHandler.js
import { HTTP_STATUS } from "../../constant.js";
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    console.error('Error Handler', err);

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};