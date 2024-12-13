// middleware/errorHandler.js
import { HTTP_STATUS } from "../../constant.js";
export const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};