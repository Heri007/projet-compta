// Ce fichier contiendra des fonctions d'aide pour l'interface utilisateur.

/**
 * Retourne les classes Tailwind CSS pour un statut de facture donné.
 * @param {string} statut - Le statut de la facture ('Proforma' ou 'Definitive').
 * @returns {string} Les classes CSS correspondantes.
 */
export const getStatusClasses = (statut) => {
    switch (statut) {
        case 'Proforma': 
            return 'bg-yellow-200 text-yellow-800';
        case 'Definitive': 
            return 'bg-green-200 text-green-800';
        default: 
            return 'bg-gray-200 text-gray-600';
    }
};