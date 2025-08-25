import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import InvoicePreview from '../components/Facture';

import axios from 'axios';

// Mettre à jour les statuts et les couleurs
const STATUTS = ['Tous', 'Proforma', 'Définitive', 'Convertie'];

// const getStatusClasses = (statut) => {  // Supprimer cette fonction
//     switch (statut) {
//         case 'Proforma': return 'bg-blue-100 text-blue-800';
//         case 'Définitive': return 'bg-green-100 text-green-800';
//         case 'Convertie': return 'bg-gray-100 text-gray-500';
//         default: return 'bg-gray-100 text-gray-800';
//     }
// };

const formatCurrency = (value) => `$ ${parseFloat(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`;

const ListeDesVentesPage = ({ setPage, handleConvertToDefinitive, factures: facturesBrutes, refreshData }) => {
    const [filtreStatut, setFiltreStatut] = useState('Tous');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const facturesTransformees = useMemo(() => {
        if (!facturesBrutes) return [];
        return facturesBrutes.map(f => ({
            id: f.id,
            numeroFacture: f.numero_facture,
            clientNom: f.client_nom || 'N/A',
            clientCode: f.client_code || f.clientCode || 'N/A',
            date: f.date_facture ? new Date(f.date_facture).toLocaleDateString('fr-FR') : '',
            montant: parseFloat(f.montant) || 0,
            statut: f.type_facture?.toLowerCase() === 'proforma' ? 'Proforma' : 'Définitive',
            envoiId: f.envoi_id || null,
            ...f
        }));
    }, [facturesBrutes]);

    const facturesAffichees = useMemo(() => {
        if (filtreStatut === 'Tous') return facturesTransformees;
        return facturesTransformees.filter(f => f.statut === filtreStatut);
    }, [facturesTransformees, filtreStatut]);

    const openFactureModal = async (factureId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/factures/${factureId}`);
            setSelectedFacture(response.data);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Erreur lors de l'ouverture de la facture :", err);
            alert("Impossible d'ouvrir la facture.");
        }
    };

    const closeModal = () => {
        setSelectedFacture(null);
        setIsModalOpen(false);
    };

    const handlePrint = () => {
        if (!selectedFacture) return;
        const printContent = document.getElementById('invoice-preview-content');
        const printWindow = window.open('', '', 'width=900,height=600');
        printWindow.document.write('<html><head><title>Facture</title></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const renderActions = (facture) => {
        // L'action n'est disponible que si le statut est 'Proforma' ET que `type_facture` est 'Proforma'
        if (facture.statut === 'Proforma' && facture.type_facture === 'Proforma') {
            return (
                <button
                    onClick={() => handleConvertToDefinitive(facture)}
                    className="text-sm text-green-600 hover:underline"
                >
                    Convertir en Définitive
                </button>
            );
        } else {
            return <span className="text-sm text-gray-400">-</span>;
        }
    };
    return (
        <div className="p-8">
            <PageHeader title="Suivi des Factures de Vente" subtitle="Cliquez sur le statut pour voir le détail." />

            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
                    {STATUTS.map(statut => (
                        <button
                            key={statut}
                            onClick={() => setFiltreStatut(statut)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filtreStatut === statut ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-white/50'}`}
                        >
                            {statut}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setPage('creation_facture')}
                    className="px-5 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transform transition"
                >
                    ➕ Nouvelle Facture Proforma
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['N° Facture', 'Client', 'Date', 'Montant', 'Statut', 'Actions', 'Ref Envoi'].map(h =>
                                <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facturesAffichees.map(facture => (
                            <tr key={facture.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-700">{facture.numeroFacture}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{facture.clientNom}</span>
                                        <span className="text-xs text-gray-500 font-mono">{facture.clientCode}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{facture.date}</td>
                                <td className="px-4 py-3 font-mono text-right text-gray-800">{formatCurrency(facture.montant)}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => openFactureModal(facture.id)}
                                        className={`px-2 py-1 rounded ${facture.statut === 'Proforma' ? 'bg-yellow-300 hover:bg-yellow-400' : 'bg-green-300 hover:bg-green-400'}`}
                                    >
                                        {facture.statut}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-center">{renderActions(facture)}</td>
                                <td className="px-4 py-3 text-center">{facture.envoiId || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedFacture && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 font-bold text-xl">×</button>
                        <div id="invoice-preview-content" className="p-6">
                            <InvoicePreview data={selectedFacture} />
                        </div>
                        <div className="flex justify-end p-4 border-t">
                            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">🖨️ Imprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListeDesVentesPage;