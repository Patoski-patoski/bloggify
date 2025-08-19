// routes/authRoutes.js
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { register, login, logout, tester } from '../controllers/authControllers.js';


const docRouter = Router();
const swaggerDoc = YAML.load('./swagger.yaml');

docRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Example route
docRouter.get('/', (req, res) => {
    res.send('Hello World!');
});

docRouter.get('/users', (req, res) => {
    res.json([{ id: '1', name: 'John Doe' }, {id: '2', name: "Paul" }]);
});


docRouter.get(['/signup', '/register'], (_req, res) => res.render('signup'));
docRouter.get('/login', (_req, res) => res.render('login'));
docRouter.get('/logout', (_req, res) => res.render('login'));
docRouter.get('/contact', (_req, res) => res.render('contact'));
docRouter.get('/about', (_req, res) => res.render('about'));
docRouter.get('/single', (_req, res) => res.render('single'));

docRouter.post(['/register', '/signup'], register);
docRouter.post('/login', login);
docRouter.post('/logout', logout);
docRouter.get('/tester', tester);

export default docRouter;
