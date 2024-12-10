// routes/profileRoutes
import { Router } from 'express';
import authorizeRole from '../middleware/authorize.js';
import { authenticateToken } from '../controllers/authControllers.js';
import { profile } from '../controllers/profileController.js';


const profileRouter = Router()

// profile page
profileRouter.get('/profile', profile);

export default profileRouter;
