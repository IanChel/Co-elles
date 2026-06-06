# Co-Elles — Démo locale (Web)

> La première application de covoiturage 100% féminin sécurisée.
> Stack : **React (Vite)** + **Node/Express** + **MySQL**.

## Architecture
```
co-elles/
├── database/schema.sql   →  base MySQL (à importer dans Workbench)
├── backend/              →  API REST (Express + MySQL)
└── frontend/             →  Application web (React, format mobile)
```
Le frontend appelle l'API → l'API parle à MySQL. (Une app ne se connecte jamais
directement à la base : l'API Express est le pont obligatoire.)

---

## 1) Base de données (MySQL Workbench)
1. Ouvre **MySQL Workbench**.
2. `File > Open SQL Script` → choisis `database/schema.sql`.
3. Clique sur l'éclair ⚡ pour exécuter. La base `co_elles` est créée avec des
   trajets et des comptes de démo.

## 2) Backend (API)
```bash
cd backend
cp .env.example .env        # puis mets ton mot de passe MySQL dans .env
npm install
npm run seed                # insère les comptes + trajets de démo (à faire 1 fois)
npm run dev                 # démarre l'API
```
→ API sur http://localhost:4000

## 3) Frontend (App web)
```bash
cd frontend
npm install
npm run dev
```
→ App sur http://localhost:5173 (s'ouvre dans le navigateur, en format téléphone)

---

## Compte de démonstration
- Email : **camille@demo.fr**
- Mot de passe : **demo1234**

(ou créez un nouveau compte → il passera par l'étape KYC)

## Parcours de démo (≈2 min)
Inscription → vérification KYC (badge Certifiée) → recherche de trajet →
réservation chez une conductrice vérifiée → suivi GPS en temps réel →
partage Anges Gardiens → bouton **SOS**.

## Ce qui est réel vs simulé
- **Réel** : base MySQL, API, inscription/connexion (mots de passe hachés bcrypt),
  trajets, réservations (vrai CRUD).
- **Simulé (mock)** pour la démo : vérification KYC, position GPS, alerte SOS,
  services d'urgence. (À brancher sur de vrais prestataires « après l'école ».)

## Étape suivante : version mobile
La base et l'API sont **réutilisables telles quelles**. Pour le mobile :
créer un projet **Expo (React Native)** qui appelle la même API (`http://<IP-PC>:4000`).
Seuls les écrans sont à réécrire en composants React Native.
