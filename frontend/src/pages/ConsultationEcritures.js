import React, { useMemo, useState } from 'react'; // Importer useState
import PageHeader from '../components/PageHeader';
import PrintPreviewModal from '../components/PrintPreviewModal'; // Importer la modale d'impression
import JournalPrintPreview from '../components/JournalPrintPreview'; // Importer le composant d'aperçu

const ConsultationEcritures = ({ 
    setPage, 
    ecritures = [], 
    loading, 
    refreshData, 
    handleEdit, 
    handleDelete, 
    clearEcritureToEdit 
}) => {

    // --- AJOUT : État pour gérer l'ouverture de la modale d'impression ---
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        return num ? num.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '';
    };

    const piecesComptables = useMemo(() => {
        if (!ecritures || ecritures.length === 0) return [];
        
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

        return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [ecritures]);

    const handleEditClick = (numeroPiece) => {
        const ecritureComplete = ecritures.filter(e => e.numero_piece === numeroPiece);
        if (ecritureComplete.length > 0) {
            handleEdit(ecritureComplete);
        }
    };

    const handleDeleteClick = (numeroPiece) => {
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
                {/* --- AJOUT : Bouton Imprimer --- */}
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={piecesComptables.length === 0}
                    className="px-4 py-2 text-gray-700 bg-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🖨️ Imprimer le Journal
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* --- TABLEAU PRINCIPAL --- */}
                <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                        <tr>
                            {/* --- CORRECTION : AJOUT DE BORDURES VERTICALES --- */}
                            <th className="px-4 py-3 text-left font-semibold border-r border-gray-400/30">Date</th>
                            <th className="px-4 py-3 text-left font-semibold border-r border-gray-400/30">Pièce</th>
                            <th className="px-4 py-3 text-left font-semibold border-r border-gray-400/30">Journal</th>
                            <th className="px-4 py-3 text-left font-semibold border-r border-gray-400/30">Libellé Opération</th>
                            <th className="px-4 py-3 text-left font-semibold border-r border-gray-400/30">Détails</th>
                            <th className="px-4 py-3 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-500">Chargement...</td></tr>
                        ) : piecesComptables.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-400">Aucune écriture.</td></tr>
                        ) : (
                            piecesComptables.map(piece => (
                                <tr key={piece.numero_piece || piece.lignes[0].id} className="hover:bg-gray-50">
                                    {/* --- CORRECTION : AJOUT DE BORDURES VERTICALES --- */}
                                    <td className="px-4 py-2 border-r border-gray-200">{new Date(piece.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-2 font-mono border-r border-gray-200">{piece.numero_piece}</td>
                                    <td className="px-4 py-2 border-r border-gray-200">{piece.journal_code}</td>
                                    <td className="px-4 py-2 border-r border-gray-200">{piece.libelle_operation}</td>
                                    
                                    {/* --- CORRECTION : CELLULE "DÉTAILS" AVEC TABLEAU IMBRIQUÉ --- */}
                                    <td className="p-0 border-r border-gray-200">
    <table className="w-full text-sm">
        <thead>
            {/* --- CORRECTION APPLIQUÉE À LA LIGNE SUIVANTE --- */}
            <tr className="bg-gray-50 text-center">
                <th className="p-1 font-medium text-gray-500 w-1/4 border-b border-r border-gray-200">Compte</th>
                <th className="p-1 font-medium text-gray-500 w-2/4 border-b border-r border-gray-200">Libellé</th>
                <th className="p-1 font-medium text-gray-500 w-1/4 border-b border-r border-gray-200">Débit</th>
                <th className="p-1 font-medium text-gray-500 w-1/4 border-b border-gray-200">Crédit</th>
            </tr>
        </thead>
        <tbody>
            {piece.lignes.map(ligne => (
                <tr key={ligne.id}>
                    {/* Le contenu reste aligné à gauche/droite pour une meilleure lisibilité */}
                    <td className="p-1 border-r border-gray-200">{ligne.compte_general}</td>
                    <td className="p-1 truncate border-r border-gray-200">{ligne.libelle_ligne}</td>
                    <td className="p-1 text-right font-mono border-r border-gray-200">{formatCurrency(ligne.debit)}</td>
                    <td className="p-1 text-right font-mono">{formatCurrency(ligne.credit)}</td>
                </tr>
            ))}
        </tbody>
    </table>
</td>                                 
                                    <td className="px-4 py-2 text-center align-middle">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                disabled={piece.journal_code === 'VE'}
                                                onClick={() => handleEditClick(piece.numero_piece)}
                                                className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed" 
                                                title={piece.journal_code === 'VE' ? "Non modifiable" : "Modifier"}
                                            >✏️</button>
                                            <button 
                                                disabled={piece.journal_code === 'VE'}
                                                onClick={() => handleDeleteClick(piece.numero_piece)} 
                                                className="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed" 
                                                title={piece.journal_code === 'VE' ? "Non supprimable" : "Supprimer"}
                                            >🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* --- AJOUT : Modale d'impression --- */}
            {/* Elle utilise un composant générique `PrintPreviewModal` que vous avez déjà */}
            {isPreviewOpen && (
                <PrintPreviewModal 
                isOpen={isPreviewOpen} // On passe la prop "isOpen" que le composant attend
                onClose={() => setIsPreviewOpen(false)} // La fonction de fermeture
                title="Aperçu du Journal Comptable" // Un titre pour la modale
            >
                {/* Le contenu à imprimer est passé comme enfant, c'est parfait */}
                <JournalPrintPreview piecesComptables={piecesComptables} />
            </PrintPreviewModal>
            )}
        </div>
    );
};

export default ConsultationEcritures;