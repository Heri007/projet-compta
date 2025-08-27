// Fichier : frontend/src/pages/DocumentationPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { FormulaireDocument } from '../components/FormulaireDocument';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const DocumentationPage = ({ envois, factures }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/documents`);
            setDocuments(res.data);
        } catch (error) {
            console.error("Erreur chargement des documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDelete = async (docId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            try {
                await axios.delete(`${API_URL}/api/documents/${docId}`);
                fetchDocuments(); // Rafraîchir la liste
            } catch (err) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    return (
        <div className="p-8">
            <PageHeader title="Gestion Documentaire" subtitle="Centralisez tous les documents liés à vos activités." />
            
            <div className="mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2 text-white font-semibold rounded-lg shadow-md bg-green-500 hover:scale-105 transform transition"
                >
                    ➕ Téléverser un Document
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Document">
                <FormulaireDocument 
                    onClose={() => setIsModalOpen(false)} 
                    refreshData={fetchDocuments}
                    envois={envois}
                    factures={factures}
                />
            </Modal>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            {['Document', 'Type', 'Date Upload', 'Lié à (Envoi)', 'Actions'].map(h =>
                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-8">Chargement...</td></tr>
                        ) : (
                            documents.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-bold">
                                        <a href={`${API_URL}/${doc.chemin_fichier}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {doc.nom_document}
                                        </a>
                                    </td>
                                    <td className="px-4 py-2">{doc.type_document}</td>
                                    <td className="px-4 py-2">{new Date(doc.date_upload).toLocaleString('fr-FR')}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{doc.envoi_id || '-'}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleDelete(doc.id)} className="text-red-500 hover:text-red-700">🗑️</button>
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

export default DocumentationPage;