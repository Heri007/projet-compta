/**
 * Calcule les soldes finaux de tous les comptes en tenant compte de leur nature.
 * @param {Array} comptes - Le plan comptable complet.
 * @param {Array} ecritures - Les écritures à prendre en compte.
 * @returns {Map<string, number>} Une Map avec { numero_compte: solde_final }.
 */
export const calculerSoldesFinaux = (comptes, ecritures) => {
    const soldes = new Map();
    if (!comptes || !Array.isArray(comptes)) return soldes;

    comptes.forEach(c => soldes.set(c.numero_compte, 0));
    if (!ecritures || !Array.isArray(ecritures)) return soldes;

    ecritures.forEach(e => {
        const compteNum = e.compte_general;
        if (!compteNum || !soldes.has(compteNum)) return;

        const classe = parseInt(String(compteNum)[0], 10);
        const debit = parseFloat(e.debit) || 0;
        const credit = parseFloat(e.credit) || 0;
        let variation = 0;

        // Actif (hors 1, 6, 7) et Charges (6) => Solde Débiteur
        if ([2, 3, 4, 5, 6].includes(classe)) {
            variation = debit - credit;
        } 
        // Passif (1), Capitaux (1), Produits (7) => Solde Créditeur
        else if ([1, 7].includes(classe)) {
            variation = credit - debit;
        }

        soldes.set(compteNum, soldes.get(compteNum) + variation);
    });

    return soldes;
};