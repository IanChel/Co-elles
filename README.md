# 🚗 Co-Elles — Le Covoiturage 100% Féminin et Sécurisé

**Co-Elles** est une application mobile innovante dédiée à la mobilité des femmes. Conçue pour offrir un espace de confiance, de sororité et de sécurité, elle permet aux femmes de voyager ensemble en toute sérénité.

---

## 🛠️ Stack Technique

Le projet repose sur une architecture moderne, robuste et orientée temps réel :

### Frontend (Application Mobile)
- **Framework :** React Native avec Expo (SDK 54)
- **Navigation :** Expo Router (File-based routing)
- **UI & Design :** React Native Paper (Material Design 3), animations fluides (Animated API)
- **Cartographie :** `react-native-maps` et `expo-location` (géocodage en temps réel)
- **Caméra & Fichiers :** `expo-image-picker`
- **Temps Réel :** `socket.io-client`

### Backend (Serveur & API)
- **Environnement :** Node.js & Express.js
- **Base de Données :** MongoDB avec Mongoose (modélisation des données)
- **Temps Réel :** Socket.io (serveur WebSockets)
- **Sécurité :** JWT (JSON Web Tokens) & Bcrypt (hachage des mots de passe)
- **Traitement d'Image & OCR :** Multer (upload), Tesseract.js (reconnaissance de caractères pour le KYC)

---

## ✨ Fonctionnalités Actuelles

L'application intègre d'ores et déjà un panel complet de fonctionnalités pour assurer un service de bout en bout :

### 🛡️ Sécurité & Confiance au premier plan
- **Vérification d'Identité (KYC) :** Capture de la carte d'identité via l'appareil photo et extraction du texte par Intelligence Artificielle (OCR avec Tesseract.js) pour garantir que chaque utilisatrice est bien celle qu'elle prétend être.
- **Bouton SOS d'Urgence :** Écran dédié permettant d'alerter instantanément des contacts de confiance avec transmission de la position GPS exacte (via géocodage temps réel) et cartographie native.
- **Profils Vérifiés :** Avatar personnalisable, notes et avis de la communauté (système d'étoiles).

### 📍 Covoiturage & Mobilité
- **Recherche Avancée :** Barre de recherche style "Airbnb" avec filtrage multicritères rapide côté client (ville de départ, arrivée, date, places disponibles).
- **Publication & Réservation :** Création intuitive de trajets, gestion des places assises et de l'état du trajet (ouvert/complet).
- **Cartographie Intégrée :** Visualisation des itinéraires de voyage sur des mini-cartes interactives avec points de départ et d'arrivée, et redirections vers les applications de navigation natives (Apple Maps, Google Maps).

### 💬 Communication
- **Messagerie Temps Réel :** Chat intégré en direct (propulsé par Socket.io) permettant aux conductrices et passagères d'échanger avant le départ de manière fluide.

---

## 🚀 Vision Ambition & Fonctionnalités Futures

Co-Elles ne compte pas s'arrêter là. Notre vision est de devenir le standard de la mobilité féminine avec des fonctionnalités technologiques de pointe :

1. **🧠 Matching Prédictif (IA) :** Un algorithme d'Intelligence Artificielle suggérant les meilleurs trajets et profils compatibles en fonction des habitudes de voyage, des horaires et des affinités (musique, discussion, etc.).
2. **💳 Paiement In-App & Wallet Sécurisé :** Intégration de Stripe pour bloquer les fonds à la réservation et libérer le paiement à la conductrice à l'arrivée. Un portefeuille virtuel (Wallet) pour gérer ses gains et virements instantanés.
3. **📡 Live Tracking Partagé :** Possibilité de générer un lien de suivi GPS en direct envoyé automatiquement à des contacts de confiance pour qu'ils puissent suivre le déplacement du véhicule sur une carte de bout en bout.
4. **👁️ Authentification Biométrique :** Connexion via Face ID / Touch ID pour fluidifier l'expérience, et vérification biométrique aléatoire lors des départs pour certifier que la conductrice correspond bien au profil enregistré.
5. **🏆 Gamification & Sororité :** Un système de fidélité avec des niveaux et des badges (ex: "Super Conductrice", "Ambianceuse", "Ponctuelle") débloquant des avantages exclusifs ou des réductions.
6. **🚆 Mobilité Multimodale :** Intégration avec les API des transports en commun locaux pour suggérer à l'utilisatrice comment terminer son "dernier kilomètre" une fois déposée par sa conductrice.

---

## 💻 Comment lancer le projet localement ?

L'application n'étant pas encore déployée en production, voici les instructions pour faire tourner l'application et le serveur en local.

### 1. Démarrer le Backend (API & Serveur)

Ouvrez un terminal, placez-vous dans le dossier `backend/` et suivez ces étapes :

```bash
cd backend
npm install
# Créez un fichier .env à la racine du backend avec vos variables (PORT=5000, MONGO_URI, JWT_SECRET)
node server.js
```
Le serveur devrait indiquer : `🚀 Serveur Co-Elles démarré sur le port 5000`.

### 2. Démarrer le Frontend (Application Mobile)

**Important :** Assurez-vous que l'adresse IP de votre machine locale est bien configurée dans `frontend/services/api.js` (`API_BASE_URL`), par exemple `http://192.168.1.10:5000/api`.

Ouvrez un nouveau terminal, placez-vous dans le dossier `frontend/` et lancez Expo :

```bash
cd frontend
npm install
npx expo start --clear
```

- **Pour tester sur votre téléphone :** Téléchargez l'application **Expo Go** (iOS/Android), connectez votre téléphone au même réseau Wi-Fi que votre ordinateur, et scannez le QR code affiché dans le terminal.
- **Pour tester sur émulateur :** Appuyez sur `a` (pour Android) ou `i` (pour iOS) dans le terminal.

---

*Fait avec passion pour redéfinir la mobilité.*
