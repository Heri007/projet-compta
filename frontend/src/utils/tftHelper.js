// Fichier : frontend/src/utils/tftHelper.js

import { genererDonneesBilanComparatif } from './bilanHelperN1';
import { genererDonneesResultatComparatif } from './compteDeResultatHelperN1';

/**
 * Génère les données pour le Tableau des Flux de Trésorerie (Méthode Indirecte).
 */
export const genererDonneesTFT = (comptes, ecritures, dateClotureN) => {
    // --- SÉCURITÉ : Vérifier les données en entrée ---
    if (!comptes || !ecritures || !dateClotureN) {
        // Retourner une structure vide mais valide si les données ne sont pas prêtes
        return { resultatNetN: 0, dotationsAmortProv: 0, varStocks: 0, varClients: 0, varFournisseurs: 0, fluxOperationnelNet: 0, decaissementsImmo: 0, fluxInvestissementNet: 0, varCapitauxPropres: 0, varDettesFinancieres: 0, fluxFinancementNet: 0, variationTresorerie: 0, tresorerieOuverture: 0, tresorerieCloture: 0 };
    }

    // 1. On réutilise nos helpers existants
    const bilan = genererDonneesBilanComparatif(comptes, ecritures, dateClotureN);
    const resultat = genererDonneesResultatComparatif(comptes, ecritures, dateClotureN);

    // --- SÉCURITÉ : Vérifier que les helpers ont retourné des données valides ---
    if (!bilan.actif || !bilan.passif || !resultat.sections || !resultat.soldes) {
        return { resultatNetN: 0, dotationsAmortProv: 0, /* ... etc. */ };
    }

    // 2. On extrait les données nécessaires de ces rapports
    const resultatNetN = resultat.soldes.beneficeOuPerteN || 0;
    
    // --- CORRECTION : Accès sécurisé aux données ---
    const chargesExploitation = resultat.sections['Charges d\'exploitation'] || [];
    const dotationsAmortProv = chargesExploitation.find(l => l.libelle.startsWith('Dotations'))?.montantN || 0;

    // Calcul des variations du Bilan (avec des valeurs par défaut pour éviter les erreurs)
    const varStocks = -((bilan.actif['ACTIF CIRCULANT']?.sous_masses['Stocks']?.totalN || 0) - (bilan.actif['ACTIF CIRCULANT']?.sous_masses['Stocks']?.totalN1 || 0));
    const varClients = -((bilan.actif['ACTIF CIRCULANT']?.sous_masses['Créances']?.totalN || 0) - (bilan.actif['ACTIF CIRCULANT']?.sous_masses['Créances']?.totalN1 || 0));
    const varFournisseurs = ((bilan.passif['DETTES']?.sous_masses['Dettes d\'exploitation']?.totalN || 0) - (bilan.passif['DETTES']?.sous_masses['Dettes d\'exploitation']?.totalN1 || 0));

    // 3. Calcul des flux par activité
    const fluxOperationnelNet = resultatNetN + dotationsAmortProv + varStocks + varClients + varFournisseurs;

    const decaissementsImmo = -((bilan.actif['ACTIF IMMOBILISE']?.totalN || 0) - (bilan.actif['ACTIF IMMOBILISE']?.totalN1 || 0) - dotationsAmortProv);
    const fluxInvestissementNet = decaissementsImmo;

    const varCapitauxPropres = ((bilan.passif['CAPITAUX PROPRES']?.totalN || 0) - (bilan.passif['CAPITAUX PROPRES']?.totalN1 || 0)) - resultatNetN;
    const varDettesFinancieres = ((bilan.passif['DETTES']?.sous_masses['Dettes financières']?.totalN || 0) - (bilan.passif['DETTES']?.sous_masses['Dettes financières']?.totalN1 || 0));
    const fluxFinancementNet = varCapitauxPropres + varDettesFinancieres;

    // 4. Calcul final et vérification
    const variationTresorerie = fluxOperationnelNet + fluxInvestissementNet + fluxFinancementNet;
    const tresorerieOuverture = bilan.actif['ACTIF CIRCULANT']?.sous_masses['Trésorerie']?.totalN1 || 0;
    const tresorerieCloture = bilan.actif['ACTIF CIRCULANT']?.sous_masses['Trésorerie']?.totalN || 0;

    return {
        resultatNetN,
        dotationsAmortProv,
        varStocks,
        varClients,
        varFournisseurs,
        fluxOperationnelNet,
        decaissementsImmo,
        fluxInvestissementNet,
        varCapitauxPropres,
        varDettesFinancieres,
        fluxFinancementNet,
        variationTresorerie,
        tresorerieOuverture,
        tresorerieCloture
    };
};