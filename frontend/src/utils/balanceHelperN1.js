// Fichier : frontend/src/utils/balanceHelperN1.js

import { calculerSoldesFinaux } from './calculsComptables';

/**
 * Génère les données pour la Balance de Vérification Comparative.
 * @param {Array} comptes - Le plan comptable.
 * @param {Array} ecritures - Toutes les écritures.
 * @param {Date} dateClotureN - La date de clôture de l'exercice en cours.
 * @returns {Object} - Contenant la liste des lignes et les totaux.
 */
export const genererDonneesBalanceComparatif = (comptes, ecritures, dateClotureN) => {
    if (!comptes || !ecritures || !dateClotureN) return { lignes: [], totaux: {} };

    const dateClotureN_1 = new Date(dateClotureN);
    dateClotureN_1.setFullYear(dateClotureN.getFullYear() - 1);

    const ecrituresN = ecritures.filter(e => new Date(e.date) <= dateClotureN);
    const ecrituresN_1 = ecritures.filter(e => new Date(e.date) <= dateClotureN_1);

    const soldesN = calculerSoldesFinaux(comptes, ecrituresN);
    const soldesN_1 = calculerSoldesFinaux(comptes, ecrituresN_1);

    const lignes = comptes
        .map(compte => ({
            numero_compte: compte.numero_compte,
            libelle: compte.libelle,
            soldeN: soldesN.get(compte.numero_compte) || 0,
            soldeN1: soldesN_1.get(compte.numero_compte) || 0,
        }))
        // On ne garde que les comptes avec un solde dans au moins une des deux périodes
        .filter(ligne => ligne.soldeN !== 0 || ligne.soldeN1 !== 0);
        
    const totaux = {
        soldeN: lignes.reduce((sum, l) => sum + l.soldeN, 0),
        soldeN1: lignes.reduce((sum, l) => sum + l.soldeN1, 0),
    };

    return { lignes, totaux };
};