import React from 'react';
import PageHeader from '../components/PageHeader';

const ConsultationEcritures = ({ 
    setPage, 
    ecritures = [], // On s'assure que ecritures est toujours un tableau
    loading, 
    refreshData, 
    handleEdit, 
    handleDelete, 
    clearEcritureToEdit 
}) => {

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        return num > 0 ? num.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-';
    };

    return (
        <div className="p-8">
            <PageHeader title="Écritures Comptables" subtitle="Consultation du journal" />
            
            <div className="mb-6 flex justify-between">
                <button
                    onClick={() => {
                        // On vérifie si la fonction existe avant de l'appeler
                        if (clearEcritureToEdit) {
                            clearEcritureToEdit();
                        }
                        setPage('saisie');
                    }}
                    className="px-5 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:scale-105 transform transition"
                >
                    ➕ Saisir une Écriture
                </button>
                <button 
                    onClick={() => setPage('poubelle')} 
                    className="px-4 py-2 text-gray-700 bg-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 transform transition"
                >
                    🗑️ Voir la corbeille
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                        <tr>
                            {['Date', 'Pièce', 'Compte', 'Libellé', 'Débit', 'Crédit', 'Actions'].map(h => 
                                <th 
                                    key={h} 
                                    className={`px-4 py-3 text-left font-semibold 
                                        ${['Débit', 'Crédit'].includes(h) ? 'text-right' : ''} 
                                        ${h === 'Actions' ? 'text-center' : ''}`}
                                >
                                    {h}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">Chargement des écritures...</td></tr>
                        ) : !Array.isArray(ecritures) || ecritures.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-8 text-gray-400">
                                    Aucune écriture comptable à afficher.
                                </td>
                            </tr>
                        ) : (
                            ecritures.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{e.date ? new Date(e.date).toLocaleDateString('fr-FR') : 'Date invalide'}</td>
                                    <td className="px-4 py-2">{e.numero_piece || '-'}</td>
                                    <td className="px-4 py-2">{e.compte_general}</td>
                                    <td className="px-4 py-2">{e.libelle_ligne || e.libelle_operation}</td>
                                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(e.debit)}</td>
                                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(e.credit)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleEdit(e)}
                                                className="text-blue-500 hover:text-blue-700" 
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(e.id)} 
                                                className="text-red-500 hover:text-red-700" 
                                                title="Supprimer"
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