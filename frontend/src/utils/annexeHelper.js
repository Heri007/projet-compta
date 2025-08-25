// src/utils/annexeHelper.js

/**
 * Génère les données pour le tableau d'évolution des immobilisations (brutes).
 * @param {Array} ecritures - Toutes les écritures comptables.
 * @param {Date} dateClotureN - La date de clôture de l'exercice en cours (N).
 * @returns {Object} - Un objet contenant les mouvements des immobilisations.
 */
export const genererDonneesTableauImmobilisations = (ecritures, dateClotureN) => {
    const dateDebutN = new Date(dateClotureN.getFullYear(), 0, 1);
    const dateClotureN_1 = new Date(dateClotureN.getFullYear() - 1, 11, 31);

    // 1. Filtrer les écritures par période
    // Écritures de l'exercice N pour les mouvements
    const ecrituresExerciceN = ecritures.filter(e => {
        const d = new Date(e.date);
        return d >= dateDebutN && d <= dateClotureN;
    });
    // Toutes les écritures jusqu'à N-1 pour le solde d'ouverture
    const ecrituresAnterieures = ecritures.filter(e => new Date(e.date) <= dateClotureN_1);

    // 2. Fonction pour calculer les mouvements sur les comptes d'immobilisation (Classe 2)
    const calculerMouvementsImmo = (ecrituresFiltrees) => {
        let debits = 0;
        let credits = 0;
        ecrituresFiltrees.forEach(e => {
            if (e.compte_general.startsWith('2')) {
                debits += parseFloat(e.debit || 0);
                credits += parseFloat(e.credit || 0);
            }
        });
        return { debits, credits };
    };

    // 3. Calculer les valeurs pour le tableau
    const mouvementsN = calculerMouvementsImmo(ecrituresExerciceN);
    const soldesAnterieurs = calculerMouvementsImmo(ecrituresAnterieures);

    const brutDebut = soldesAnterieurs.debits - soldesAnterieurs.credits;
    const augmentations = mouvementsN.debits;
    const diminutions = mouvementsN.credits;
    const brutFin = brutDebut + augmentations - diminutions;

    // Structure simplifiée pour une seule ligne "Total Immobilisations"
    // Pour un tableau complet, il faudrait itérer sur chaque type d'immo (corporelle, incorporelle...)
    return {
        brutDebut,
        augmentations,
        diminutions,
        brutFin,
    };
};