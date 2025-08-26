// Fichier : frontend/src/pages/ImmobilisationsPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { FormulaireImmobilisation } from '../components/FormulaireImmobilisation';
import { formatNumber } from '../utils/formatUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ImmobilisationsPage = ({ planComptable, refreshData }) => {
    const [immobilisations, setImmobilisations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchImmobilisations = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/immobilisations`);
            setImmobilisations(res.data);
        } catch (error) {
            console.error("Erreur chargement des immobilisations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImmobilisations();
    }, []);

    // On passe la fonction de rechargement au formulaire pour qu'il puisse mettre à jour la liste
    const handleRefresh = () => {
        fetchImmobilisations();
        if (refreshData) refreshData(); // Rafraîchit aussi les données globales de l'app si besoin
    };

    return (
        <div className="p-8">
            <PageHeader title="Registre des Immobilisations" subtitle="Gérez les biens durables de votre entreprise." />
            
            <div className="mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transform transition"
                >
                    ➕ Ajouter une Immobilisation
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Immobilisation">
                <FormulaireImmobilisation 
                    onClose={() => setIsModalOpen(false)} 
                    refreshData={handleRefresh} 
                    planComptable={planComptable} 
                />
            </Modal>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            {['Libellé', 'Date Acq.', 'Valeur Origine', 'Durée', 'Statut', 'Comptes (Immo/Amort)'].map(h =>
                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-8">Chargement...</td></tr>
                        ) : (
                            immobilisations.map(immo => (
                                <tr key={immo.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-bold">{immo.libelle}</td>
                                    <td className="px-4 py-2">{new Date(immo.date_acquisition).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-2 text-right font-mono">{formatNumber(immo.valeur_origine, true)}</td>
                                    <td className="px-4 py-2 text-center">{immo.duree_amortissement} ans</td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {immo.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 font-mono text-sm">
                                        {immo.compte_immobilisation} / {immo.compte_amortissement}
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

export default ImmobilisationsPage;