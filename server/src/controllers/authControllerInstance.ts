/**
 * Contrôleur d'authentification adaptés pour les bases de données isolées par instance
 * Utilise la configuration dynamique de la BDD
 */

import { Request, Response } from 'express';
import { getDatabaseForInstance } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'logicai-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Crée un compte dans la BDD de l'instance
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    // Récupérer l'instance ID depuis les variables d'environnement
    const instanceId = process.env.INSTANCE_ID || 'default-instance';

    // Utiliser la configuration de BDD pour cette instance
    const prisma = getDatabaseForInstance(instanceId);

    // Vérifier si l'email existe déjà dans CET instance
    // L'isolation est garantie par la base de données séparée par instance
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà dans cette instance',
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans la BDD de l'instance
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Retourner l'utilisateur créé (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: userWithoutPassword,
        token,
      instanceId, // Important: pour isoler les bases de données!
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: error.message,
    });
  }
};

// Connecter un utilisateur avec sa BDD isolée
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    // Récupérer l'instance ID
    const instanceId = process.env.INSTANCE_ID || 'default-instance';

    // Utiliser la configuration de BDD pour cette instance
    const prisma = getDatabaseForInstance(instanceId);

    // Trouver l'utilisateur dans CET instance
    // L'isolation est garantie par la base de données séparée par instance
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token,
        instanceId,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message,
    });
  }
};

// Récupérer le profil utilisateur (avec sa BDD isolée)
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant',
      });
    }

    // Décoder et vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }

    // Récupérer l'instance ID
    const instanceId = process.env.INSTANCE_ID || 'default-instance';

    // Utiliser la configuration de BDD pour cette instance
    const prisma = getDatabaseForInstance(instanceId);

    // Récupérer l'utilisateur avec sa BDD isolée
    // L'isolation est garantie par la base de données séparée par instance
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profil récupéré avec succès',
      data: {
        user: userWithoutPassword,
        instanceId,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};
