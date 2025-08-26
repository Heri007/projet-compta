// Fichier : frontend/src/utils/bilanHelperN1.js

import { calculerSoldesFinaux } from './calculsComptables';
import { genererDonneesResultat } from './compteDeResultatHelper';

// --- STRUCTURES (inchangées) ---
const BILAN_ACTIF_STRUCTURE = { 'ACTIF IMMOBILISE': {
        'Immobilisations incorporelles': [ { libelle: 'Frais d\'établissement', comptes: ['201'] }, { libelle: 'Frais de recherche et de développement', comptes: ['203'] }, { libelle: 'Concessions, brevets, licences, marques...', comptes: ['205'] }, { libelle: 'Fonds commercial', comptes: ['207'] }, { libelle: 'Immobilisations incorporelles en cours', comptes: ['232'] }, { libelle: 'Avances et acomptes', comptes: ['237'] }, ],
        'Immobilisations corporelles': [ { libelle: 'Terrains', comptes: ['211', '212'] }, { libelle: 'Constructions', comptes: ['213'] }, { libelle: 'Installations techniques, matériels, et outillage', comptes: ['215'] }, { libelle: 'Autres immobilisations corporelles', comptes: ['218'] }, { libelle: 'Immobilisations corporelles en cours', comptes: ['231'] }, { libelle: 'Avances et acomptes', comptes: ['238'] }, ],
        'Immobilisations financières': [ { libelle: 'Participations', comptes: ['261'] }, { libelle: 'Créances rattachées à des participations', comptes: ['267'] }, { libelle: 'Autres titres immobilisés', comptes: ['271', '272', '273'] }, { libelle: 'Prêts', comptes: ['274'] }, { libelle: 'Autres immobilisations financières', comptes: ['276'] }, ]
    },
    'ACTIF CIRCULANT': {
        'Stocks': [ { libelle: 'Matières premières et autres approvisionnements', comptes: ['31', '32'] }, { libelle: 'En cours de production de biens', comptes: ['33'] }, { libelle: 'Produits intermédiaires et finis', comptes: ['35'] }, { libelle: 'Marchandises', comptes: ['37'] }, ],
        'Créances': [ { libelle: 'Clients et comptes rattachés', comptes: ['411', '413', '416', '418'] }, { libelle: 'Autres créances', comptes: ['44', '46'] }, { libelle: 'Capital souscrit - appelé, non versé', comptes: ['456'] }, ],
        'Trésorerie': [ { libelle: 'Valeurs mobilières de placement', comptes: ['50'] }, { libelle: 'Banques, chèques postaux', comptes: ['512'] }, { libelle: 'Caisse', comptes: ['53'] }, ]
    }};
const BILAN_PASSIF_STRUCTURE = { 'CAPITAUX PROPRES': {
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
    } };

/**
 * Génère la structure complète du Bilan pour DEUX exercices (N et N-1).
 */
export const genererDonneesBilanComparatif = (comptes, ecritures, dateClotureN) => {
    const dateClotureN_1 = new Date(dateClotureN);
    dateClotureN_1.setFullYear(dateClotureN.getFullYear() - 1);

    const ecrituresN = ecritures.filter(e => new Date(e.date) <= dateClotureN);
    const ecrituresN_1 = ecritures.filter(e => new Date(e.date) <= dateClotureN_1);

    const soldesN = calculerSoldesFinaux(comptes, ecrituresN);
    const soldesN_1 = calculerSoldesFinaux(comptes, ecrituresN_1);

    const resultatN = genererDonneesResultat(comptes, ecrituresN);
    const resultatN_1 = genererDonneesResultat(comptes, ecrituresN_1);

    // --- MISE À JOUR DE LA FONCTION DE CONSTRUCTION ---
    const construirePartieBilan = (structure) => {
        const resultat = {};
        // On a besoin des totaux pour chaque colonne
        let totalGeneral = { N: { brut: 0, amort: 0, net: 0 }, N1: { brut: 0, amort: 0, net: 0 } };

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
            let totalMasse = { N: { brut: 0, amort: 0, net: 0 }, N1: { brut: 0, amort: 0, net: 0 } };

            const sousMassesCalculees = {};
            Object.keys(structure[grandeMasse]).forEach(sousMasse => {
                const lignes = structure[grandeMasse][sousMasse].map(item => {
                    let montants = { N: { brut: 0, amort: 0, net: 0 }, N1: { brut: 0, amort: 0, net: 0 } };

                    if (item.comptes.includes('12')) {
                        montants.N.net = resultatN.beneficeOuPerte;
                        montants.N1.net = resultatN_1.beneficeOuPerte;
                        montants.N.brut = montants.N.net; // Au passif, brut = net
                        montants.N1.brut = montants.N1.net;
                    } else {
                        montants.N.brut = sommerSoldesPourPrefixes(item.comptes, soldesN);
                        montants.N1.brut = sommerSoldesPourPrefixes(item.comptes, soldesN_1);

                        // Calcul des amortissements et provisions
                        const comptesAmort = item.comptes.map(c => c.startsWith('2') ? '28' + c.slice(1) : c + '9');
                        montants.N.amort = sommerSoldesPourPrefixes(comptesAmort, soldesN);
                        montants.N1.amort = sommerSoldesPourPrefixes(comptesAmort, soldesN_1);
                        
                        montants.N.net = montants.N.brut - montants.N.amort;
                        montants.N1.net = montants.N1.brut - montants.N1.amort;
                    }
                    return { libelle: item.libelle, ...montants };
                });

                // Calculer les totaux de la sous-masse
                const totalSousMasse = {
                    N: {
                        brut: lignes.reduce((sum, l) => sum + l.N.brut, 0),
                        amort: lignes.reduce((sum, l) => sum + l.N.amort, 0),
                        net: lignes.reduce((sum, l) => sum + l.N.net, 0)
                    },
                    N1: {
                        brut: lignes.reduce((sum, l) => sum + l.N1.brut, 0),
                        amort: lignes.reduce((sum, l) => sum + l.N1.amort, 0),
                        net: lignes.reduce((sum, l) => sum + l.N1.net, 0)
                    }
                };

                sousMassesCalculees[sousMasse] = { lignes, total: totalSousMasse };

                // Mettre à jour les totaux de la grande masse
                Object.keys(totalMasse.N).forEach(key => {
                    totalMasse.N[key] += totalSousMasse.N[key];
                    totalMasse.N1[key] += totalSousMasse.N1[key];
                });
            });
            
            resultat[grandeMasse] = { sous_masses: sousMassesCalculees, total: totalMasse };
            
            // Mettre à jour les totaux généraux
            Object.keys(totalGeneral.N).forEach(key => {
                totalGeneral.N[key] += totalMasse.N[key];
                totalGeneral.N1[key] += totalMasse.N1[key];
            });
        });

        resultat.TOTAL = totalGeneral;
        return resultat;
    };

    const actif = construirePartieBilan(BILAN_ACTIF_STRUCTURE);
    const passif = construirePartieBilan(BILAN_PASSIF_STRUCTURE);

    // Simplification pour le passif : on ne garde que le total net
    Object.keys(passif).forEach(grandeMasseKey => {
        if (passif[grandeMasseKey].total) {
            passif[grandeMasseKey].totalN = passif[grandeMasseKey].total.N.net;
            passif[grandeMasseKey].totalN1 = passif[grandeMasseKey].total.N1.net;
        }
        if (passif[grandeMasseKey].sous_masses) {
            Object.keys(passif[grandeMasseKey].sous_masses).forEach(sousMasseKey => {
                passif[grandeMasseKey].sous_masses[sousMasseKey].totalN = passif[grandeMasseKey].sous_masses[sousMasseKey].total.N.net;
                passif[grandeMasseKey].sous_masses[sousMasseKey].totalN1 = passif[grandeMasseKey].sous_masses[sousMasseKey].total.N1.net;
                passif[grandeMasseKey].sous_masses[sousMasseKey].lignes.forEach(ligne => {
                    ligne.montantBrutN = ligne.N.net;
                    ligne.montantBrutN1 = ligne.N1.net;
                });
            });
        }
    });
    passif.TOTAL_N = passif.TOTAL.N.net;
    passif.TOTAL_N1 = passif.TOTAL.N1.net;


    return { actif, passif };
};