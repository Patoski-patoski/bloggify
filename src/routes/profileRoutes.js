// routes/profileRoutes
import { Router } from 'express';
import authorizeRole from '../middleware/authorize.js';
import { authenticateToken } from '../middleware/authenticate.js';

import { profile } from '../controllers/profileController.js';


const profileRouter = Router()

// profile page
profileRouter.get('/profile', authenticateToken, profile);

export default profileRouter;
