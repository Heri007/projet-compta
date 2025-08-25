// src/utils/compteDeResultatHelperN1.js

// Structure de mapping pour le Compte de Résultat (par nature), conforme au modèle.
const RESULTAT_STRUCTURE = {
    'Produits d\'exploitation': [
        { libelle: 'Ventes de marchandises', comptes: ['707'] },
        { libelle: 'Production vendue (biens et services)', comptes: ['701', '702', '703', '704', '705', '706'] },
        { libelle: 'Production stockée (ou déstockage)', comptes: ['71'] },
        { libelle: 'Production immobilisée', comptes: ['72'] },
        { libelle: 'Subventions d\'exploitation', comptes: ['74'] },
        { libelle: 'Reprises sur amortissements et provisions', comptes: ['781', '785'] },
        { libelle: 'Autres produits', comptes: ['75'] },
    ],
    'Charges d\'exploitation': [
        { libelle: 'Achats de marchandises', comptes: ['607'] },
        { libelle: 'Variation des stocks (marchandises)', comptes: ['6037'] },
        { libelle: 'Achats de matières premières et autres approvisionnements', comptes: ['601', '602'] },
        { libelle: 'Variation des stocks (matières premières)', comptes: ['6031', '6032'] },
        { libelle: 'Autres achats et charges externes', comptes: ['604', '605', '606', '61', '62'] },
        { libelle: 'Impôts, taxes et versements assimilés', comptes: ['63'] },
        { libelle: 'Salaires et traitements', comptes: ['641'] },
        { libelle: 'Charges sociales', comptes: ['645', '646', '647', '648'] },
        { libelle: 'Dotations aux amortissements et provisions', comptes: ['681', '685'] },
        { libelle: 'Autres charges', comptes: ['65'] },
    ],
    'Produits financiers': [
        { libelle: 'Produits financiers', comptes: ['76'] },
    ],
    'Charges financières': [
        { libelle: 'Charges financières', comptes: ['66'] },
    ],
};

/**
 * Calcule la somme des mouvements (crédit - débit) pour une période donnée.
 * @param {Array} ecrituresPeriode - Les écritures déjà filtrées pour la période.
 * @returns {Map} - Une Map des comptes avec la somme de leurs mouvements.
 */
const calculerMouvementsPourPeriode = (ecrituresPeriode) => {
    const mouvementsComptes = new Map();
    ecrituresPeriode.forEach(e => {
        const mouvementActuel = mouvementsComptes.get(e.compte_general) || 0;
        // Pour le CR, un produit (crédit) est positif, une charge (débit) est négative.
        const mouvement = parseFloat(e.credit || 0) - parseFloat(e.debit || 0);
        mouvementsComptes.set(e.compte_general, mouvementActuel + mouvement);
    });
    return mouvementsComptes;
};

/**
 * Calcule les soldes et génère la structure complète du Compte de Résultat pour DEUX exercices (N et N-1).
 * @param {Array} ecritures - TOUTES les écritures, sans filtre de date.
 * @param {Date} dateClotureN - La date de clôture de l'exercice en cours (N).
 */
export const genererDonneesResultatComparatif = (ecritures, dateClotureN) => {
    // Déterminer les plages de dates pour N et N-1
    const dateDebutN = new Date(dateClotureN.getFullYear(), 0, 1);
    const dateClotureN_1 = new Date(dateClotureN.getFullYear() - 1, 11, 31);
    const dateDebutN_1 = new Date(dateClotureN.getFullYear() - 1, 0, 1);

    // Filtrer les écritures pour chaque période de 12 mois
    const ecrituresN = ecritures.filter(e => { const d = new Date(e.date); return d >= dateDebutN && d <= dateClotureN; });
    const ecrituresN_1 = ecritures.filter(e => { const d = new Date(e.date); return d >= dateDebutN_1 && d <= dateClotureN_1; });

    // Calculer les mouvements pour chaque période
    const mouvementsN = calculerMouvementsPourPeriode(ecrituresN);
    const mouvementsN_1 = calculerMouvementsPourPeriode(ecrituresN_1);

    const resultat = {};
    
    const calculerMouvementPourPrefixes = (prefixes, mouvementsMap) => {
        let total = 0;
        mouvementsMap.forEach((mouvement, numero) => {
            if (prefixes.some(prefix => numero.startsWith(prefix))) {
                total += mouvement;
            }
        });
        return total;
    };

    // --- CONSTRUCTION DU COMPTE DE RÉSULTAT ---
    const sections = {};
    let soldesIntermediaires = {};

    Object.entries(RESULTAT_STRUCTURE).forEach(([section, lignes]) => {
        let totalSectionN = 0;
        let totalSectionN1 = 0;
        const lignesCalculees = lignes.map(item => {
            const montantN = calculerMouvementPourPrefixes(item.comptes, mouvementsN);
            const montantN1 = calculerMouvementPourPrefixes(item.comptes, mouvementsN_1);
            
            // Les charges sont naturellement négatives, on les inverse pour l'affichage
            const displayMontantN = section.startsWith('Charges') ? -montantN : montantN;
            const displayMontantN1 = section.startsWith('Charges') ? -montantN1 : montantN1;

            totalSectionN += displayMontantN;
            totalSectionN1 += displayMontantN1;
            
            return { ...item, montantN: displayMontantN, montantN1: displayMontantN1 };
        });
        sections[section] = lignesCalculees;
        soldesIntermediaires[section] = { totalN: totalSectionN, totalN1: totalSectionN1 };
    });

    // Calcul des résultats
    const resultatExploitationN = soldesIntermediaires['Produits d\'exploitation'].totalN - soldesIntermediaires['Charges d\'exploitation'].totalN;
    const resultatExploitationN1 = soldesIntermediaires['Produits d\'exploitation'].totalN1 - soldesIntermediaires['Charges d\'exploitation'].totalN1;
    
    const resultatFinancierN = soldesIntermediaires['Produits financiers'].totalN - soldesIntermediaires['Charges financières'].totalN;
    const resultatFinancierN1 = soldesIntermediaires['Produits financiers'].totalN1 - soldesIntermediaires['Charges financières'].totalN1;

    const resultatCourantAvantImpotN = resultatExploitationN + resultatFinancierN;
    const resultatCourantAvantImpotN1 = resultatExploitationN1 + resultatFinancierN1;

    // Structure finale
    resultat.sections = sections;
    resultat.soldes = {
        totalProduitsExploitationN: soldesIntermediaires['Produits d\'exploitation'].totalN,
        totalProduitsExploitationN1: soldesIntermediaires['Produits d\'exploitation'].totalN1,
        totalChargesExploitationN: soldesIntermediaires['Charges d\'exploitation'].totalN,
        totalChargesExploitationN1: soldesIntermediaires['Charges d\'exploitation'].totalN1,
        resultatExploitationN,
        resultatExploitationN1,
        resultatFinancierN,
        resultatFinancierN1,
        resultatCourantAvantImpotN,
        resultatCourantAvantImpotN1,
        beneficeOuPerteN: resultatCourantAvantImpotN, // Simplifié, sans impôts ni exceptionnel
        beneficeOuPerteN1: resultatCourantAvantImpotN1,
    };

    return resultat;
};