// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// =================================================================================
// INITIALISATION DES TABLES (VERSION CORRIGÉE)
// =================================================================================
async function setupDatabase() {
  console.log('Vérification et création des tables...');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS plan_comptable ( numero_compte TEXT PRIMARY KEY, libelle TEXT NOT NULL, classe INTEGER );
      CREATE TABLE IF NOT EXISTS journaux ( code TEXT PRIMARY KEY, libelle TEXT NOT NULL );
      CREATE TABLE IF NOT EXISTS tiers ( code TEXT PRIMARY KEY, nom TEXT NOT NULL, type TEXT, compte_general TEXT REFERENCES plan_comptable(numero_compte) );
      CREATE TABLE IF NOT EXISTS articles ( code TEXT PRIMARY KEY, designation TEXT NOT NULL UNIQUE, unite TEXT, compte_stock TEXT REFERENCES plan_comptable(numero_compte), quantite NUMERIC(15,4) DEFAULT 0 );
      
      CREATE TABLE IF NOT EXISTS envois (
        id TEXT PRIMARY KEY, nom TEXT NOT NULL, client_code TEXT REFERENCES tiers(code),
        article_code TEXT REFERENCES articles(code), quantite INTEGER, statut TEXT DEFAULT 'actif',
        total_produits NUMERIC(15,2) DEFAULT 0, total_charges NUMERIC(15,2) DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS factures (
        id SERIAL PRIMARY KEY, numero_facture TEXT, date_facture DATE NOT NULL, libelle TEXT,
        montant NUMERIC(15, 2), type_facture TEXT NOT NULL, envoi_id TEXT REFERENCES envois(id),
        code_tiers TEXT REFERENCES tiers(code), nature_produit TEXT, pays_origine TEXT,
        compagnie_maritime TEXT, port_embarquement TEXT, nomenclature_douaniere TEXT,
        domiciliation TEXT, poids_brut NUMERIC(15, 2), tare NUMERIC(15, 2),
        poids_net NUMERIC(15, 2) GENERATED ALWAYS AS (poids_brut - tare) STORED
      );

      CREATE TABLE IF NOT EXISTS lignes_facture (
        id SERIAL PRIMARY KEY, facture_id INTEGER REFERENCES factures(id) ON DELETE CASCADE,
        description TEXT, quantite NUMERIC, prix NUMERIC
      );

      CREATE TABLE IF NOT EXISTS ecritures (
        id SERIAL PRIMARY KEY, journal_code TEXT NOT NULL REFERENCES journaux(code),
        date DATE NOT NULL, numero_piece TEXT, libelle_operation TEXT,
        compte_general TEXT REFERENCES plan_comptable(numero_compte), code_tiers TEXT REFERENCES tiers(code),
        libelle_ligne TEXT, debit NUMERIC(15,2) DEFAULT 0, credit NUMERIC(15,2) DEFAULT 0,
        is_deleted BOOLEAN DEFAULT FALSE, envoi_id TEXT REFERENCES envois(id), facture_id INTEGER REFERENCES factures(id)
      );

      CREATE TABLE IF NOT EXISTS mouvements_stock (
        id SERIAL PRIMARY KEY, date DATE NOT NULL, type TEXT NOT NULL,
        article_code TEXT NOT NULL REFERENCES articles(code),
        quantite NUMERIC(15,4) NOT NULL, document_ref TEXT
      );

      CREATE TABLE IF NOT EXISTS numerotation_factures (
        annee INTEGER, type_facture TEXT, dernier_numero INTEGER, PRIMARY KEY (annee, type_facture)
      );
    `);
    console.log('✅ Les tables sont prêtes.');
  } catch (err) {
    console.error('❌ Erreur initialisation tables:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

// =================================================================================
// UTILITAIRES
// =================================================================================
function generateEnvoiId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  return `ENVOI-${y}${m}${d}-${timestamp}`;
}

// --- Génération automatique du numéro de facture ---
async function generateNumeroFacture(type_facture = 'Proforma') {
  const date = new Date();
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');

  const client = await pool.connect();
  try {
      await client.query('BEGIN');

      // On verrouille la ligne pour éviter les conflits
      const res = await client.query(
          'SELECT dernier_numero FROM numerotation_factures WHERE annee=$1 AND type_facture=$2 FOR UPDATE',
          [annee, type_facture]
      );

      let nextNum = 1;
      if (res.rows.length > 0) {
          nextNum = res.rows[0].dernier_numero + 1;
          await client.query(
              'UPDATE numerotation_factures SET dernier_numero=$1 WHERE annee=$2 AND type_facture=$3',
              [nextNum, annee, type_facture]
          );
      } else {
          await client.query(
              'INSERT INTO numerotation_factures (annee, type_facture, dernier_numero) VALUES ($1,$2,$3)',
              [annee, type_facture, nextNum]
          );
      }

      await client.query('COMMIT');
      
      // --- CORRECTION DU FORMAT ICI ---
      const prefixe = type_facture === 'Proforma' ? 'FP' : 'FD';
      const numeroFormate = String(nextNum).padStart(4, '0');
      
      return `${prefixe}-${annee}-${mois}-${numeroFormate}`;
  } catch (err) {
      await client.query('ROLLBACK');
      throw err;
  } finally {
      client.release();
  }
}

// =================================================================================
// ROUTES DE L'API
// =================================================================================

// --- Racine ---
app.get('/', (req, res) => res.send('API de comptabilité fonctionnelle !'));

// --- PLAN COMPTABLE ---
app.get('/api/comptes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plan_comptable ORDER BY numero_compte ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- JOURNAUX ---
app.get('/api/journaux', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM journaux ORDER BY code ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TIERS ---
app.get('/api/tiers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tiers ORDER BY code ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Création d'un tiers ---
app.post('/api/tiers', async (req, res) => {
  const { nom, type = 'Client', compte_general } = req.body;

  if (!nom) return res.status(400).json({ error: 'Le champ "nom" est obligatoire.' });

  const client = await pool.connect();
  try {
    // Génération automatique du code
    const code = 'TIERS-' + Date.now(); // tu peux adapter le format si nécessaire

    const result = await client.query(`
      INSERT INTO tiers (code, nom, type, compte_general)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [code, nom, type, compte_general || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23503') return res.status(400).json({ error: 'Le compte général n\'existe pas.' });
    if (err.code === '23505') return res.status(409).json({ error: 'Un tiers avec ce code existe déjà.' });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// --- ARTICLES ---
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY designation ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/articles', async (req, res) => {
  const { code, designation, unite, compteStock } = req.body;
  try {
    await pool.query(
      'INSERT INTO articles (code, designation, unite, compte_stock) VALUES ($1,$2,$3,$4)',
      [code, designation, unite, compteStock]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: `Code ou désignation existant.` });
    res.status(500).json({ error: err.message });
  }
});

// --- ENVOIS ---
app.get('/api/envois', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        a.designation
      FROM envois e
      LEFT JOIN articles a ON e.article_code = a.code
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des envois:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/envois', async (req, res) => {
  const {
    nom,
    client_code,
    article_code,
    designation,
    quantite,
    total_produits = 0,
    total_charges = 0,
    statut = "actif"
  } = req.body;

  if (!nom || !client_code || !article_code || !designation || quantite == null) {
    return res.status(400).json({ error: "Les champs nom, client_code, article_code, designation et quantite sont obligatoires." });
  }

  const client = await pool.connect();
  try {
    const id = generateEnvoiId();
    const insertResult = await client.query(`
      INSERT INTO envois (
        id, nom, client_code, statut,
        total_produits, total_charges,
        designation, quantite, article_code
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [id, nom, client_code, statut, total_produits, total_charges, designation, Number(quantite), article_code]);

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23503') return res.status(400).json({ error: "Le client_code ou article_code n'existe pas." });
    if (err.code === '23505') return res.status(409).json({ error: "ID d'envoi déjà existant." });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/envois/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, client_code, article_code, statut, total_produits, total_charges } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE envois
      SET nom=$1, client_code=$2, article_code=$3, statut=$4, total_produits=$5, total_charges=$6
      WHERE id=$7 RETURNING *
    `, [nom, client_code, article_code, statut, total_produits, total_charges, id]);
    if (result.rowCount === 0) return res.status(404).json({ message: `Envoi avec ID ${id} non trouvé` });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// --- ECRITURES ---
app.get('/api/ecritures', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ecritures WHERE is_deleted = FALSE ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/ecritures', async (req, res) => {
  const { journal_code, date, numero_piece, libelle_operation, compte_general, code_tiers, libelle_ligne, debit, credit, envoi_id } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO ecritures (journal_code,date,numero_piece,libelle_operation,compte_general,code_tiers,libelle_ligne,debit,credit,envoi_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
    `, [journal_code, date, numero_piece, libelle_operation, compte_general, code_tiers, libelle_ligne, debit, credit, envoi_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// --- MOUVEMENTS DE STOCK ---
app.get('/api/mouvements', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.date, m.type, m.quantite, m.document_ref, a.designation
      FROM mouvements_stock m
      JOIN articles a ON m.article_code = a.code
      ORDER BY m.date DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/mouvements', async (req, res) => {
  const { type, article_code, quantite, document_ref } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      INSERT INTO mouvements_stock (date,type,article_code,quantite,document_ref)
      VALUES (NOW(),$1,$2,$3,$4)
    `, [type, article_code, quantite, document_ref]);
    await client.query('COMMIT');
    res.status(201).json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// GET toutes les factures
app.get('/api/factures', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, t.nom AS client_nom
      FROM factures f
      LEFT JOIN tiers t ON f.code_tiers = t.code
      ORDER BY f.date_facture DESC, f.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST pour créer une nouvelle facture (Proforma)
app.post('/api/factures', async (req, res) => {
  console.log("Requête POST /api/factures reçue:", req.body);
  const client = await pool.connect();
  try {
    const {
      date_facture, libelle, montant, envoi_id, code_tiers,
      nature_produit, pays_origine, compagnie_maritime, port_embarquement,
      nomenclature_douaniere, domiciliation, poids_brut, tare, lignes
    } = req.body;

    await client.query('BEGIN');

    // Générer le numéro de facture ici
    const numero_facture = await generateNumeroFacture('Proforma');

    const factureRes = await client.query(`
      INSERT INTO factures (
        numero_facture, date_facture, libelle, montant, type_facture, envoi_id, code_tiers,
        nature_produit, pays_origine, compagnie_maritime, port_embarquement,
        nomenclature_douaniere, domiciliation, poids_brut, tare
      ) VALUES ($1, $2, $3, $4, 'Proforma', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      numero_facture, date_facture, libelle, montant, envoi_id, code_tiers,
      nature_produit, pays_origine, compagnie_maritime, port_embarquement,
      nomenclature_douaniere, domiciliation, poids_brut, tare
    ]);
    const newFacture = factureRes.rows[0];

    // Insertion des lignes de facture
    if (lignes && lignes.length > 0) {
      for (const ligne of lignes) {
        await client.query(
          'INSERT INTO lignes_facture (facture_id, description, quantite, prix) VALUES ($1, $2, $3, $4)',
          [newFacture.id, ligne.description, ligne.quantite, ligne.prix]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(newFacture);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur création facture :', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// --- FACTURE UNIQUE ---
app.get('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Récupérer la facture
    const factureRes = await pool.query(`
      SELECT f.*, t.nom AS client_nom, t.code AS client_code
      FROM factures f
      LEFT JOIN tiers t ON f.code_tiers = t.code
      WHERE f.id = $1
      LIMIT 1
    `, [id]);

    if (factureRes.rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    const facture = factureRes.rows[0];

    // 2️⃣ Récupérer les lignes associées
    const lignesRes = await pool.query(`
      SELECT * FROM facture_lignes WHERE facture_id = $1
    `, [id]);

    facture.lignes = lignesRes.rows;

    res.json(facture);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- MISE À JOUR FACTURE ---
app.put('/api/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_facture, date_facture, libelle, montant, type_facture, envoi_id, code_tiers } = req.body;

    const result = await pool.query(`
      UPDATE factures
      SET 
        numero_facture = COALESCE($1, numero_facture),
        date_facture = COALESCE($2, date_facture),
        libelle = COALESCE($3, libelle),
        montant = COALESCE($4, montant),
        type_facture = COALESCE($5, type_facture),
        envoi_id = COALESCE($6, envoi_id),
        code_tiers = COALESCE($7, code_tiers)
      WHERE id = $8
      RETURNING *
    `, [numero_facture, date_facture, libelle, montant, type_facture, envoi_id, code_tiers, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST pour créer une nouvelle facture (Proforma)
app.post('/api/factures', async (req, res) => {
  console.log("Requête POST /api/factures reçue:", req.body);
  const client = await pool.connect();
  try {
    const {
      date_facture, libelle, montant, envoi_id, code_tiers,
      nature_produit, pays_origine, compagnie_maritime, port_embarquement,
      nomenclature_douaniere, domiciliation, poids_brut, tare, 
      lignes = [] // Récupérer le tableau de lignes
    } = req.body;

    await client.query('BEGIN');

    // Étape 1 : Générer le numéro de facture (si vous utilisez la fonction du backend)
    const numero_facture = await generateNumeroFacture('Proforma');

    // Étape 2 : Insérer la facture principale et récupérer son ID
    const factureRes = await client.query(`
      INSERT INTO factures (
        numero_facture, date_facture, libelle, montant, type_facture, envoi_id, code_tiers,
        nature_produit, pays_origine, compagnie_maritime, port_embarquement,
        nomenclature_douaniere, domiciliation, poids_brut, tare
      ) VALUES ($1, $2, $3, $4, 'Proforma', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      numero_facture, date_facture, libelle, montant, envoi_id, code_tiers,
      nature_produit, pays_origine, compagnie_maritime, port_embarquement,
      nomenclature_douaniere, domiciliation, poids_brut, tare
    ]);
    const nouvelleFacture = factureRes.rows[0];
    console.log("Facture principale créée avec l'ID:", nouvelleFacture.id);

    // --- CORRECTION : Utilisation du nom de table 'facture_lignes' ---
    if (lignes && lignes.length > 0) {
      console.log(`Insertion de ${lignes.length} lignes de facture...`);
      for (const ligne of lignes) {
        await client.query(
          'INSERT INTO facture_lignes (facture_id, description, quantite, prix, article_code) VALUES ($1, $2, $3, $4, $5)',
          [nouvelleFacture.id, ligne.description, ligne.quantite, ligne.prix, ligne.articleCode || null]
        );
      }
      console.log("Toutes les lignes ont été insérées.");
    }

    await client.query('COMMIT');
    res.status(201).json(nouvelleFacture);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création de la facture :', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// =================================================================================
// CONVERSION FACTURE PROFORMA -> DÉFINITIVE (NOUVELLE LOGIQUE)
// =================================================================================
app.put('/api/factures/convertir/:id', async (req, res) => {
  const { id: proformaId } = req.params;
  const { date_facture, numero_facture_definitif, libelle, montant, compte_general, code_tiers, envoi_id, lignes } = req.body;
  const client = await pool.connect();

  console.log(`Début de la conversion pour la facture Proforma ID: ${proformaId}`);

  try {
    await client.query('BEGIN');

    // Étape 1 : Vérifier si la facture Proforma existe et n'est pas déjà convertie
    const proformaRes = await client.query('SELECT * FROM factures WHERE id = $1 AND type_facture = $2', [proformaId, 'Proforma']);
    if (proformaRes.rowCount === 0) {
      throw new Error("Facture Proforma non trouvée ou déjà convertie.");
    }
    const factureProforma = proformaRes.rows[0];

    // Étape 2 : Créer la nouvelle facture Définitive
    const definitiveResult = await client.query(
      `INSERT INTO factures (
         numero_facture, date_facture, libelle, montant, type_facture, 
         envoi_id, code_tiers, facture_origine_id
         -- Copier les autres champs pertinents de la proforma
       ) VALUES ($1, $2, $3, $4, 'Definitive', $5, $6, $7)
       RETURNING *`,
      [
        numero_facture_definitif,
        date_facture,
        libelle,
        montant,
        factureProforma.envoi_id,
        factureProforma.code_tiers,
        proformaId // <-- On lie la nouvelle facture à l'ancienne
      ]
    );
    const factureDefinitive = definitiveResult.rows[0];
    console.log("Nouvelle facture Définitive créée:", factureDefinitive);

    // Étape 3 (Optionnel mais recommandé) : Mettre à jour le statut de la Proforma
    await client.query(
      `UPDATE factures SET statut = 'Convertie' WHERE id = $1`,
      [proformaId]
    );
    console.log(`Statut de la facture Proforma ID ${proformaId} mis à jour.`);

    // Étape 4 : Créer les écritures comptables pour la facture Définitive
    // Écriture débit client
    await client.query(
      `INSERT INTO ecritures (journal_code, date, numero_piece, libelle_operation, compte_general, code_tiers, envoi_id, facture_id, debit)
       VALUES ('VE', $1, $2, $3, $4, $5, $6, $7, $8)`,
      [date_facture, numero_facture_definitif, libelle, compte_general, code_tiers, envoi_id, factureDefinitive.id, montant]
    );
    // Écriture crédit produit
    await client.query(
      `INSERT INTO ecritures (journal_code, date, numero_piece, libelle_operation, compte_general, envoi_id, facture_id, credit)
       VALUES ('VE', $1, $2, $3, '707', $4, $5, $6)`,
      [date_facture, numero_facture_definitif, libelle, envoi_id, factureDefinitive.id, montant]
    );
    console.log("Écritures comptables créées avec succès.");

    await client.query('COMMIT');
    res.status(201).json(factureDefinitive); // On renvoie la nouvelle facture définitive

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Erreur lors de la conversion de la facture ID ${proformaId}:`, err);
    res.status(500).json({ error: "Erreur serveur lors de la conversion.", details: err.message });
  } finally {
    client.release();
  }
});

// =================================================================================
// LANCEMENT DU SERVEUR
// =================================================================================
setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`✅ Serveur backend démarré sur http://localhost:${port}`);
  });
}).catch(err => {
  console.error("❌ Impossible de démarrer le serveur.", err);
});
