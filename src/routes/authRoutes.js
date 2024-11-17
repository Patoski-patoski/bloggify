// routes/authRoutes.js
import { Router } from 'express';
import { register, login } from '../controllers/authControllers.js';

const authRouter = Router();


authRouter.get(['/', '/home'], (_req, res, next) => res.render('index'));
authRouter.get('/signup', (_req, res, next) => res.render('signup'));
authRouter.get('/login', (_req, res, next) => res.render('login'));

authRouter.get('/contact', (_req, res, next) => res.render('contact'));
authRouter.get('/create_blog', (_req, res, next) => res.render('create_blog'));
authRouter.get('/blog', (_req, res, next) => res.render('blog'));

authRouter.get('/about', (_req, res, next) => res.render('about'));
authRouter.get('/single', (_req, res, next) => res.render('single'));

authRouter.post('/register', register);
authRouter.post('/login', login);

export default authRouter;