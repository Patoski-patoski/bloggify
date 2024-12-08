// routes/authRoutes.js
import { Router } from 'express';
import { register, login, logout, refreshTokens } from '../controllers/authControllers.js';

const authRouter = Router();


authRouter.get(['/signup', '/register'], (_req, res, next) => res.render('signup'));
authRouter.get('/login', (_req, res, next) => res.render('login'));
authRouter.get('/logout', (_req, res, next) => res.render('login'));
authRouter.get('/contact', (_req, res, next) => res.render('contact'));
authRouter.get('/about', (_req, res, next) => res.render('about'));
authRouter.get('/single', (_req, res, next) => res.render('single'));

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh-token', refreshTokens);
authRouter.post('/logout', logout);

export default authRouter;


