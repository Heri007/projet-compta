// Fichier : frontend/src/utils/bilanHelper.js

import { calculerSoldesFinaux } from './calculsComptables';
import { genererDonneesResultat } from './compteDeResultatHelper';

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

export const genererDonneesBilanComplet = (comptes, ecritures) => {
    // 1. Calculer les soldes de TOUS les comptes
    const soldesComptes = calculerSoldesFinaux(comptes, ecritures);

    // 2. Calculer le résultat de l'exercice
    const resultat = genererDonneesResultat(comptes, ecritures);

    const sommerSoldesPourPrefixes = (prefixes) => {
        let total = 0;
        soldesComptes.forEach((solde, numeroCompte) => {
            if (prefixes.some(prefix => numeroCompte.startsWith(prefix))) {
                total += solde;
            }
        });
        return total;
    };

    // --- MISE À JOUR DE LA FONCTION DE CONSTRUCTION ---
    const construirePartieBilan = (structure) => {
        const resultatFinal = {};
        let totalGeneralBrut = 0, totalGeneralAmort = 0, totalGeneralNet = 0;

        Object.keys(structure).forEach(grandeMasse => {
            resultatFinal[grandeMasse] = { sous_masses: {}, totalBrut: 0, totalAmort: 0, totalNet: 0 };
            let totalMasseBrut = 0, totalMasseAmort = 0, totalMasseNet = 0;

            Object.keys(structure[grandeMasse]).forEach(sousMasse => {
                const lignes = structure[grandeMasse][sousMasse].map(item => {
                    let montantBrut, amortissements, montantNet;

                    // Cas spécial pour le résultat de l'exercice
                    if (item.comptes.includes('12')) {
                        montantBrut = resultat.beneficeOuPerte;
                        amortissements = 0;
                        montantNet = montantBrut;
                    } else {
                        // Logique standard pour les autres comptes
                        montantBrut = sommerSoldesPourPrefixes(item.comptes);
                        
                        // Calcul des amortissements (comptes 28xx) et provisions (29xx, 39xx, 49xx, 59xx)
                        const comptesAmort = item.comptes.map(c => c.startsWith('2') ? '28' + c.slice(1) : c + '9');
                        amortissements = sommerSoldesPourPrefixes(comptesAmort);

                        montantNet = montantBrut - amortissements;
                    }
                    return { libelle: item.libelle, montantBrut, amortissements, montantNet };
                });

                // Calcul des totaux pour la sous-masse
                const totalSousMasseBrut = lignes.reduce((sum, l) => sum + l.montantBrut, 0);
                const totalSousMasseAmort = lignes.reduce((sum, l) => sum + l.amortissements, 0);
                const totalSousMasseNet = lignes.reduce((sum, l) => sum + l.montantNet, 0);

                resultatFinal[grandeMasse].sous_masses[sousMasse] = { lignes, totalBrut: totalSousMasseBrut, totalAmort: totalSousMasseAmort, totalNet: totalSousMasseNet };
                
                totalMasseBrut += totalSousMasseBrut;
                totalMasseAmort += totalSousMasseAmort;
                totalMasseNet += totalSousMasseNet;
            });
            
            resultatFinal[grandeMasse] = { ...resultatFinal[grandeMasse], totalBrut: totalMasseBrut, totalAmort: totalMasseAmort, totalNet: totalMasseNet };
            
            totalGeneralBrut += totalMasseBrut;
            totalGeneralAmort += totalMasseAmort;
            totalGeneralNet += totalMasseNet;
        });
        
        resultatFinal.TOTAL = { totalBrut: totalGeneralBrut, totalAmort: totalGeneralAmort, totalNet: totalGeneralNet };
        return resultatFinal;
    };

    const actif = construirePartieBilan(BILAN_ACTIF_STRUCTURE);
    const passif = construirePartieBilan(BILAN_PASSIF_STRUCTURE);

    return { actif, passif };
};