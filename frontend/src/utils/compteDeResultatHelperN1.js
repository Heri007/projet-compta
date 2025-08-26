// Fichier : frontend/src/utils/compteDeResultatHelperN1.js

import { calculerSoldesFinaux } from './calculsComptables';

// --- STRUCTURE (inchangée) ---
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
 * Génère le Compte de Résultat pour DEUX exercices (N et N-1).
 */
export const genererDonneesResultatComparatif = (comptes, ecritures, dateClotureN) => {
    // Sécurité : si les données ne sont pas des tableaux, retourner une structure vide.
    if (!Array.isArray(ecritures) || !Array.isArray(comptes)) {
        return { sections: {}, soldes: {} };
    }

    // 1. Définir les plages de dates pour les exercices N et N-1
    const dateDebutN = new Date(dateClotureN.getFullYear(), 0, 1);
    const dateClotureN_1 = new Date(dateClotureN.getFullYear() - 1, 11, 31);
    const dateDebutN_1 = new Date(dateClotureN.getFullYear() - 1, 0, 1);

    // 2. Filtrer les écritures de gestion (classes 6 & 7) pour chaque période
    const ecrituresN = ecritures.filter(e => {
        const d = new Date(e.date);
        const classe = String(e.compte_general)[0];
        return (classe === '6' || classe === '7') && d >= dateDebutN && d <= dateClotureN;
    });
    const ecrituresN_1 = ecritures.filter(e => {
        const d = new Date(e.date);
        const classe = String(e.compte_general)[0];
        return (classe === '6' || classe === '7') && d >= dateDebutN_1 && d <= dateClotureN_1;
    });

    // 3. Calculer les soldes pour chaque période avec la logique comptable correcte
    const soldesN = calculerSoldesFinaux(comptes, ecrituresN);
    const soldesN_1 = calculerSoldesFinaux(comptes, ecrituresN_1);

    // 4. Construire la structure du Compte de Résultat
    const resultat = {};
    const sections = {};
    // --- CORRECTION : La variable inutile 'soldesIntermediaires' a été supprimée ---

    const sommerSoldesPourPrefixes = (prefixes, soldesMap) => {
        let total = 0;
        soldesMap.forEach((solde, numeroCompte) => {
            if (prefixes.some(prefix => numeroCompte.startsWith(prefix))) {
                total += solde;
            }
        });
        return total;
    };

    Object.entries(RESULTAT_STRUCTURE).forEach(([section, lignes]) => {
        const lignesCalculees = lignes.map(item => {
            const montantN = sommerSoldesPourPrefixes(item.comptes, soldesN);
            const montantN1 = sommerSoldesPourPrefixes(item.comptes, soldesN_1);
            return { ...item, montantN, montantN1 };
        });
        sections[section] = lignesCalculees;
    });

    // 5. Calculer les soldes intermédiaires de gestion
    const totalProduitsExploitationN = sections['Produits d\'exploitation'].reduce((sum, item) => sum + item.montantN, 0);
    const totalProduitsExploitationN1 = sections['Produits d\'exploitation'].reduce((sum, item) => sum + item.montantN1, 0);
    const totalChargesExploitationN = sections['Charges d\'exploitation'].reduce((sum, item) => sum + item.montantN, 0);
    const totalChargesExploitationN1 = sections['Charges d\'exploitation'].reduce((sum, item) => sum + item.montantN1, 0);

    const resultatExploitationN = totalProduitsExploitationN - totalChargesExploitationN;
    const resultatExploitationN1 = totalProduitsExploitationN1 - totalChargesExploitationN1;
    
    const totalProduitsFinanciersN = sections['Produits financiers'].reduce((sum, item) => sum + item.montantN, 0);
    const totalProduitsFinanciersN1 = sections['Produits financiers'].reduce((sum, item) => sum + item.montantN1, 0);
    const totalChargesFinancieresN = sections['Charges financières'].reduce((sum, item) => sum + item.montantN, 0);
    const totalChargesFinancieresN1 = sections['Charges financières'].reduce((sum, item) => sum + item.montantN1, 0);
    
    const resultatFinancierN = totalProduitsFinanciersN - totalChargesFinancieresN;
    const resultatFinancierN1 = totalProduitsFinanciersN1 - totalChargesFinancieresN1;

    const resultatCourantAvantImpotN = resultatExploitationN + resultatFinancierN;
    const resultatCourantAvantImpotN1 = resultatExploitationN1 + resultatFinancierN1;

    // 6. Assembler la structure de données finale à retourner
    resultat.sections = sections;
    resultat.soldes = {
        totalProduitsExploitationN,
        totalProduitsExploitationN1,
        totalChargesExploitationN,
        totalChargesExploitationN1,
        resultatExploitationN,
        resultatExploitationN1,
        resultatFinancierN,
        resultatFinancierN1,
        resultatCourantAvantImpotN,
        resultatCourantAvantImpotN1,
        beneficeOuPerteN: resultatCourantAvantImpotN,
        beneficeOuPerteN1: resultatCourantAvantImpotN1,
    };

    return resultat;
};