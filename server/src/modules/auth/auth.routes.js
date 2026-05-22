import { Router } from 'express';
import { register, login, me } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login',    login);
authRoutes.get('/me',        requireAuth, me);
