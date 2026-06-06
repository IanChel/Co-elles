-- ============================================================
--  Co-Elles — Schéma de base de données (MySQL)
--  À importer dans MySQL Workbench (File > Open SQL Script, puis ⚡)
--  Crée la base et les tables. Les données de démo sont ajoutées
--  ensuite par le backend :  cd backend && npm run seed
-- ============================================================

DROP DATABASE IF EXISTS co_elles;
CREATE DATABASE co_elles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE co_elles;

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  phone         VARCHAR(30)   NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  role          ENUM('passagere','conductrice') NOT NULL DEFAULT 'passagere',
  is_certified  BOOLEAN       NOT NULL DEFAULT FALSE,
  trust_score   DECIMAL(2,1)  NOT NULL DEFAULT 5.0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trips (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  driver_id      INT NOT NULL,
  origin         VARCHAR(160) NOT NULL,
  destination    VARCHAR(160) NOT NULL,
  departure_time DATETIME     NOT NULL,
  seats          INT          NOT NULL DEFAULT 3,
  price          DECIMAL(6,2) NOT NULL,
  preferences    VARCHAR(255) DEFAULT NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  trip_id       INT NOT NULL,
  passenger_id  INT NOT NULL,
  status        ENUM('confirmee','annulee','terminee') NOT NULL DEFAULT 'confirmee',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id)      REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT '✅ Base co_elles + tables créées. Lance maintenant : cd backend && npm run seed' AS message;
