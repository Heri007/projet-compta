// Fichier : frontend/src/utils/compteDeResultatHelper.js

import { calculerSoldesFinaux } from './calculsComptables';

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
        { libelle: 'Variation des stocks (marchandises)', comptes: ['6037'] }, // Souvent géré avec le 607
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
 * Calcule les soldes et génère la structure du Compte de Résultat.
 */
export const genererDonneesResultat = (comptes, ecritures) => {
    if (!Array.isArray(ecritures) || !Array.isArray(comptes)) {
        return { beneficeOuPerte: 0, sections: {}, soldes: {} };
    }

    // 1. Calculer les soldes corrects des comptes de charges (6) et produits (7)
    // On ne filtre que les écritures des classes 6 et 7 pour le CR
    const ecrituresDeGestion = ecritures.filter(e => {
        const classe = String(e.compte_general)[0];
        return classe === '6' || classe === '7';
    });
    const soldesComptes = calculerSoldesFinaux(comptes, ecrituresDeGestion);

    const sommerSoldesPourPrefixes = (prefixes) => {
        let total = 0;
        soldesComptes.forEach((solde, numeroCompte) => {
            if (prefixes.some(prefix => numeroCompte.startsWith(prefix))) {
                total += solde;
            }
        });
        return total;
    };

    // 2. Construire le résultat
    const resultat = {};
    const sections = {};
    let soldesIntermediaires = {};

    Object.entries(RESULTAT_STRUCTURE).forEach(([section, lignes]) => {
        let totalSection = 0;
        const lignesCalculees = lignes.map(item => {
            const montant = sommerSoldesPourPrefixes(item.comptes);
            totalSection += montant;
            return { ...item, montant };
        });
        sections[section] = lignesCalculees;
        soldesIntermediaires[section] = totalSection;
    });

    // 3. Calculer les soldes intermédiaires
    const totalProduitsExploitation = soldesIntermediaires['Produits d\'exploitation'];
    const totalChargesExploitation = soldesIntermediaires['Charges d\'exploitation'];
    const resultatExploitation = totalProduitsExploitation - totalChargesExploitation;
    
    const totalProduitsFinanciers = soldesIntermediaires['Produits financiers'];
    const totalChargesFinancieres = soldesIntermediaires['Charges financières'];
    const resultatFinancier = totalProduitsFinanciers - totalChargesFinancieres;

    const resultatCourantAvantImpot = resultatExploitation + resultatFinancier;
    
    // Structure finale
    resultat.sections = sections;
    resultat.beneficeOuPerte = resultatCourantAvantImpot; // Simplifié
    // ... Ajoutez d'autres soldes si nécessaire pour l'affichage

    return resultat;
};