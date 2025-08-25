require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 5000, 
});

async function setupAndImport() {
    let client;
    try {
        console.log('Tentative de connexion à la base de données...');
        client = await pool.connect();
        console.log('✅ Connexion à PostgreSQL réussie !');
        
        // --- NOUVEAU : On s'assure que la table existe AVANT d'essayer d'insérer ---
        console.log('Vérification de l\'existence de la table "plan_comptable"...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS plan_comptable (
                numero_compte TEXT PRIMARY KEY,
                libelle TEXT NOT NULL,
                classe INTEGER
            );
        `);
        console.log('Table "plan_comptable" prête.');
        
    } catch (err) {
        console.error('❌ ERREUR: Impossible de préparer la base de données.');
        console.error('Détails de l\'erreur:', err.message);
        await pool.end();
        return;
    } finally {
        if (client) client.release();
    }

    // --- Suite du script d'importation (inchangé) ---
    try {
        const jsonString = fs.readFileSync('pcg-2005-flat.json', 'utf8');
        const planComptable = JSON.parse(jsonString);
        const comptes = planComptable.comptes;

        console.log(`Importation de ${comptes.length} comptes...`);
        
        const sql = `
            INSERT INTO plan_comptable(numero_compte, libelle, classe) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (numero_compte) DO NOTHING
        `;
        
        let count = 0;
        for (const compte of comptes) {
            const res = await pool.query(sql, [compte.numero.toString(), compte.nom, compte.classe]);
            if (res.rowCount > 0) count++;
        }

        console.log(`✅ Importation terminée. ${count} nouveaux comptes ajoutés.`);

    } catch (err) {
        console.error('❌ Erreur durant l\'importation des données :', err);
    } finally {
        await pool.end();
        console.log('Script terminé, connexion à la base de données fermée.');
    }
}

setupAndImport();