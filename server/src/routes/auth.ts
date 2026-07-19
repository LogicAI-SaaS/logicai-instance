import { Router } from 'express';
import { register, login, getMe } from '../controllers/authControllerInstance';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscrire un nouvel utilisateur
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Connecter un utilisateur
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les infos de l'utilisateur connecté
 * @access  Private (nécessite un token valide)
 */
router.get('/me', authMiddleware, getMe);

export default router;
