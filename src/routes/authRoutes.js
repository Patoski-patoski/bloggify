// routes/authRoutes.js
import { Router } from 'express';

import { register, login, logout, tester } from '../controllers/authControllers.js';

const authRouter = Router();


authRouter.get(['/signup', '/register'], (_req, res) => res.render('signup'));
authRouter.get('/login', (_req, res) => res.render('login'));
authRouter.get('/logout', (_req, res) => res.render('login'));
authRouter.get('/contact', (_req, res) => res.render('contact'));
authRouter.get('/about', (_req, res) => res.render('about'));
authRouter.get('/single', (_req, res) => res.render('single'));

authRouter.post(['/register', '/signup'], register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/tester', tester);

export default authRouter;
