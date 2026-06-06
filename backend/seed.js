// Insère les données de démonstration (mot de passe haché par bcrypt).
// Lancer : npm run seed
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const PASSWORD = 'demo1234';   // mot de passe de tous les comptes démo

const drivers = [
  ['Camille Laurent', 'camille@demo.fr', '0612345678', 'conductrice', true, 4.9],
  ['Inès Moreau',     'ines@demo.fr',    '0623456789', 'conductrice', true, 4.8],
  ['Sarah Benali',    'sarah@demo.fr',   '0634567890', 'conductrice', true, 5.0],
  ['Léa Dubois',      'lea@demo.fr',     '0645678901', 'passagere',   true, 4.7],
];

const trips = [
  [1, 'Gare de Lyon, Paris',       'La Défense',           '2026-06-16 18:30:00', 3, 6.50, 'Silence, Non-fumeur'],
  [2, 'Campus Jussieu, Paris',     'Courbevoie',           '2026-06-16 19:00:00', 2, 5.00, 'Musique, Discussion'],
  [3, 'Hôpital Pitié-Salpêtrière', 'Vincennes',            '2026-06-16 22:15:00', 3, 7.00, 'Silence, Trajet de nuit'],
  [1, 'Châtelet, Paris',           'Boulogne-Billancourt', '2026-06-17 08:00:00', 1, 4.50, 'Musique, Animaux OK'],
];

async function run() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  await pool.query('DELETE FROM bookings');
  await pool.query('DELETE FROM trips');
  await pool.query('DELETE FROM users');
  await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');
  await pool.query('ALTER TABLE trips AUTO_INCREMENT = 1');

  for (const [name, email, phone, role, cert, score] of drivers) {
    await pool.query(
      'INSERT INTO users (name,email,phone,password,role,is_certified,trust_score) VALUES (?,?,?,?,?,?,?)',
      [name, email, phone, hash, role, cert, score]
    );
  }
  for (const t of trips) {
    await pool.query(
      'INSERT INTO trips (driver_id,origin,destination,departure_time,seats,price,preferences) VALUES (?,?,?,?,?,?,?)',
      t
    );
  }
  console.log(`✅ Données de démo insérées. Connexion : camille@demo.fr / ${PASSWORD}`);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
