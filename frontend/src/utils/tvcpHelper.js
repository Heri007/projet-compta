// src/utils/tvcpHelper.js
// --- CORRECTION : Utiliser le nom de fonction correct qui est exporté par le fichier ---
import { genererDonneesBilanComparatif } from './bilanHelperN1'; 
import { genererDonneesResultatComparatif } from './compteDeResultatHelperN1';

/**
 * Génère les données pour le Tableau de Variation des Capitaux Propres.
 */
export const genererDonneesTVCP = (comptes, ecritures, dateClotureN) => {
    // Dates clés
    const dateClotureN_1 = new Date(dateClotureN);
    dateClotureN_1.setFullYear(dateClotureN.getFullYear() - 1);
    const dateClotureN_2 = new Date(dateClotureN);
    dateClotureN_2.setFullYear(dateClotureN.getFullYear() - 2);

    // 1. Obtenir les bilans complets pour les 3 dates de clôture
    // --- CORRECTION : Appeler la fonction avec son nom correct ---
    const bilanN = genererDonneesBilanComparatif(comptes, ecritures, dateClotureN);
    const bilanN1 = genererDonneesBilanComparatif(comptes, ecritures, dateClotureN_1);
    const bilanN2 = genererDonneesBilanComparatif(comptes, ecritures, dateClotureN_2);

    // 2. Obtenir les résultats des exercices N et N-1
    const resultat = genererDonneesResultatComparatif(ecritures, dateClotureN);
    const resultatNetN = resultat.soldes.beneficeOuPerteN;
    const resultatNetN1 = resultat.soldes.beneficeOuPerteN1;

    // 3. Extraire les soldes des capitaux propres à chaque date
    const cpN = bilanN.passif['CAPITAUX PROPRES'];
    const cpN1 = bilanN1.passif['CAPITAUX PROPRES'];
    const cpN2 = bilanN2.passif['CAPITAUX PROPRES'];

    // 4. Construire la structure de données pour le tableau
    const structureTVCP = [
        // --- Exercice N-1 ---
        {
            libelle: `Solde au 31 décembre ${dateClotureN_2.getFullYear()}`,
            capital: cpN2.sous_masses['Capital et réserves'].lignes.find(l => l.libelle === 'Capital')?.montantBrutN1 || 0,
            reserves: cpN2.sous_masses['Capital et réserves'].totalN1 - (cpN2.sous_masses['Capital et réserves'].lignes.find(l => l.libelle === 'Capital')?.montantBrutN1 || 0),
            resultat: cpN2.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN1 || 0,
        },
        // Mouvements de N-1 (simplifiés pour l'exemple)
        {
            libelle: `Affectation du résultat ${dateClotureN_2.getFullYear()}`,
            capital: 0,
            reserves: cpN2.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN1 || 0,
            resultat: -(cpN2.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN1 || 0),
        },
        { libelle: 'Résultat net exercice N-1', capital: 0, reserves: 0, resultat: resultatNetN1 },
        // --- Solde N-1 ---
        {
            libelle: `Solde au 31 décembre ${dateClotureN_1.getFullYear()}`,
            capital: cpN1.sous_masses['Capital et réserves'].lignes.find(l => l.libelle === 'Capital')?.montantBrutN || 0,
            reserves: cpN1.sous_masses['Capital et réserves'].totalN - (cpN1.sous_masses['Capital et réserves'].lignes.find(l => l.libelle === 'Capital')?.montantBrutN || 0),
            resultat: cpN1.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN || 0,
        },
        // --- Mouvements de N ---
        {
            libelle: `Affectation du résultat ${dateClotureN_1.getFullYear()}`,
            capital: 0,
            reserves: cpN1.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN || 0,
            resultat: -(cpN1.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN || 0),
        },
        { libelle: 'Résultat net exercice N', capital: 0, reserves: 0, resultat: resultatNetN },
        // --- Solde N ---
        {
            libelle: `Solde au 31 décembre ${dateClotureN.getFullYear()}`,
            capital: cpN.sous_masses['Capital et réserves'].lignes.find(l => l.libelle === 'Capital')?.montantBrutN || 0,
            reserves: cpN.sous_masses['Capital et réserves'].totalN - (cpN.sous_masses['Capital et réserves'].lignes.find(l => l.libelle === 'Capital')?.montantBrutN || 0),
            resultat: cpN.sous_masses['Résultat et subventions'].lignes.find(l => l.libelle.startsWith('Résultat'))?.montantBrutN || 0,
        }
    ];

    // Ajoute le total à chaque ligne
    return structureTVCP.map(row => ({ ...row, total: row.capital + row.reserves + row.resultat }));
};