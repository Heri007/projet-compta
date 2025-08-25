// src/utils/bilanHelper.js

// Structure de mapping pour l'ACTIF
const BILAN_ACTIF_STRUCTURE = {
    'ACTIF IMMOBILISE': {
        'Immobilisations incorporelles': [ { libelle: 'Frais d\'établissement', comptes: ['201'] }, { libelle: 'Frais de recherche et de développement', comptes: ['203'] }, { libelle: 'Concessions, brevets, licences, marques...', comptes: ['205'] }, { libelle: 'Fonds commercial', comptes: ['207'] }, { libelle: 'Immobilisations incorporelles en cours', comptes: ['232'] }, { libelle: 'Avances et acomptes', comptes: ['237'] }, ],
        'Immobilisations corporelles': [ { libelle: 'Terrains', comptes: ['211', '212'] }, { libelle: 'Constructions', comptes: ['213'] }, { libelle: 'Installations techniques, matériels, et outillage', comptes: ['215'] }, { libelle: 'Autres immobilisations corporelles', comptes: ['218'] }, { libelle: 'Immobilisations corporelles en cours', comptes: ['231'] }, { libelle: 'Avances et acomptes', comptes: ['238'] }, ],
        'Immobilisations financières': [ { libelle: 'Participations', comptes: ['261'] }, { libelle: 'Créances rattachées à des participations', comptes: ['267'] }, { libelle: 'Autres titres immobilisés', comptes: ['271', '272', '273'] }, { libelle: 'Prêts', comptes: ['274'] }, { libelle: 'Autres immobilisations financières', comptes: ['276'] }, ]
    },
    'ACTIF CIRCULANT': {
        'Stocks': [ { libelle: 'Matières premières et autres approvisionnements', comptes: ['31', '32'] }, { libelle: 'En cours de production de biens', comptes: ['33'] }, { libelle: 'Produits intermédiaires et finis', comptes: ['35'] }, { libelle: 'Marchandises', comptes: ['37'] }, ],
        'Créances': [ { libelle: 'Clients et comptes rattachés', comptes: ['411', '413', '416', '418'] }, { libelle: 'Autres créances', comptes: ['44', '46'] }, { libelle: 'Capital souscrit - appelé, non versé', comptes: ['456'] }, ],
        'Trésorerie': [ { libelle: 'Valeurs mobilières de placement', comptes: ['50'] }, { libelle: 'Banques, chèques postaux', comptes: ['512'] }, { libelle: 'Caisse', comptes: ['53'] }, ]
    }
};

// Structure de mapping pour le PASSIF
const BILAN_PASSIF_STRUCTURE = {
    'CAPITAUX PROPRES': {
        'Capital et réserves': [ { libelle: 'Capital', comptes: ['101'] }, { libelle: 'Primes d\'émission, de fusion, d\'apport', comptes: ['104'] }, { libelle: 'Écarts de réévaluation', comptes: ['105'] }, { libelle: 'Réserve légale', comptes: ['1061'] }, { libelle: 'Réserves statutaires ou contractuelles', comptes: ['1063'] }, { libelle: 'Autres réserves', comptes: ['1068'] }, { libelle: 'Report à nouveau', comptes: ['11'] }, ],
        'Résultat et subventions': [ { libelle: 'Résultat de l\'exercice (bénéfice ou perte)', comptes: ['12'] }, { libelle: 'Subventions d\'investissement', comptes: ['13'] }, { libelle: 'Provisions réglementées', comptes: ['14'] }, ]
    },
    'PROVISIONS': {
        'Provisions': [ { libelle: 'Provisions pour risques', comptes: ['151'] }, { libelle: 'Provisions pour charges', comptes: ['155', '156', '157', '158'] }, ]
    },
    'DETTES': {
        'Dettes financières': [ { libelle: 'Emprunts obligataires', comptes: ['161', '163'] }, { libelle: 'Emprunts et dettes auprès des établissements de crédits', comptes: ['164'] }, { libelle: 'Autres emprunts et dettes financières', comptes: ['168'] }, ],
        'Dettes d\'exploitation': [ { libelle: 'Avances et acomptes reçus sur commandes', comptes: ['419'] }, { libelle: 'Dettes fournisseurs et comptes rattachés', comptes: ['401', '403', '408'] }, { libelle: 'Dettes fiscales et sociales', comptes: ['42', '43', '44'] }, ],
        'Autres dettes': [ { libelle: 'Dettes sur immobilisations et comptes rattachés', comptes: ['404'] }, { libelle: 'Autres dettes', comptes: ['46'] }, { libelle: 'Instruments de trésorerie', comptes: ['519'] }, ]
    }
};

/**
 * Calcule les soldes et génère la structure complète du Bilan (Actif et Passif).
 */
export const genererDonneesBilanComplet = (comptes, ecritures) => {
    // 1. Calculer le solde final de chaque compte
    const soldesComptes = new Map();
    comptes.forEach(c => soldesComptes.set(c.numero_compte, { ...c, solde: 0 }));
    ecritures.forEach(e => {
        if (soldesComptes.has(e.compte_general)) {
            const soldeActuel = soldesComptes.get(e.compte_general).solde;
            soldesComptes.get(e.compte_general).solde = soldeActuel + parseFloat(e.debit || 0) - parseFloat(e.credit || 0);
        }
    });

    // --- CORRIGÉ : Implémentation complète de la fonction ---
    const calculerSoldePourPrefixes = (prefixes) => {
        let total = 0;
        // Parcourt tous les comptes qui ont un solde calculé
        soldesComptes.forEach((compte, numero) => {
            // Si le numéro du compte commence par l'un des préfixes fournis...
            if (prefixes.some(prefix => numero.startsWith(prefix))) {
                // ...on ajoute son solde au total.
                total += compte.solde;
            }
        });
        return total;
    };

    // --- Fonction de construction générique pour Actif ou Passif ---
    const construirePartieBilan = (structure, estPassif = false) => {
        const resultat = {};
        let totalGeneral = 0;
        Object.keys(structure).forEach(grandeMasse => {
            resultat[grandeMasse] = { sous_masses: {}, total: 0 };
            let totalGrandeMasse = 0;
            Object.keys(structure[grandeMasse]).forEach(sousMasse => {
                const lignes = structure[grandeMasse][sousMasse].map(item => {
                    let montantBrut = calculerSoldePourPrefixes(item.comptes);
                    // Inverser le signe pour les comptes du passif (qui sont créditeurs)
                    if (estPassif) montantBrut = -montantBrut;
                    return { libelle: item.libelle, montantBrut };
                });
                const totalSousMasse = lignes.reduce((sum, item) => sum + item.montantBrut, 0);
                resultat[grandeMasse].sous_masses[sousMasse] = { lignes, total: totalSousMasse };
                totalGrandeMasse += totalSousMasse;
            });
            resultat[grandeMasse].total = totalGrandeMasse;
            totalGeneral += totalGrandeMasse;
        });
        resultat.TOTAL = totalGeneral;
        return resultat;
    };

    const actif = construirePartieBilan(BILAN_ACTIF_STRUCTURE, false);
    const passif = construirePartieBilan(BILAN_PASSIF_STRUCTURE, true);

    return { actif, passif };
};