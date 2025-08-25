// src/data/reportsData.js

/**
 * Définit la structure hiérarchique du Centre de Rapports.
 * Chaque objet a un 'id' unique utilisé pour le routage dans l'application.
 */
export const REPORTS_DATA = [
  {
    id: 'financiers',
    nom: 'Financiers',
    description: "Les rapports Financiers vous donnent un aperçu de la santé de votre entreprise et de son flux de trésorerie. Cette section comprend plusieurs variations des rapports financiers de base : Bilan, états des résultats et balance de vérification.",
    rapports: [
      { id: 'bilan', nom: 'Bilan', isStyled: true,
        children: [ { id: 'bilan_std', nom: 'Standard' }, { id: 'bilan_comp', nom: 'Comparatif (N & N-1)' } ] }, // `isStyled: true`
      { id: 'tvcp', nom: 'Tableau de Variation des Capitaux Propres (TVCP)', isStyled: true, 
        children: [ { id: 'tvcp_std', nom: 'Standard' } ] }, // `isStyled: true`
      { id: 'resultats', nom: 'Compte de résultat', isStyled: true,
        children: [ { id: 'resultat_std', nom: 'Standard' }, { id: 'resultat_comp', nom: 'Comparatifs (N & N-1)' } ] }, // `isStyled: true`
      // ... (Bilan, Etat des résultats)
        { id: 'tft', nom: 'Tableau des Flux de Trésorerie (TFT)', isStyled: true,
        children: [ { id: 'tft_indirect', nom: 'Méthode Indirecte' } ] }, // `isStyled: true`
      { id: 'balance', nom: 'Balance de vérification', isStyled: true,
        children: [ { id: 'balance_std', nom: 'Standard' }, { id: 'balance_comp', nom: 'Comparatif' } ] }, // `isStyled: true`
    ]
  },
  {
    id: 'bancaires',
    nom: 'Opérations bancaires',
    description: "Les rapports Opérations bancaires vous aident à gérer les comptes bancaires et autres comptes de votre entreprise que vous rapprochez du relevé bancaire. Vous pouvez également imprimer une liste de tous les chèques qui ont été imprimés, même s'ils n'ont pas été enregistrés dans vos livres.",
    rapports: [
      { id: 'rap_comp', nom: 'Sommaire des rapprochements de comptes' },
      { id: 'rap_detail', nom: 'Détail des rapprochements de comptes' },
      { id: 'journ_cheques', nom: 'Journal des chèques' },
      { id: 'journ_depot', nom: 'Journal de dépôt direct' },
    ]
  },
  {
    id: 'annexe',
    nom: 'Annexe',
    description: "L'Annexe fournit les explications nécessaires à la compréhension du bilan et du compte de résultat.",
    rapports: [
        { id: 'annexe_std', nom: 'Consulter l\'Annexe' }
    ]
  },
  {
    id: 'comptes',
    nom: 'Comptes',
    description: "Ces rapports affichent des informations détaillées sur les comptes de votre plan comptable. Vous pouvez afficher un rapport pour un seul compte, une plage de comptes ou tous les comptes.",
    rapports: [
      { id: 'liste_comptes', nom: 'Liste des comptes' },
      { id: 'transactions_compte', nom: 'Transactions par compte' },
    ]
  },
  // Ajoutez d'autres catégories ici (Clients & ventes, Fournisseurs & achats, etc.) au fur et à mesure
];

/**
 * Données fictives pour la prévisualisation de la Balance de Vérification.
 * Peut être retiré lorsque les données réelles sont calculées.
 */
export const MOCK_BALANCE_DATA = [
    { num: '10200', nom: 'Trans. au comptant à déposer', debit: 7425.98, credit: 0 },
    { num: '10800', nom: 'Banque Régal, fournisseurs', debit: 65497.48, credit: 0 },
    { num: '10900', nom: 'Banque Régal, clients', debit: 196601.34, credit: 0 },
    { num: '11000', nom: 'Banque Oakville Dominion, paye', debit: 89968.88, credit: 0 },
    { num: '12000', nom: 'Comptes clients', debit: 169894.64, credit: 3412.00 },
    { num: '12400', nom: 'Avances à percevoir', debit: 0, credit: 140000.00 },
    { num: '13000', nom: 'Achats prépayés', debit: 755.67, credit: 0 },
];

// --- NOUVEAU : Fonction utilitaire pour trouver un rapport par son ID ---
export const findReportById = (reportId) => {
  for (const category of REPORTS_DATA) {
      for (const report of category.rapports) {
          if (report.id === reportId) {
              return report;
          }
          if (report.children) {
              const found = report.children.find(child => child.id === reportId);
              if (found) return found;
          }
      }
  }
  return null;
};