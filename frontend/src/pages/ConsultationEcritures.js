import React, { useMemo } from 'react'; // Importer useMemo
import PageHeader from '../components/PageHeader';

const ConsultationEcritures = ({ 
    setPage, 
    ecritures = [], 
    loading, 
    refreshData, 
    handleEdit, 
    handleDelete, // handleDelete sera une nouvelle fonction que nous créerons dans App.js
    clearEcritureToEdit 
}) => {

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        // Ne retourne un format que si la valeur est non nulle
        return num ? num.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '';
    };

    // --- CORRECTION MAJEURE : Regrouper les écritures par pièce ---
    const piecesComptables = useMemo(() => {
        if (!ecritures || ecritures.length === 0) return [];
        
        // On regroupe toutes les lignes par `numero_piece`
        const grouped = ecritures.reduce((acc, ecriture) => {
            const pieceId = ecriture.numero_piece || `no-piece-${ecriture.id}`;
            if (!acc[pieceId]) {
                acc[pieceId] = {
                    numero_piece: ecriture.numero_piece,
                    date: ecriture.date,
                    libelle_operation: ecriture.libelle_operation,
                    journal_code: ecriture.journal_code,
                    lignes: []
                };
            }
            acc[pieceId].lignes.push(ecriture);
            return acc;
        }, {});

        // On convertit l'objet en tableau et on le trie par date
        return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [ecritures]);


    // --- NOUVELLES FONCTIONS DE GESTION DES CLICS ---
    const handleEditClick = (numeroPiece) => {
        // On retrouve toutes les lignes de la pièce dans le tableau original
        const ecritureComplete = ecritures.filter(e => e.numero_piece === numeroPiece);
        if (ecritureComplete.length > 0) {
            handleEdit(ecritureComplete); // On envoie le tableau complet
        }
    };

    const handleDeleteClick = (numeroPiece) => {
        // On passe directement le numéro de pièce à la fonction de suppression
        // que nous allons créer dans App.js
        handleDelete(numeroPiece);
    };


    return (
        <div className="p-8">
            <PageHeader title="Écritures Comptables" subtitle="Consultation du journal" />
            
            <div className="mb-6 flex justify-between">
                <button
                    onClick={() => {
                        if (clearEcritureToEdit) clearEcritureToEdit();
                        setPage('saisie');
                    }}
                    className="px-5 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:scale-105 transform transition"
                >
                    ➕ Saisir une Écriture
                </button>
                {/* ... bouton corbeille inchangé */}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                        <tr>
                            {/* Entêtes du tableau modifiées pour une vue par pièce */}
                            {['Date', 'Pièce', 'Journal', 'Libellé Opération', 'Détails', 'Actions'].map(h => 
                                <th key={h} className="px-4 py-3 text-left font-semibold">
                                    {h}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-500">Chargement...</td></tr>
                        ) : piecesComptables.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-400">Aucune écriture.</td></tr>
                        ) : (
                            // On boucle sur les pièces regroupées, pas sur les lignes individuelles
                            piecesComptables.map(piece => (
                                <tr key={piece.numero_piece} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{new Date(piece.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-2 font-mono">{piece.numero_piece}</td>
                                    <td className="px-4 py-2">{piece.journal_code}</td>
                                    <td className="px-4 py-2">{piece.libelle_operation}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {/* Affichage des lignes de la pièce */}
                                        {piece.lignes.map(ligne => (
                                            <div key={ligne.id} className="grid grid-cols-[80px_1fr_80px_80px] gap-2">
                                                <span>{ligne.compte_general}</span>
                                                <span className="truncate">{ligne.libelle_ligne}</span>
                                                <span className="text-right font-mono">{formatCurrency(ligne.debit)}</span>
                                                <span className="text-right font-mono">{formatCurrency(ligne.credit)}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                // On ne peut pas modifier une écriture de vente (générée par facture)
                                                disabled={piece.journal_code === 'VE'}
                                                onClick={() => handleEditClick(piece.numero_piece)}
                                                className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed" 
                                                title={piece.journal_code === 'VE' ? "Non modifiable (générée par une vente)" : "Modifier la pièce"}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                disabled={piece.journal_code === 'VE'}
                                                onClick={() => handleDeleteClick(piece.numero_piece)} 
                                                className="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed" 
                                                title={piece.journal_code === 'VE' ? "Non supprimable (générée par une vente)" : "Supprimer la pièce"}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConsultationEcritures;