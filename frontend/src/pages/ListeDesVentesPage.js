import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import InvoicePage from './InvoicePage';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const STATUTS = ['Tous', 'Proforma', 'Definitive'];

const getStatusClasses = (statut) => {
    switch (statut) {
        case 'Proforma':
            return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
        case 'Definitive':
            return 'bg-green-200 text-green-800 hover:bg-green-300';
        case 'Convertie':
            return 'bg-gray-200 text-gray-600';
        default:
            return 'bg-red-200 text-red-800';
    }
};

const formatCurrency = (value) => `$ ${parseFloat(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`;

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
        return '';
    }
};

const ListeDesVentesPage = ({ setPage, handleConvertToDefinitive, factures: facturesBrutes, refreshData }) => {
    const [filtreStatut, setFiltreStatut] = useState('Tous');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [archivingId, setArchivingId] = useState(null);

    const handleArchive = async (facture) => {
        if (!facture || !facture.id) return;
        setArchivingId(facture.id);
        try {
            const response = await axios.post(`${API_URL}/api/factures/${facture.id}/archive`);
            alert(response.data.message);
            if (refreshData) refreshData(); 
        } catch (err) {
            console.error("Erreur d'archivage:", err);
            alert(err.response?.data?.error || "Une erreur est survenue lors de l'archivage.");
        } finally {
            setArchivingId(null);
        }
    };

    const facturesTransformees = useMemo(() => {
        if (!Array.isArray(facturesBrutes)) return [];
        
        const normalizeStatut = (s) => {
            if (!s || typeof s !== 'string') return 'Inconnu';
            const trimmed = s.trim().toLowerCase();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        };

        return facturesBrutes.map(f => ({
            id: f.id,
            numeroFacture: f.numero_facture,
            clientNom: f.client_nom || 'Client non trouvé',
            clientCode: f.code_tiers,
            date: formatDate(f.date_facture),
            montant: parseFloat(f.montant) || 0,
            statut: normalizeStatut(f.type_facture),
            envoiId: f.envoi_id || null,
            ...f
        }));
    }, [facturesBrutes]);

    const facturesAffichees = useMemo(() => {
        if (filtreStatut === 'Tous') {
            return facturesTransformees.filter(f => f.statut !== 'Convertie');
        }
        return facturesTransformees.filter(f => f.statut === filtreStatut && f.statut !== 'Convertie');
    }, [facturesTransformees, filtreStatut]);

    const openFactureModal = (facture) => {
        setSelectedFacture(facture);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedFacture(null);
        setIsModalOpen(false);
    };
    
    const handlePrint = () => {
        if (!selectedFacture) return;
        const printContent = document.getElementById('invoice-preview-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Veuillez autoriser les pop-ups pour imprimer ce document.");
            return;
        }

        printWindow.document.write('<html><head><title>Imprimer la Facture</title>');
        printWindow.document.write('<link rel="stylesheet" href="/document-styles.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };
    
    const renderActions = (facture) => {
        return (
            <div className="flex items-center justify-center gap-3">
                {facture.statut === 'Proforma' && !facture.est_convertie && (
                    <button onClick={() => handleConvertToDefinitive(facture)} className="text-sm text-green-600 hover:underline" title="Convertir">Convertir</button>
                )}
                {facture.statut === 'Proforma' && facture.est_convertie && (
                    <span className="text-sm text-gray-500 italic">Convertie</span>
                )}
                {facture.statut === 'Definitive' && (
                    <button
                        onClick={() => handleArchive(facture)}
                        disabled={archivingId === facture.id}
                        className="text-xl text-gray-500 hover:text-blue-600 disabled:opacity-50"
                        title="Archiver la facture en PDF"
                    >
                        {archivingId === facture.id ? '...' : '🗄️'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="p-8">
            <PageHeader title="Suivi des Factures de Vente" subtitle="Cliquez sur une facture pour voir le détail." />

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
                            <tr key={facture.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openFactureModal(facture)}>
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
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClasses(facture.statut)}`}>
                                        {facture.statut}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                    {renderActions(facture)}
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-xs">{facture.envoiId || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedFacture && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Aperçu : {selectedFacture.numeroFacture}</h3>
                            <div>
                                <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2">🖨️ Imprimer</button>
                                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Fermer</button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-grow">
                            <div id="invoice-preview-content">
                                <InvoicePage factureId={selectedFacture.id} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListeDesVentesPage;