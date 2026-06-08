const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // --- Extraire le token du header Authorization ---
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé — aucun token fourni' });
  }

  try {
    // --- Vérifier et décoder le token ---
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- Trouver l'utilisatrice (sans le password) ---
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé — utilisatrice introuvable' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Non autorisé — token invalide' });
  }
};

module.exports = protect;
