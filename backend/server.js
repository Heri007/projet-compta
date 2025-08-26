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
        poids_net NUMERIC(15, 2),
        facture_origine_id INT REFERENCES factures(id)
      );

      CREATE TABLE IF NOT EXISTS lignes_facture (
        id SERIAL PRIMARY KEY, facture_id INTEGER REFERENCES factures(id) ON DELETE CASCADE,
        description TEXT, quantite NUMERIC, prix NUMERIC, article_code TEXT
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

      CREATE TABLE IF NOT EXISTS taux_de_change (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        devise TEXT NOT NULL,
        valeur NUMERIC(15, 4) NOT NULL
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
// --- Génération automatique du numéro de facture ---
async function generateNumeroFacture(type_facture = 'Proforma') {
  const annee = new Date().getFullYear();
  const mois = String(new Date().getMonth() + 1).padStart(2, '0');

  const client = await pool.connect();
  try {
      await client.query('BEGIN');
      
      // CORRECTION : Utiliser `compteur` dans la requête SELECT
      const res = await client.query(
          'SELECT compteur FROM numerotation_factures WHERE annee=$1 AND type_facture=$2 FOR UPDATE',
          [annee, type_facture]
      );
      
      let nextNum = 1;
      if (res.rows.length > 0) {
          // CORRECTION : Utiliser `res.rows[0].compteur`
          nextNum = res.rows[0].compteur + 1;
          // CORRECTION : Mettre à jour la colonne `compteur`
          await client.query(
              'UPDATE numerotation_factures SET compteur=$1 WHERE annee=$2 AND type_facture=$3',
              [nextNum, annee, type_facture]
          );
      } else {
          // CORRECTION : Insérer dans la colonne `compteur`
          await client.query(
              'INSERT INTO numerotation_factures (annee, type_facture, compteur) VALUES ($1,$2,$3)',
              [annee, type_facture, nextNum]
          );
      }
      
      await client.query('COMMIT');
      
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
// --- Génération automatique du numéro de pièce d'écriture ---
async function generateNumeroPiece(journal_code, date) {
  const d = new Date(date);
  const prefixe = `${journal_code}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO numerotation_pieces (prefixe, dernier_numero)
       VALUES ($1, 1) 
       ON CONFLICT (prefixe) 
       DO UPDATE SET dernier_numero = numerotation_pieces.dernier_numero + 1
       RETURNING dernier_numero;`,
      [prefixe]
    );
    const nextNum = res.rows[0].dernier_numero;
    return `${prefixe}-${String(nextNum).padStart(4, '0')}`;
  } finally {
    client.release();
  }
}

// =================================================================================
// ROUTES DE L'API
// =================================================================================

// --- Racine ---
app.get('/', (req, res) => res.send('API de comptabilité fonctionnelle !'));

// --- GET COMPTES/PLAN COMPTABLE ---
app.get('/api/comptes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plan_comptable ORDER BY numero_compte ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET JOURNAUX ---
app.get('/api/journaux', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM journaux ORDER BY code ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET TIERS ---
app.get('/api/tiers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tiers ORDER BY code ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST TIERS  ---
app.post('/api/tiers', async (req, res) => {
  const { nom, type = 'Client', compte_general } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const date = new Date();
    const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const seqResult = await client.query(
      `INSERT INTO numerotations_client (prefix, dernier_numero)
       VALUES ($1, 1) ON CONFLICT (prefix) 
       DO UPDATE SET dernier_numero = numerotations_client.dernier_numero + 1
       RETURNING dernier_numero;`,
      [prefix]
    );
    const code = `${prefix}-${String(seqResult.rows[0].dernier_numero).padStart(3, '0')}`;

    const result = await client.query(
      `INSERT INTO tiers (code, nom, type, compte_general) VALUES ($1, $2, $3, $4) RETURNING *`,
      [code, nom, type, compte_general || null]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erreur dans POST /api/tiers:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// --- GET ARTICLES ---
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY designation ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- POST ARTICLES ---
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

// --- GET ECRITURES ---
app.get('/api/ecritures', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ecritures WHERE is_deleted = FALSE ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- POST ECRITURES ---
app.post('/api/ecritures', async (req, res) => {
  // On récupère le numero_piece envoyé par le frontend
  const { journal_code, date, libelleOperation, lignes, numero_piece: numeroPieceManuel } = req.body;
  const client = await pool.connect();

  // Validation simple des données reçues
  if (!journal_code || !date || !lignes || lignes.length === 0) {
    return res.status(400).json({ error: "Données incomplètes. Journal, date et au moins une ligne sont requis." });
  }

  try {
    // On démarre une transaction. Si une seule requête échoue, tout est annulé.
    await client.query('BEGIN');

    // --- LOGIQUE DE N° DE PIÈCE AMÉLIORÉE ---
    // Si un numéro est fourni manuellement, on l'utilise. Sinon, on le génère.
    const numero_piece_final = numeroPieceManuel || await generateNumeroPiece(journal_code, date);

    const ecrituresCrees = [];

    // On boucle sur chaque ligne d'écriture envoyée par le frontend
    for (const ligne of lignes) {
      // Le frontend envoie "compte", la BDD attend "compte_general". On fait la correspondance.
      const compteDeLaLigne = ligne.compte;
      const libelleDeLaLigne = ligne.libelle;
      const debitDeLaLigne = ligne.debit || 0;
      const creditDeLaLigne = ligne.credit || 0;
      const codeTiersDeLaLigne = ligne.codeTiers || null;

      // Sécurité : on s'assure qu'un compte a bien été fourni
      if (!compteDeLaLigne) {
        throw new Error("Chaque ligne d'écriture doit avoir un numéro de compte.");
      }

      // On insère la ligne dans la base de données
      const result = await client.query(`
        INSERT INTO ecritures (
          journal_code, date, numero_piece, libelle_operation, 
          compte_general, code_tiers, libelle_ligne, debit, credit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
      `, [
        journal_code,
        date,
        numero_piece_final,       // On utilise notre numéro final
        libelleOperation,   // Le même pour toutes les lignes
        compteDeLaLigne,    // Le compte spécifique à cette ligne
        codeTiersDeLaLigne,
        libelleDeLaLigne,
        debitDeLaLigne,
        creditDeLaLigne
      ]);
      ecrituresCrees.push(result.rows[0]);
    }

    // Si toutes les insertions ont réussi, on valide la transaction
    await client.query('COMMIT');
    res.status(201).json(ecrituresCrees); // On renvoie les nouvelles écritures

  } catch (err) {
    // En cas d'erreur, on annule TOUT ce qui a été fait
    await client.query('ROLLBACK');
    console.error("Erreur lors de la création des écritures:", err);
    res.status(500).json({ error: err.message, details: err.detail });
  } finally {
    client.release();
  }
});

// DELETE : Supprimer toutes les écritures d'une pièce
app.delete('/api/ecritures/piece/:numero_piece', async (req, res) => {
  const { numero_piece } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ecritures WHERE numero_piece = $1',
      [numero_piece]
    );
    // rowCount contient le nombre de lignes supprimées
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aucune écriture trouvée pour ce numéro de pièce.' });
    }
    res.status(200).json({ message: `${result.rowCount} ligne(s) d'écriture supprimée(s) avec succès.` });
  } catch (err) {
    console.error(`Erreur lors de la suppression de la pièce ${numero_piece}:`, err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
// --- GET MOUVEMENTS DE STOCK ---
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

// --- POST MOUVEMENTS DE STOCK ---
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

// --- GET ENVOIS ---
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
// --- POST ENVOIS ---
app.post('/api/envois', async (req, res) => {
  const { id, nom, client_code, article_code, quantite, statut = 'actif' } = req.body;

  // ✅ Validation minimale des champs obligatoires
  if (!id || !nom || !client_code || !article_code || !quantite) {
    return res.status(400).json({ error: "Informations de l'envoi incomplètes." });
  }

  try {
    // Insertion dans la table envois
    const result = await pool.query(
      `INSERT INTO envois (id, nom, client_code, article_code, quantite, statut)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, nom, client_code, article_code, quantite, statut]
    );

    const newEnvoi = result.rows[0];

    // Récupération de la designation via JOIN avec articles
    const envoiAvecDesignation = await pool.query(
      `SELECT e.*, a.designation
       FROM envois e
       LEFT JOIN articles a ON e.article_code = a.code
       WHERE e.id = $1`,
      [newEnvoi.id]
    );

    res.status(201).json(envoiAvecDesignation.rows[0]);

  } catch (err) {
    console.error("Erreur création envoi :", err);
    res.status(500).json({ error: err.message });
  }
});

// --- POST FACTURES ---
app.post('/api/factures', async (req, res) => {
  console.log("Requête POST /api/factures reçue:", req.body);
  const client = await pool.connect();
  try {
    const {
      date_facture, libelle, montant, envoi_id, code_tiers,
      nature_produit, pays_origine, compagnie_maritime, port_embarquement,
      nomenclature_douaniere, domiciliation, poids_brut, tare,
      poids_net, // <-- On récupère le poids net
      lignes = []
    } = req.body;

    if (!date_facture || !code_tiers) {
      return res.status(400).json({ error: "La date et le code client sont obligatoires." });
    }

    await client.query('BEGIN');
    const numero_facture = await generateNumeroFacture('Proforma');

    // ✅ 1. Insertion de la facture (avec poids_net)
    const factureRes = await client.query(`
      INSERT INTO factures (
        numero_facture, date_facture, libelle, montant, type_facture, envoi_id, code_tiers,
        nature_produit, pays_origine, compagnie_maritime, port_embarquement,
        nomenclature_douaniere, domiciliation, poids_brut, tare, poids_net
      ) VALUES ($1, $2, $3, $4, 'Proforma', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      numero_facture, date_facture, libelle, montant, envoi_id, code_tiers,
      nature_produit, pays_origine, compagnie_maritime, port_embarquement,
      nomenclature_douaniere, domiciliation, poids_brut, tare, poids_net // <-- On l'ajoute ici
    ]);
    const newFacture = factureRes.rows[0];

    // ✅ 2. Insertion des lignes (inchangé)
    let lignesInserées = [];
    if (lignes.length > 0) {
      for (const ligne of lignes) {
        const r = await client.query(
          `INSERT INTO lignes_facture (facture_id, description, quantite, prix, article_code) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [newFacture.id, ligne.description, ligne.quantite, ligne.prix, ligne.articleCode || null]
        );
        lignesInserées.push(r.rows[0]);
      }
    }

    await client.query('COMMIT');

    // ✅ 3. Retourner la facture avec ses lignes (inchangé)
    res.status(201).json({
      ...newFacture,
      lignes: lignesInserées
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur création facture :', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET FACTURES
app.get('/api/factures', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.*, 
        t.nom AS client_nom,
        -- Ajoute une colonne 'est_convertie' qui sera TRUE si une facture définitive la référence
        EXISTS (
          SELECT 1 FROM factures AS def 
          WHERE def.facture_origine_id = f.id
        ) AS est_convertie
      FROM factures f
      LEFT JOIN tiers t ON f.code_tiers = t.code
      ORDER BY f.date_facture DESC, f.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET FACTURES ID
app.get('/api/factures/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`--- Début GET /api/factures/${id} ---`);
  
  try {
    // 1️⃣ Récupérer la facture principale
    console.log(`Étape 1 : Récupération de la facture principale (ID: ${id})`);
    const factureRes = await pool.query(`
      SELECT f.*, t.nom AS client_nom, t.code AS code_tiers
      FROM factures f
      LEFT JOIN tiers t ON f.code_tiers = t.code
      WHERE f.id = $1
    `, [id]);

    if (factureRes.rows.length === 0) {
      console.log("Étape 1 : Échec - Facture non trouvée.");
      return res.status(404).json({ error: "Facture non trouvée." });
    }
    const facture = factureRes.rows[0];
    console.log("Étape 1 : Succès - Données de la facture:", facture);

    // 2️⃣ Récupérer les lignes associées
    console.log(`Étape 2 : Récupération des lignes pour la facture ID: ${id}`);
    const lignesRes = await pool.query(
      // CORRECTION : S'assurer que le nom de la table est 'lignes_facture'
      `SELECT * FROM lignes_facture WHERE facture_id = $1`, 
      [id]
    );
    console.log("Étape 2 : Succès - Lignes trouvées:", lignesRes.rows);

    // 3️⃣ Combiner les données
    facture.lignes = lignesRes.rows;
    console.log("--- Fin GET /api/factures/${id} : Envoi de la réponse complète ---");
    res.json(facture);

  } catch (err) {
    // Ce log est le plus important !
    console.error(`--- ERREUR dans GET /api/factures/${id} ---`, err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de la facture.", details: err.message });
  }
});

// --- PUT FACTURE ID ---
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

// =================================================================================
// CONVERSION PROFORMA -> DEFINITIVE (VERSION FINALE COMPLÈTE)
// =================================================================================
app.put('/api/factures/convertir/:id', async (req, res) => {
  const { id: proformaId } = req.params;
  
  // Étape 1 : Récupérer TOUTES les données modifiées qui viennent du formulaire React
  const { 
    date_facture, 
    montant, 
    lignes,
    nature_produit,
    pays_origine,
    compagnie_maritime,
    port_embarquement,
    nomenclature_douaniere,
    domiciliation,
    poids_brut, 
    tare,
    poids_net
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Démarrage de la transaction

    // Étape 2 : Récupérer le dernier taux de change USD enregistré
    const tauxRes = await client.query(
        `SELECT valeur FROM taux_de_change WHERE devise = 'USD' ORDER BY date DESC LIMIT 1`
    );
    if (tauxRes.rowCount === 0) {
        throw new Error("Aucun taux de change USD n'est enregistré. Veuillez le mettre à jour depuis le tableau de bord.");
    }
    const tauxUSD = parseFloat(tauxRes.rows[0].valeur);

    // Étape 3 : Charger la proforma originale pour les données non modifiables (client, envoi)
    const proformaRes = await client.query(
      'SELECT * FROM factures WHERE id = $1 AND type_facture = $2',
      [proformaId, 'Proforma']
    );
    if (proformaRes.rowCount === 0) {
      throw new Error("Facture Proforma non trouvée ou déjà convertie.");
    }
    const factureProforma = proformaRes.rows[0];

    // Étape 4 : Générer le nouveau numéro de facture définitive
    const numeroFactureDefinitif = await generateNumeroFacture('Definitive');

    // Étape 5 : Créer la nouvelle facture Définitive en utilisant les données du formulaire
    const definitiveResult = await client.query(
      `INSERT INTO factures (
         numero_facture, date_facture, libelle, montant, type_facture, 
         envoi_id, code_tiers, nature_produit, pays_origine, compagnie_maritime, 
         port_embarquement, nomenclature_douaniere, domiciliation, 
         poids_brut, tare, poids_net, facture_origine_id
       ) VALUES ($1, $2, $3, $4, 'Definitive', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [
        numeroFactureDefinitif,
        date_facture,
        factureProforma.libelle, // On garde le libellé original de la proforma
        montant,                 // On prend le nouveau montant
        factureProforma.envoi_id,
        factureProforma.code_tiers,
        nature_produit,
        pays_origine,
        compagnie_maritime,
        port_embarquement,
        nomenclature_douaniere,
        domiciliation,
        poids_brut,
        tare,
        poids_net,
        proformaId // Lien vers la facture d'origine
      ]
    );
    const factureDefinitive = definitiveResult.rows[0];
    const newDefinitiveId = factureDefinitive.id;

    // Étape 6 : Insérer les NOUVELLES lignes de la facture
    if (lignes && lignes.length > 0) {
      for (const ligne of lignes) {
        await client.query(
          `INSERT INTO lignes_facture (facture_id, description, quantite, prix, article_code)
           VALUES ($1, $2, $3, $4, $5)`,
          [newDefinitiveId, ligne.description, ligne.quantite, ligne.prix, ligne.article_code || null]
        );
      }
    }
    
    // Étape 7 : Créer les écritures comptables en Ariary
    const montantEnAriary = parseFloat(montant) * tauxUSD;
    const clientNom = factureProforma.client_nom || factureProforma.code_tiers;
    // Libellé simplifié SANS le numéro de facture
    const libelleEcriture = `Vente client ${clientNom}`;

    // Écriture au débit du client
    await client.query(
      `INSERT INTO ecritures (journal_code, date, numero_piece, libelle_operation, compte_general, code_tiers, envoi_id, facture_id, debit)
       VALUES ('VE', $1, $2, $3, '411', $4, $5, $6, $7)`,
      [date_facture, numeroFactureDefinitif, libelleEcriture, factureProforma.code_tiers, factureProforma.envoi_id, newDefinitiveId, montantEnAriary.toFixed(2)]
    );
    // Écriture au crédit du compte de vente
    await client.query(
      `INSERT INTO ecritures (journal_code, date, numero_piece, libelle_operation, compte_general, envoi_id, facture_id, credit)
       VALUES ('VE', $1, $2, $3, '707', $4, $5, $6)`,
      [date_facture, numeroFactureDefinitif, libelleEcriture, factureProforma.envoi_id, newDefinitiveId, montantEnAriary.toFixed(2)]
    );

    // Si tout a réussi, on valide la transaction
    await client.query('COMMIT');
    res.status(201).json(factureDefinitive);

  } catch (err) {
    // En cas d'erreur, on annule tout
    await client.query('ROLLBACK');
    console.error(`Erreur lors de la conversion de la facture ID ${proformaId}:`, err);
    res.status(500).json({ error: "Erreur serveur lors de la conversion.", details: err.message });
  } finally {
    // On libère le client de la base de données
    client.release();
  }
});

// --- ROUTE POUR LES TAUX DE CHANGE ---

// GET : Récupérer le dernier taux enregistré pour chaque devise
app.get('/api/taux-de-change/dernier', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (devise) devise, valeur, date 
      FROM taux_de_change
      ORDER BY devise, date DESC
    `);
    // Transforme le tableau en objet { USD: ..., EUR: ... }
    const taux = result.rows.reduce((acc, row) => {
      acc[row.devise] = { valeur: row.valeur, date: row.date };
      return acc;
    }, {});
    res.json(taux);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST : Enregistrer ou mettre à jour le taux du jour pour une devise
app.post('/api/taux-de-change', async (req, res) => {
  const { devise, valeur, date } = req.body;
  if (!devise || !valeur || !date) {
    return res.status(400).json({ error: 'Devise, valeur et date sont requises.' });
  }
  try {
    // "UPSERT": Insère une nouvelle ligne, ou la met à jour si la date existe déjà
    const result = await pool.query(`
      INSERT INTO taux_de_change (date, devise, valeur)
      VALUES ($1, $2, $3)
      ON CONFLICT (date) DO UPDATE SET valeur = $3
      RETURNING *;
    `, [date, devise, valeur]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================================
// LANCEMENT DU SERVEUR
// =================================================================================
setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`✅ Serveur backend démarré sur http://localhost:${port}`);
  });
});