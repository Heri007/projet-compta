// Ce fichier contiendra toutes nos fonctions de formatage réutilisables.

/**
 * Formate un nombre en chaîne de caractères pour l'affichage comptable.
 * Sépare les milliers, gère les décimales, et n'ajoute PAS de symbole de devise.
 * @param {number | string} value - La valeur numérique à formater.
 * @param {boolean} showZero - Si true, affiche "0" pour les valeurs nulles. Sinon, affiche une chaîne vide.
 * @returns {string} Le nombre formaté.
 */
export const formatNumber = (value, showZero = false) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return showZero ? '0,00' : '';
    }
    if (num === 0) {
      return showZero ? '0,00' : '';
    }
    // toLocaleString sépare automatiquement les milliers selon les standards français (espaces)
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };