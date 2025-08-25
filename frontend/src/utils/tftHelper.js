// src/utils/tftHelper.js

// --- CORRECTION : Utiliser le nom de fonction correct qui est exporté par le fichier ---
import { genererDonneesBilanComparatif } from './bilanHelperN1';
import { genererDonneesResultatComparatif } from './compteDeResultatHelperN1';

/**
 * Génère les données pour le Tableau des Flux de Trésorerie (Méthode Indirecte).
 * @param {Array} comptes - Le plan comptable.
 * @param {Array} ecritures - Toutes les écritures comptables.
 * @param {Date} dateClotureN - La date de clôture de l'exercice en cours (N).
 */
export const genererDonneesTFT = (comptes, ecritures, dateClotureN) => {
    // 1. On réutilise nos helpers existants pour obtenir les données du Bilan et du CR pour N et N-1
    // --- CORRECTION : Appeler la fonction avec son nom correct ---
    const bilan = genererDonneesBilanComparatif(comptes, ecritures, dateClotureN);
    const resultat = genererDonneesResultatComparatif(ecritures, dateClotureN);

    // 2. On extrait les données nécessaires de ces rapports
    const resultatNetN = resultat.soldes.beneficeOuPerteN;
    
    const dotationsAmortProv = resultat.sections['Charges d\'exploitation']
                                .find(l => l.libelle.startsWith('Dotations'))?.montantN || 0;

    // Calcul des variations du Bilan (Besoin en Fonds de Roulement)
    const varStocks = -(bilan.actif['ACTIF CIRCULANT'].sous_masses['Stocks'].totalN - bilan.actif['ACTIF CIRCULANT'].sous_masses['Stocks'].totalN1);
    const varClients = -(bilan.actif['ACTIF CIRCULANT'].sous_masses['Créances'].totalN - bilan.actif['ACTIF CIRCULANT'].sous_masses['Créances'].totalN1);
    const varFournisseurs = (bilan.passif['DETTES'].sous_masses['Dettes d\'exploitation'].totalN - bilan.passif['DETTES'].sous_masses['Dettes d\'exploitation'].totalN1);

    // 3. Calcul des flux par activité
    
    // FLUX OPERATIONNELS (A)
    const fluxAvantElementsExtra = resultatNetN + dotationsAmortProv + varStocks + varClients + varFournisseurs;
    const fluxOperationnelNet = fluxAvantElementsExtra;

    // FLUX D'INVESTISSEMENT (B)
    const decaissementsImmo = -(bilan.actif['ACTIF IMMOBILISE'].totalN - bilan.actif['ACTIF IMMOBILISE'].totalN1 - dotationsAmortProv);
    const fluxInvestissementNet = decaissementsImmo;

    // FLUX DE FINANCEMENT (C)
    const varCapitauxPropres = (bilan.passif['CAPITAUX PROPRES'].totalN - bilan.passif['CAPITAUX PROPRES'].totalN1) - resultatNetN;
    const varDettesFinancieres = (bilan.passif['DETTES'].sous_masses['Dettes financières'].totalN - bilan.passif['DETTES'].sous_masses['Dettes financières'].totalN1);
    const fluxFinancementNet = varCapitauxPropres + varDettesFinancieres;

    // 4. Calcul final et vérification
    const variationTresorerie = fluxOperationnelNet + fluxInvestissementNet + fluxFinancementNet;
    const tresorerieOuverture = bilan.actif['ACTIF CIRCULANT'].sous_masses['Trésorerie'].totalN1;
    const tresorerieCloture = bilan.actif['ACTIF CIRCULANT'].sous_masses['Trésorerie'].totalN;

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