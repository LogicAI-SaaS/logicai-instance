import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'logicai-secret-key-change-in-production';

// Étendre l'interface Request pour inclure userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans le header Authorization et ajoute userId à la requête
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    // Extraire le token (format: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format de token invalide',
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Ajouter les infos utilisateur à la requête
    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
    });
  }
};

/**
 * Middleware optionnel - ne fait que vérifier le token sans échouer
 * Utile pour les routes qui fonctionnent avec ou sans authentification
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Pas de token, continuer sans auth
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
      req.user = decoded;
    } catch (error) {
      // Token invalide, continuer sans auth
      console.warn('Invalid token provided:', error);
    }

    next();
  } catch (error: any) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};
