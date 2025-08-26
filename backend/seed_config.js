// backend/seed_config.js

require('dotenv').config();
const { Pool } = require('pg');

const JOURNAUX_DE_BASE = [
    { code: 'AC', libelle: 'Achats' },
    { code: 'VE', libelle: 'Ventes' },
    { code: 'BQ', libelle: 'Banque' },
    { code: 'CA', libelle: 'Caisse' },
    { code: 'OD', libelle: 'Opérations Diverses' },
];

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedJournaux() {
  const client = await pool.connect();
  try {
    console.log('Insertion des journaux de base...');
    for (const journal of JOURNAUX_DE_BASE) {
      // ON CONFLICT DO NOTHING évite les erreurs si le journal existe déjà
      await client.query(
        'INSERT INTO journaux (code, libelle) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [journal.code, journal.libelle]
      );
    }
    console.log('✅ Journaux de base insérés ou déjà présents.');
  } catch (err) {
    console.error('❌ Erreur lors du seeding des journaux:', err);
  } finally {
    await client.release();
    await pool.end();
  }
}

seedJournaux();