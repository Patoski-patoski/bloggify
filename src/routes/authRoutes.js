import { join } from 'path';
import { Router } from 'express';
import { register, login } from '../controllers/authControllers.js';

const authRouter = Router();


authRouter.get('/', (_req, res, next) => {
    res.render('index');
});
authRouter.get('/index', (_req, res, next) => {
    res.render('index');
});

authRouter.get('/home', (_req, res, next) => {
    res.render('index');
});

authRouter.get('/contact', (_req, res, next) => {
    res.render('contact');
});

authRouter.get('/blog', (_req, res, next) => {
    res.render('blog');
});
authRouter.get('/about', (_req, res, next) => {
    res.render('about');
});
authRouter.get('/single', (_req, res, next) => {
    res.render('single');
});
authRouter.post('/register', register);
authRouter.post('/login', login);

export default authRouter;