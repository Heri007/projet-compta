// Fichier : frontend/src/utils/bilanHelperN1.js

import { calculerSoldesFinaux } from './calculsComptables';
import { genererDonneesResultat } from './compteDeResultatHelper'; // Nous avons besoin du résultat de l'exercice

// --- STRUCTURES (inchangées) ---
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
 * Génère la structure complète du Bilan pour DEUX exercices (N et N-1).
 */
export const genererDonneesBilanComparatif = (comptes, ecritures, dateClotureN) => {
    const dateClotureN_1 = new Date(dateClotureN);
    dateClotureN_1.setFullYear(dateClotureN.getFullYear() - 1);

    // Filtrer les écritures pour chaque période
    const ecrituresN = ecritures.filter(e => new Date(e.date) <= dateClotureN);
    const ecrituresN_1 = ecritures.filter(e => new Date(e.date) <= dateClotureN_1);

    // Calculer les soldes pour chaque période avec la logique comptable correcte
    const soldesN = calculerSoldesFinaux(comptes, ecrituresN);
    const soldesN_1 = calculerSoldesFinaux(comptes, ecrituresN_1);

    // Calculer le résultat de l'exercice pour N et N-1
    const resultatN = genererDonneesResultat(comptes, ecrituresN);
    const resultatN_1 = genererDonneesResultat(comptes, ecrituresN_1);

    // Fonction de construction générique qui utilise les soldes déjà calculés
    const construirePartieBilan = (structure) => {
        const resultat = {};
        let totalGeneralN = 0;
        let totalGeneralN1 = 0;

        const sommerSoldesPourPrefixes = (prefixes, soldesMap) => {
            let total = 0;
            soldesMap.forEach((solde, numeroCompte) => {
                if (prefixes.some(prefix => numeroCompte.startsWith(prefix))) {
                    total += solde;
                }
            });
            return total;
        };

        Object.keys(structure).forEach(grandeMasse => {
            resultat[grandeMasse] = { sous_masses: {}, totalN: 0, totalN1: 0 };
            let totalGrandeMasseN = 0;
            let totalGrandeMasseN1 = 0;

            Object.keys(structure[grandeMasse]).forEach(sousMasse => {
                const lignes = structure[grandeMasse][sousMasse].map(item => {
                    let montantBrutN, montantBrutN1;

                    // --- INJECTION DU RÉSULTAT DE L'EXERCICE ---
                    // C'est le lien crucial entre le Bilan et le Compte de Résultat
                    if (item.comptes.includes('12')) {
                        montantBrutN = resultatN.beneficeOuPerte;
                        montantBrutN1 = resultatN_1.beneficeOuPerte;
                    } else {
                        montantBrutN = sommerSoldesPourPrefixes(item.comptes, soldesN);
                        montantBrutN1 = sommerSoldesPourPrefixes(item.comptes, soldesN_1);
                    }
                    
                    return { libelle: item.libelle, montantBrutN, montantBrutN1 };
                });

                const totalSousMasseN = lignes.reduce((sum, item) => sum + item.montantBrutN, 0);
                const totalSousMasseN1 = lignes.reduce((sum, item) => sum + item.montantBrutN1, 0);
                resultat[grandeMasse].sous_masses[sousMasse] = { lignes, totalN: totalSousMasseN, totalN1: totalSousMasseN1 };
                
                totalGrandeMasseN += totalSousMasseN;
                totalGrandeMasseN1 += totalSousMasseN1;
            });
            
            resultat[grandeMasse].totalN = totalGrandeMasseN;
            resultat[grandeMasse].totalN1 = totalGrandeMasseN1;
            totalGeneralN += totalGrandeMasseN;
            totalGeneralN1 += totalGrandeMasseN1;
        });

        resultat.TOTAL_N = totalGeneralN;
        resultat.TOTAL_N1 = totalGeneralN1;
        return resultat;
    };

    const actif = construirePartieBilan(BILAN_ACTIF_STRUCTURE);
    const passif = construirePartieBilan(BILAN_PASSIF_STRUCTURE);

    return { actif, passif };
};