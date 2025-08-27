// Fichier : frontend/src/utils/balanceHelper.js

/**
 * Génère les données pour la Balance de Vérification Standard.
 * @param {Array} comptes - Le plan comptable complet.
 * @param {Array} ecritures - Les écritures pour la période.
 * @returns {Object} - Contenant la liste des lignes de la balance et les totaux.
 */
export const genererDonneesBalance = (comptes, ecritures) => {
    if (!comptes || !ecritures) return { lignes: [], totaux: {} };

    const balanceMap = new Map();

    // 1. Initialiser la balance avec tous les comptes du plan comptable
    comptes.forEach(c => {
        balanceMap.set(c.numero_compte, {
            numero_compte: c.numero_compte,
            libelle: c.libelle,
            totalDebit: 0,
            totalCredit: 0,
        });
    });

    // 2. Agréger les mouvements (débits et crédits)
    ecritures.forEach(e => {
        const compte = balanceMap.get(e.compte_general);
        if (compte) {
            compte.totalDebit += parseFloat(e.debit) || 0;
            compte.totalCredit += parseFloat(e.credit) || 0;
        }
    });

    // 3. Calculer les soldes finaux et formater les lignes
    const lignes = Array.from(balanceMap.values())
        // On ne garde que les comptes qui ont eu un mouvement
        .filter(c => c.totalDebit > 0 || c.totalCredit > 0)
        .map(c => {
            const classe = parseInt(String(c.numero_compte)[0], 10);
            const solde = c.totalDebit - c.totalCredit;

            let soldeDebit = 0;
            let soldeCredit = 0;

            // La logique comptable pour déterminer le type de solde
            if (([2, 3, 4, 5, 6].includes(classe) && solde > 0) || ([1, 7].includes(classe) && solde < 0)) {
                soldeDebit = Math.abs(solde);
            } else {
                soldeCredit = Math.abs(solde);
            }
            
            return { ...c, soldeDebit, soldeCredit };
        });

    // 4. Calculer les totaux généraux
    const totaux = {
        totalDebit: lignes.reduce((sum, l) => sum + l.totalDebit, 0),
        totalCredit: lignes.reduce((sum, l) => sum + l.totalCredit, 0),
        soldeDebit: lignes.reduce((sum, l) => sum + l.soldeDebit, 0),
        soldeCredit: lignes.reduce((sum, l) => sum + l.soldeCredit, 0),
    };

    return { lignes, totaux };
};