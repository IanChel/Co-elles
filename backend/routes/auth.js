const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();

// Configuration Multer pour l'avatar
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Nom unique basé sur l'ID utilisateur
    const ext = path.extname(file.originalname);
    cb(null, req.user._id + '-avatar-' + Date.now() + ext);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées.'));
    }
  },
});

// --- Générer un JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ============================================
// POST /api/auth/register
// Inscription d'une nouvelle utilisatrice
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Vérifier si l'email est déjà utilisé (en ignorant la casse)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisatrice (le hook pre-save hash le password)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || '',
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isKYCVerified: user.isKYCVerified,
      averageRating: user.averageRating,
      ratingCount: user.ratingCount,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/auth/login
// Connexion d'une utilisatrice existante
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisatrice ET inclure le password (select: false par défaut)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isKYCVerified: user.isKYCVerified,
      averageRating: user.averageRating,
      ratingCount: user.ratingCount,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/auth/me
// Profil de l'utilisatrice connectée (protégé)
// ============================================
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// ============================================
// POST /api/auth/avatar
// Upload de la photo de profil (protégé)
// ============================================
router.post('/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie.' });
    }

    // Supprimer l'ancien avatar s'il existe
    if (req.user.avatar) {
      const oldAvatarFilename = req.user.avatar.split('/uploads/avatars/').pop();
      if (oldAvatarFilename) {
        const oldPath = path.join(__dirname, '../uploads/avatars', oldAvatarFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // Construire l'URL publique de l'avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Mettre à jour le champ avatar dans MongoDB
    req.user.avatar = avatarUrl;
    await req.user.save();

    res.json({
      message: 'Photo de profil mise à jour ! 📸',
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error('Erreur upload avatar:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload.', error: error.message });
  }
});

module.exports = router;
