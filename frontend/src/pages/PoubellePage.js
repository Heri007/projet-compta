import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- NOUVEAU : Helper pour formater la monnaie ---
const formatCurrency = (val) => {
    // S'assure que val est un nombre avant de formater
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return '-';
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar`;
};

const PoubellePage = ({ setPage }) => {
    const [deletedEcritures, setDeletedEcritures] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeleted = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/ecritures/deleted`);
            setDeletedEcritures(res.data);
        } catch (err) {
            console.error("Erreur lors du chargement de la corbeille", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeleted();
    }, []);

    const handleRestore = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir restaurer cette ligne ?")) {
            try {
                await axios.put(`${API_URL}/api/ecritures/restore/${id}`);
                alert("Ligne restaurée !");
                fetchDeleted(); // Recharger la liste pour enlever l'élément restauré
            } catch (err) {
                alert("Erreur lors de la restauration.");
            }
        }
    };

    return (
        <div className="p-8">
            <PageHeader title="Corbeille" subtitle="Liste des écritures et pièces supprimées." />
            <button onClick={() => setPage('ecritures')} className="mb-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                &larr; Retour aux écritures
            </button>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            {/* --- MODIFIÉ : Ajout de la colonne Montant --- */}
                            <th className="p-2 text-left font-semibold text-gray-700">Date</th>
                            <th className="p-2 text-left font-semibold text-gray-700">Pièce</th>
                            <th className="p-2 text-left font-semibold text-gray-700">Libellé</th>
                            <th className="p-2 text-right font-semibold text-gray-700">Montant</th>
                            <th className="p-2 text-center font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            // --- MODIFIÉ : colSpan passe de 4 à 5 ---
                            <tr><td colSpan="5" className="text-center p-4">Chargement...</td></tr>
                        ) : deletedEcritures.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-4 text-gray-500">La corbeille est vide.</td></tr>
                        ) : (
                            deletedEcritures.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="p-2">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="p-2">{e.numero_piece || '-'}</td>
                                    <td className="p-2">{e.libelle_ligne}</td>
                                    {/* --- NOUVEAU : Cellule pour le montant --- */}
                                    <td className="p-2 text-right font-mono">
                                        {/* Affiche le débit s'il est > 0, sinon le crédit */}
                                        {formatCurrency(parseFloat(e.debit) > 0 ? e.debit : e.credit)}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleRestore(e.id)} className="text-green-600 font-semibold hover:underline">Restaurer</button>
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

export default PoubellePage;