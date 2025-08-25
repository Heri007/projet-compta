// backend/seed_articles.js

require('dotenv').config();
const { Pool } = require('pg');

// ==========================================================
// GÉNÉRATION DE LA LISTE D'ARTICLES AVEC DES NOMS UNIQUES
// ==========================================================
const LISTE_ARTICLES = [];
const categories = {
  pierres_precieuses_fines_brutes: ["Saphir bleu", "Saphir bleu-vert brute", "Saphir rose brute", "Saphir orange brute", "Saphir jaune-blanc brute", "Rubis brute", "Emeraude"],
  pierres_fines_brutes: ["Béryl bleu", "Béryl rose", "Béryl autres (saumon, vert, jaune, autres)"],
  pierres_fines_autres_brutes: ["Alexandrite", "Améthyste", "Andalousite", "Apatite", "Citrine", "Chrysobéryl œil de chat", "Chrysobéryl", "Cordiérite", "Corindon", "Cristal avec inclusion", "Danburite", "Diopside", "Dioptase", "Disthène", "Epidote", "Grandidiérite", "Grenat vert (Trasvorite, démantoïde, uvarovite)", "Grenat marron (Hessonite, pyrope)", "Grenat Almandin, malaya, Rhodolite", "Grenat orange (Spessartite)", "Grenat changement de couleur", "Grenat bleu", "Fluorine", "Kornerupine", "Kunzite", "Olivine", "Opale", "Orthose", "Phénacite", "Pezzotaïte", "Rutile", "Sphène", "Scapolite", "Spectrolite", "Spinelle", "Topaze jaune", "Topaze bleu", "Topaze blanc", "Quartz rose, fumé, vert, bleu", "Zircon", "Tourmaline Rubellite et Indigolite", "Tourmaline Polychrome, vert chromifère", "Tourmaline (autres)"],
  pierres_precieuses_fines_taillees: ["Saphir bleu taillé", "Saphir bleu-vert taillé", "Saphir rose taillé", "Saphir orange taillé", "Saphir jaune-blanc taillé", "Rubis taillé", "Emeraude taillé", "Béryl bleu taillé", "Béryl rose taillé", "Béryl autres taillé"],
  fines_taillees_autres: ["Alexandrite", "Améthyste", "Andalousite", "Apatite", "Citrine", "Chrysobéryl œil de chat", "Chrysobéryl", "Cordiérite", "Corindon", "Cristal avec inclusion", "Danburite", "Diopside", "Dioptase", "Disthène", "Epidote", "Grandidiérite", "Grenat vert (Trasvorite, démantoïde, uvarovite)", "Grenat marron (Hessonite, pyrope)", "Grenat Almandin, malaya, Rhodolite", "Grenat orange (Spessartite)", "Grenat changement de couleur", "Grenat bleu", "Fluorine", "Kornerupine", "Kunzite", "Olivine", "Opale", "Orthose", "Phénacite", "Pezzotaïte", "Rutile", "Sphène", "Scapolite", "Spectrolite", "Spinelle", "Topaze jaune", "Topaze bleu", "Topaze blanc", "Quartz rose, fumé, vert, bleu", "Zircon", "Tourmaline Rubellite et Indigolite", "Tourmaline Polychrome, vert chromifère", "Tourmaline (autres)"],
  pierres_industrielles_brutes: ["Quartz variété cristal prisme", "Quartz fonte", "Quartz rose", "Quartz ananas", "Quartz cristal géode", "Quartz Améthyste prisme", "Quartz (Girasol, blanc bleu, cristal améthysé bicolore, fumé)", "Quartz hématoïde", "Quartz fumé prisme", "Quartz avec inclusion", "Actinote", "Agate", "Agate géode", "Agate géode Améthyste", "Amazonite", "Anhydrite", "Apatite", "Aragonite", "Basalte", "Béryllium", "Calcédoine bleu", "Calcédoine autres", "Calcite", "Chrysocolle", "Chrysoprase", "Cordiérite", "Cornaline", "Dumortiérite", "Feldspath", "Fluorine Bloc", "Fluorine géode", "Fuschiste", "Gabbro", "Garniérite", "Grenatite (roche)", "Hématite (collection)", "Jaspe", "Labradorite petit bloc", "Lazulite", "Lépidolite (ornementale, avec ou sans tourmaline rose)", "Opale", "Quartz teinté bleu", "Rhodonite", "Spinelle sur gangue (collection)", "Tourmaline noir", "Tourmaline sur gangue", "Turquoise"],
  produits_locaux: ["Black-eyes", "Peanuts (Arachides)", "Pois du Cap", "Haricots (blancs, rouges)", "Mungo Beans"],
};

// --- CORRECTION : Logique pour rendre les noms uniques ---
let codeCounter = 1;
const designationsEnregistrees = new Set(); // Utiliser un Set pour vérifier rapidement les doublons

Object.entries(categories).forEach(([categoryKey, articles]) => {
  articles.forEach(nomArticle => {
    let designationFinale = nomArticle;
    
    // Si un nom comme "Alexandrite" existe déjà, nous ajoutons un suffixe basé sur la catégorie
    if (designationsEnregistrees.has(designationFinale)) {
      if (categoryKey.includes('brutes') && !designationFinale.toLowerCase().includes('brute')) {
        designationFinale = `${nomArticle} brute`;
      } else if (categoryKey.includes('taillees') && !designationFinale.toLowerCase().includes('taillé')) {
        designationFinale = `${nomArticle} taillé`;
      }
      // Ajouter une autre logique si nécessaire pour d'autres cas
    }
    
    // Si c'est toujours un doublon (cas rare), on ajoute un numéro
    let compteurDoublon = 2;
    while (designationsEnregistrees.has(designationFinale)) {
        designationFinale = `${nomArticle} (${compteurDoublon++})`;
    }
    
    designationsEnregistrees.add(designationFinale);

    const code = `A${codeCounter.toString().padStart(3, '0')}`;
    LISTE_ARTICLES.push({ code, designation: designationFinale });
    codeCounter++;
  });
});
// ==========================================================

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Connexion à la base de données...');
    
    await client.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE');
    console.log('Table "articles" vidée.');

    console.log(`Début de l'insertion de ${LISTE_ARTICLES.length} articles...`);
    for (const article of LISTE_ARTICLES) {
      await client.query(
        'INSERT INTO articles (code, designation) VALUES ($1, $2)',
        [article.code, article.designation]
      );
    }

    console.log('✅ Insertion terminée avec succès !');

  } catch (err) {
    console.error('❌ Erreur lors du seeding des articles :', err);
  } finally {
    await client.release();
    console.log('Connexion fermée.');
    await pool.end();
  }
}

seed();