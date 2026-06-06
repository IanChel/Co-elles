// Connexion a MySQL (pool de connexions)
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'co_elles',
  waitForConnections: true,
  connectionLimit: 10,
});

// Petit test de connexion au demarrage
pool.getConnection()
  .then(conn => { console.log('✅ Connecté à MySQL (base co_elles)'); conn.release(); })
  .catch(err => console.error('❌ Erreur connexion MySQL :', err.message));
