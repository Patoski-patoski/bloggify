// config.js
import dotenv from 'dotenv';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
    dotenv.config();
}

export default {
    mongodb: {
        url: process.env.MONGODB_URI_ATLAS,
        dbName: 'blog',       
    },
    redis: {
        username: process.env.REDIS_USERNAME || 'default',
        url: process.env.REDIS_URL,
        token: process.env.REDIS_REST_TOKEN,
        port: process.env.REDIS_PORT || '6379',
        tls: isProd ? {} : undefined
    },
    server: {
        port: process.env.PORT || 3000,
        hostname: process.env.HOSTNAME,
        trustProxy: isProd, //Enable behind a reverse proxy (heroku, vercel)
    },
    // session: {
    //     secret: getSessionSecret(),
    //     name: 'sessionId',
    //     cookie: {
    //         maxAge: 12 * 60 * 60 * 1000, /* 12 hours */
    //         secure: isProd,
    //         httpOnly: true,
    //         sameSite: isProd ? 'none' : 'lax',
    //         domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
    //     },
    //     rolling: true,
    // },
    security: {
        cors: {
            origin: isProd ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT'],
            exposedHeaders: ['Content-Range'],
            maxAge: 3600
        },
        rateLimit: {
            windowMs: 10 * 60 * 1000,
            max: 130,
            skipSuccessfulRequests: true,
            message: "To many requests, Please try again later",
            keyGenerator: (req, res) => {
                // Use X-Forwarded-For header if trust proxy is set
                return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            }
        },
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'",
                        "https://cdn.jsdelivr.net/",
                        "https://cdnjs.cloudflare.com",
                        "'unsafe-inline'",
                        "https://code.jquery.com",
                        "https://cdn.tiny.cloud/",
                        "https://stackpath.bootstrapcdn.com/"
                    ],
                    fontSrc: [
                        "'self'",
                        "https://fonts.googleapis.com",
                        "https://fonts.gstatic.com",
                        "https://cdnjs.cloudflare.com/",
                    ],
                    styleSrc: [
                        "'self'",
                        "https://cdn.jsdelivr.net/",
                        "https://fonts.googleapis.com/",
                        "https://cdnjs.cloudflare.com/",
                        "'unsafe-inline'"
                    ]
                }
            }
        }
    },
    environment: process.env.NODE_ENV || 'production',
}

