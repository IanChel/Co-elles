// ============================================================
//  Co-Elles — API REST (Express + MySQL)
//  Lancer :  npm install  puis  npm run dev
// ============================================================
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();
const app = express();
app.use(cors());            // autorise le frontend a appeler l'API
app.use(express.json());

// --- Petit utilitaire pour ne pas repeter les try/catch ---
const wrap = (fn) => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// =========================================================
//  AUTHENTIFICATION
// =========================================================

// Inscription
app.post('/api/register', wrap(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'Champs manquants' });

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)',
    [name, email, phone, hash, role || 'passagere']
  );
  const [rows] = await pool.query('SELECT id,name,email,phone,role,is_certified,trust_score FROM users WHERE id=?', [result.insertId]);
  res.status(201).json(rows[0]);
}));

// Connexion
app.post('/api/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
  if (rows.length === 0) return res.status(401).json({ error: 'Identifiants invalides' });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

  delete user.password;
  res.json(user);
}));

// =========================================================
//  KYC (mocké) — valide le badge Certifiée
// =========================================================
app.post('/api/users/:id/certify', wrap(async (req, res) => {
  await pool.query('UPDATE users SET is_certified=TRUE WHERE id=?', [req.params.id]);
  const [rows] = await pool.query('SELECT id,name,email,phone,role,is_certified,trust_score FROM users WHERE id=?', [req.params.id]);
  res.json(rows[0]);
}));

// Profil
app.get('/api/users/:id', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT id,name,email,phone,role,is_certified,trust_score FROM users WHERE id=?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Introuvable' });
  res.json(rows[0]);
}));

// =========================================================
//  TRAJETS
// =========================================================

// Lister les trajets (avec infos conductrice + badge)
app.get('/api/trips', wrap(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS driver_name, u.is_certified AS driver_certified, u.trust_score AS driver_score
    FROM trips t
    JOIN users u ON u.id = t.driver_id
    ORDER BY t.departure_time ASC
  `);
  res.json(rows);
}));

// Detail d'un trajet
app.get('/api/trips/:id', wrap(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS driver_name, u.is_certified AS driver_certified, u.trust_score AS driver_score
    FROM trips t JOIN users u ON u.id = t.driver_id WHERE t.id=?
  `, [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Introuvable' });
  res.json(rows[0]);
}));

// Creer un trajet
app.post('/api/trips', wrap(async (req, res) => {
  const { driver_id, origin, destination, departure_time, seats, price, preferences } = req.body;
  const [result] = await pool.query(
    'INSERT INTO trips (driver_id,origin,destination,departure_time,seats,price,preferences) VALUES (?,?,?,?,?,?,?)',
    [driver_id, origin, destination, departure_time, seats || 3, price, preferences || null]
  );
  res.status(201).json({ id: result.insertId });
}));

// =========================================================
//  RESERVATIONS
// =========================================================
app.post('/api/bookings', wrap(async (req, res) => {
  const { trip_id, passenger_id } = req.body;
  const [result] = await pool.query(
    'INSERT INTO bookings (trip_id, passenger_id) VALUES (?,?)',
    [trip_id, passenger_id]
  );
  // decremente une place
  await pool.query('UPDATE trips SET seats = GREATEST(seats-1,0) WHERE id=?', [trip_id]);
  res.status(201).json({ id: result.insertId, status: 'confirmee' });
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API Co-Elles sur http://localhost:${PORT}`));
