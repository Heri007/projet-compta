// src/data/mockData.js

export const mockProjets = [
    { id: 1, nom: 'Exportation Cobalt T4-2024', totalProduits: 944709.82, totalCharges: 334173.83, statut: 'actif' },
    { id: 2, nom: 'Vente Nickel Lot-22B', totalProduits: 132147.22, totalCharges: 477225.49, statut: 'actif' },
    { id: 3, nom: 'Expédition Or-3', totalProduits: 216594.75, totalCharges: 9671.15, statut: 'actif' },
    { id: 4, nom: 'Ancien Projet Cuivre', totalProduits: 52057.52, totalCharges: 113744.71, statut: 'inactif' },
];

// --- MIS À JOUR ---
// Ajout des grains secs à la liste des articles pour la démonstration
export const mockArticles = [
    { code: 'GR-BE01', designation: 'Black-Eyes', unite: 'Tonne', compteStock: '370000', quantite: 15.5 },
    { code: 'GR-PN01', designation: 'Peanuts (Arachides)', unite: 'Tonne', compteStock: '370000', quantite: 22 },
    { code: 'GR-PC01', designation: 'Pois du Cap', unite: 'Tonne', compteStock: '370000', quantite: 12 },
    { code: 'PI-SA01', designation: 'Saphir brut', unite: 'Kg', compteStock: '371000', quantite: 2.5 },
    { code: 'PI-RB01', designation: 'Rubis brut', unite: 'Kg', compteStock: '371000', quantite: 1.8 },
];

export const mockMouvements = [
    { id: 1, date: '2024-08-20', type: 'Entrée', articleCode: 'GR-BE01', designation: 'Black-Eyes', quantite: 20, documentRef: 'FA-2024-08-012' },
    { id: 2, date: '2024-08-22', type: 'Sortie', articleCode: 'GR-BE01', designation: 'Black-Eyes', quantite: 4.5, documentRef: 'PROJET-001' },
    { id: 3, date: '2024-08-23', type: 'Entrée', articleCode: 'PI-SA01', designation: 'Saphir brut', quantite: 5, documentRef: 'FA-2024-08-015' },
    { id: 4, date: '2024-08-25', type: 'Entrée', articleCode: 'GR-PN01', designation: 'Peanuts (Arachides)', quantite: 10, documentRef: 'FA-2024-08-018' },
];

// --- MIS À JOUR ---
// Liste alphabétique complète pour les formulaires
export const LISTE_ARTICLES = [
  "Actinote", "Agate", "Alexandrite", "Améthyste", "Andalousite", "Apatite", "Aragonite",
  "Béryl Autres (saumon, vert, jaune, autres)", "Béryl Bleu", "Béryl Rose", "Béryllium",
  "Black-Eyes", "Calcédoine (bleu, autre)", "Chrome - Concentré", "Chrome - Rocheux",
  "Chrysocolle", "Chrysobéryl", "Chrysobéryl œil de chat", "Chrysoprase", "Citrine",
  "Cordiérite", "Cornaline", "Dumortiérite", "Emeraude", "Feldspath", "Fluorine (Bloc, géode)",
  "Graphite - Grosses paillettes", "Graphite - Petite, Moyennes paillettes", "Graphite - Poudre, Extrafines et fines paillettes",
  "Haricots (blancs, rouges)", "Ilménite - Concentré", "Jaspe", "Labradorite petit bloc",
  "Mungo Beans", "Opale", "Peanuts (Arachides)", "Pois du Cap", "Quartz fonte",
  "Quartz teinté bleu", "Quartz variété cristal prisme", "Rhodonite", "Rubis", "Saphir Bleu",
  "Saphir Bleu-Vert", "Saphir Jaune - Blanc", "Saphir Orange", "Saphir Rose",
  "Topaze (jaune, bleu)", "Tourmaline noir", "Tourmaline Rubellite et Indigolite", "Turquoise", "Zircon"
];