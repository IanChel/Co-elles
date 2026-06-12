const express = require('express');
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const protect = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configuration de Multer pour stocker les images localement
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/kyc');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.user._id + '-' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max par fichier
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées.'));
    }
  },
});

// ============================================
// POST /api/kyc/verify
// Upload de la CI et du selfie, puis OCR
// ============================================
router.post(
  '/verify',
  protect,
  upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files['idCard'] || !req.files['selfie']) {
        return res.status(400).json({ message: 'La carte d\'identité et le selfie sont requis.' });
      }

      const idCardFile = req.files['idCard'][0];
      const selfieFile = req.files['selfie'][0];

      // 1. Lancer l'OCR sur la carte d'identité avec Tesseract
      // On utilise la langue française ('fra') et anglaise ('eng') pour maximiser les chances de lecture
      const ocrResult = await Tesseract.recognize(idCardFile.path, 'fra+eng', {
        logger: (m) => console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`),
      });

      const extractedText = ocrResult.data.text.toLowerCase();
      console.log('--- OCR Extracted Text ---');
      console.log(extractedText);
      console.log('--------------------------');

      const userFirstName = req.user.firstName.toLowerCase().trim();
      const userLastName = req.user.lastName.toLowerCase().trim();

      console.log(`Recherche du prénom: "${userFirstName}" ou du nom: "${userLastName}"`);

      // 2. Vérification simple : Est-ce que le nom ou le prénom est présent sur la carte ?
      const isNameFound = extractedText.includes(userLastName) || extractedText.includes(userFirstName);
      console.log('Résultat de la vérification :', isNameFound);

      if (!isNameFound) {
        // En cas d'échec, on peut supprimer les fichiers
        fs.unlinkSync(idCardFile.path);
        fs.unlinkSync(selfieFile.path);
        
        return res.status(400).json({
          message: 'Vérification échouée : Nous n\'avons pas pu lire votre nom ou prénom sur la pièce d\'identité. Veuillez réessayer avec une photo plus nette.',
          details: { ocrExtracted: false },
        });
      }

      // 3. Mise à jour de l'utilisateur
      req.user.isKYCVerified = true;
      await req.user.save();

      // (Optionnel) : En production, on pourrait supprimer les fichiers ici pour respecter la RGPD,
      // ou les déplacer vers un bucket AWS S3 sécurisé.

      res.json({
        message: 'Identité vérifiée avec succès ! 🎉',
        isKYCVerified: true,
      });
    } catch (error) {
      console.error('Erreur KYC:', error);
      res.status(500).json({ message: 'Erreur lors de la vérification de l\'identité.', error: error.message });
    }
  }
);

module.exports = router;
