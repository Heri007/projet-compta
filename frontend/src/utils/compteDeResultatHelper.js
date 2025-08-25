// src/utils/compteDeResultatHelper.js

// Structure de mapping pour le Compte de Résultat (par nature)
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
 * @param {Array} comptes - Le plan comptable.
 * @param {Array} ecritures - Toutes les écritures comptables.
 * @returns {Object} - Un objet structuré contenant les produits, charges et résultats.
 */
export const genererDonneesResultat = (comptes, ecritures) => {
    console.log("Avant genererDonneesResultat - comptes:", comptes);
    console.log("Avant genererDonneesResultat - ecritures:", ecritures);
    // --- SÉCURITÉ AJOUTÉE ---
    // Si 'ecritures' n'est pas un tableau, on retourne une structure vide pour éviter un crash.
    if (!Array.isArray(ecritures)) {
        console.warn("genererDonneesResultat a reçu des écritures non valides.");

        return {
            beneficeOuPerte: 0,
            sections: {},
            soldes: {}
        };
    }

    // 1. Calculer le solde de chaque compte (comme pour le bilan)
    const soldesComptes = new Map();
    comptes.forEach(c => soldesComptes.set(c.numero_compte, { ...c, solde: 0 }));
    ecritures.forEach(e => {
        if (soldesComptes.has(e.compte_general)) {
            const soldeActuel = soldesComptes.get(e.compte_general).solde;
            // Pour le CR, on inverse : Crédit = positif (produit), Débit = négatif (charge)
            soldesComptes.get(e.compte_general).solde = soldeActuel - parseFloat(e.debit || 0) + parseFloat(e.credit || 0);
        }
    });
    
    const calculerSoldePourPrefixes = (prefixes) => {
        let total = 0;
        soldesComptes.forEach((compte, numero) => {
            if (prefixes.some(prefix => numero.startsWith(prefix))) {
                total += compte.solde;
            }
        });
        return total;
    };

    // 2. Construire le résultat en parcourant la structure
    const resultat = {};
    let totalProduitsExploitation = 0;
    let totalChargesExploitation = 0;
    let totalProduitsFinanciers = 0;
    let totalChargesFinancieres = 0;

    resultat.produitsExploitation = RESULTAT_STRUCTURE['Produits d\'exploitation'].map(item => {
        const montant = calculerSoldePourPrefixes(item.comptes);
        totalProduitsExploitation += montant;
        return { ...item, montant };
    });
    
    resultat.chargesExploitation = RESULTAT_STRUCTURE['Charges d\'exploitation'].map(item => {
        const montant = -calculerSoldePourPrefixes(item.comptes); // Inverser le signe pour les charges
        totalChargesExploitation += montant;
        return { ...item, montant };
    });

    resultat.produitsFinanciers = RESULTAT_STRUCTURE['Produits financiers'].map(item => {
        const montant = calculerSoldePourPrefixes(item.comptes);
        totalProduitsFinanciers += montant;
        return { ...item, montant };
    });

    resultat.chargesFinancieres = RESULTAT_STRUCTURE['Charges financières'].map(item => {
        const montant = -calculerSoldePourPrefixes(item.comptes); // Inverser le signe
        totalChargesFinancieres += montant;
        return { ...item, montant };
    });

    // 3. Calculer les soldes intermédiaires de gestion
    resultat.totalProduitsExploitation = totalProduitsExploitation;
    resultat.totalChargesExploitation = totalChargesExploitation;
    resultat.resultatExploitation = totalProduitsExploitation - totalChargesExploitation;

    resultat.totalProduitsFinanciers = totalProduitsFinanciers;
    resultat.totalChargesFinancieres = totalChargesFinancieres;
    resultat.resultatFinancier = totalProduitsFinanciers - totalChargesFinancieres;

    resultat.resultatCourantAvantImpot = resultat.resultatExploitation + resultat.resultatFinancier;
    
    // Pour l'instant, exceptionnel et impôts sont à 0
    resultat.resultatExceptionnel = 0;
    resultat.impotSurBenefice = 0;

    resultat.beneficeOuPerte = resultat.resultatCourantAvantImpot - resultat.impotSurBenefice + resultat.resultatExceptionnel;

    return resultat;
};