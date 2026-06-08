# Co-Elles - MVP 🚗🚺

Bienvenue sur le dépôt du MVP de l'application **Co-Elles**, une plateforme de covoiturage sécurisée dédiée aux femmes, avec des fonctionnalités avancées de vérification (KYC) et de sécurité (bouton SOS avec tracking GPS en temps réel).

Ce projet est divisé en deux parties principales :
- `backend/` : Une API REST robuste développée avec **Node.js, Express et MongoDB**.
- `frontend/` : Une application mobile multiplateforme développée avec **React Native et Expo**.

---

## 🛠️ Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :
1. **Node.js** (version 18 ou supérieure)
2. **MongoDB** (ou une URI MongoDB Atlas valide)
3. **L'application Expo Go** installée sur votre téléphone physique :
   - [Télécharger Expo Go pour iOS (App Store)](https://apps.apple.com/fr/app/expo-go/id982107779)
   - [Télécharger Expo Go pour Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🚀 Étape 1 : Démarrer le Backend

Le backend doit toujours tourner en premier, car c'est lui qui gère l'authentification et les données.

1. Ouvrez un terminal à la racine du projet et déplacez-vous dans le dossier backend :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Vérifiez la configuration de la base de données :
   - Ouvrez le fichier `backend/config/db.js` et assurez-vous que l'URI correspond à votre cluster MongoDB.
   - Par défaut, l'application utilise une configuration locale ou l'URI définie par votre équipe.
4. Lancez le serveur :
   ```bash
   npm start
   ```
   > Le terminal devrait afficher : `Serveur démarré sur le port 5000` et `MongoDB Connecté`.

---

## 📱 Étape 2 : Démarrer le Frontend (Application Mobile)

Le frontend doit se connecter au backend. Comme on teste sur un téléphone physique, l'application a besoin de l'adresse IP locale de votre ordinateur.

### Configuration préalable de l'IP
1. Cherchez l'adresse IP locale de votre ordinateur (Ex: `192.168.1.XX` ou `172.20.10.XX` si vous utilisez le partage de connexion).
2. Ouvrez le fichier `frontend/services/api.js`.
3. Modifiez l'URL de base pour remplacer `localhost` par votre IP :
   ```javascript
   // Exemple :
   const api = axios.create({
     baseURL: 'http://VOTRE_ADRESSE_IP:5000/api', 
   });
   ```

### Lancement de l'application
1. Ouvrez un **nouveau** terminal (sans fermer celui du backend) et déplacez-vous dans le frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install --legacy-peer-deps
   ```
3. Lancez le serveur Expo (avec le flag `--clear` pour éviter les bugs de cache) :
   ```bash
   npm run start -- --clear
   ```
   > Un énorme QR Code va apparaître dans votre terminal.

---

## 🍏 Comment tester sur iOS (iPhone)
1. Assurez-vous que votre iPhone est connecté sur le **même réseau WiFi** que votre ordinateur (ou en partage de connexion avec votre ordi).
2. Ouvrez simplement l'application **Appareil Photo** native de votre iPhone.
3. Pointez l'appareil photo vers le QR Code affiché dans le terminal.
4. Une notification jaune d'Apple "Ouvrir dans Expo Go" va apparaître. Cliquez dessus.
5. L'application va se compiler (ça peut prendre quelques secondes) et s'ouvrir sur votre téléphone !

## 🤖 Comment tester sur Android
1. Assurez-vous que votre téléphone Android est connecté sur le **même réseau WiFi** que votre ordinateur.
2. Ouvrez l'application **Expo Go** que vous avez téléchargée.
3. Sur l'écran d'accueil d'Expo Go, cliquez sur **"Scan QR Code"**.
4. Pointez la caméra vers le QR Code affiché dans votre terminal.
5. L'application va se charger et s'ouvrir !

---

## 💡 Notes pour la Démo MVP
- **Création de compte** : L'inscription est fonctionnelle. Le flux redirige automatiquement vers le mock KYC.
- **Création et Recherche de trajets** : Tout est interconnecté avec MongoDB ! Ce que vous publiez s'affiche dans les recherches dynamiques.
- **Bouton SOS** : L'application vous demandera la permission GPS pour utiliser le radar de secours. Vous pouvez copier et partager votre position via le système natif du téléphone.

🎉 Bonne soutenance !
