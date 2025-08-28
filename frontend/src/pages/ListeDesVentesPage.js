import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import PrintPreviewModal from '../components/PrintPreviewModal';
import InvoicePage from './InvoicePage';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const STATUTS = ['Tous', 'Proforma', 'Definitive'];

// --- Fonctions utilitaires ---
const getStatusClasses = (statut) => {
    switch (statut) {
        case 'Proforma': return 'bg-yellow-200 text-yellow-800';
        case 'Definitive': return 'bg-green-200 text-green-800';
        default: return 'bg-gray-200 text-gray-600';
    }
};
const formatCurrency = (value) => `$ ${parseFloat(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`;
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) { return ''; }
};

// --- COMPOSANT DÉDIÉ AU CHARGEMENT DU HTML POUR L'APERÇU ---
const InvoiceHtmlRenderer = ({ factureId }) => {
    const [html, setHtml] = useState('<p style="text-align: center; padding: 20px;">Chargement de l\'aperçu...</p>');
    useEffect(() => {
        if (!factureId) return;
        const fetchHtml = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/factures/${factureId}/render`);
                setHtml(response.data);
            } catch (err) {
                console.error("Erreur chargement aperçu HTML:", err);
                setHtml('<p style="text-align: center; padding: 20px; color: red;">Erreur lors du chargement de l\'aperçu.</p>');
            }
        };
        fetchHtml();
    }, [factureId]);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


const ListeDesVentesPage = ({ setPage, handleConvertToDefinitive, factures: facturesBrutes, refreshData }) => {
    const [filtreStatut, setFiltreStatut] = useState('Tous');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // État dédié pour la modale d'impression
    const [archivingId, setArchivingId] = useState(null);

    const facturesTransformees = useMemo(() => {
        if (!Array.isArray(facturesBrutes)) return [];
        const normalizeStatut = (s) => {
            if (!s || typeof s !== 'string') return 'Inconnu';
            const trimmed = s.trim().toLowerCase();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        };
        return facturesBrutes.map(f => ({
            ...f,
            numeroFacture: f.numero_facture,
            clientNom: f.client_nom || 'Client non trouvé',
            statut: normalizeStatut(f.type_facture),
        }));
    }, [facturesBrutes]);

    const facturesAffichees = useMemo(() => {
        if (filtreStatut === 'Tous') return facturesTransformees.filter(f => f.statut !== 'Convertie');
        return facturesTransformees.filter(f => f.statut === filtreStatut && f.statut !== 'Convertie');
    }, [facturesTransformees, filtreStatut]);

    const handleOpenView = (facture) => {
        setSelectedFacture(facture);
        setIsViewModalOpen(true);
    };

    const handleOpenPrint = (facture) => {
        setSelectedFacture(facture);
        setIsPrintModalOpen(true);
    };

    const handleArchive = async (facture) => {
        if (!facture || !facture.id) return;
        setArchivingId(facture.id);
        try {
            // CORRECTION : On appelle la route SPÉCIFIQUE à l'archivage de facture.
            // On n'a pas besoin de générer le HTML, le backend s'en occupe.
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

    return (
        <div className="p-8">
            <PageHeader title="Suivi des Factures de Vente" subtitle="Cliquez sur une ligne pour l'aperçu, ou utilisez les boutons d'action." />
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
                    {STATUTS.map(statut => (
                        <button key={statut} onClick={() => setFiltreStatut(statut)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filtreStatut === statut ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-white/50'}`}>{statut}</button>
                    ))}
                </div>
                <button onClick={() => setPage('creation_facture')} className="px-5 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transform transition">➕ Nouvelle Facture Proforma</button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['N° Facture', 'Client', 'Date', 'Montant', 'Statut', 'Actions'].map(h => (
                                <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facturesAffichees.map(facture => (
                            <tr key={facture.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenView(facture)}>
                                <td className="px-4 py-3 font-semibold">{facture.numeroFacture}</td>
                                <td className="px-4 py-3"><span className="font-semibold">{facture.clientNom}</span></td>
                                <td className="px-4 py-3">{formatDate(facture.date_facture)}</td>
                                <td className="px-4 py-3 text-right font-mono">{formatCurrency(facture.montant)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClasses(facture.statut)}`}>{facture.statut}</span>
                                </td>
                                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-4">
                                        {facture.statut === 'Proforma' && !facture.est_convertie && (
                                            <button onClick={() => handleConvertToDefinitive(facture)} className="text-sm text-green-600 hover:underline" title="Convertir">Convertir</button>
                                        )}
                                        {facture.statut === 'Proforma' && facture.est_convertie && (
                                            <span className="text-sm text-gray-500 italic">Convertie</span>
                                        )}
                                        {facture.statut === 'Definitive' && (
                                            <button onClick={() => handleArchive(facture)} disabled={archivingId === facture.id} className="text-xl text-gray-500 hover:text-blue-600 disabled:opacity-50" title="Archiver">
                                                {archivingId === facture.id ? '...' : '🗄️'}
                                            </button>
                                        )}
                                        <button onClick={() => handleOpenPrint(facture)} className="text-xl text-gray-500 hover:text-blue-600" title="Imprimer">🖨️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modale d'aperçu rapide (stylée avec Tailwind) */}
            {isViewModalOpen && selectedFacture && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                      <div className="flex justify-between items-center p-4 border-b">
                          <h3 className="text-lg font-semibold">Aperçu : {selectedFacture.numeroFacture}</h3>
                          <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Fermer</button>
                      </div>
                      <div className="overflow-y-auto flex-grow p-6">
                          <InvoicePage factureId={selectedFacture.id} />
                      </div>
                  </div>
              </div>
            )}
            
            {/* Modale d'impression (utilise le HTML du backend) */}
            <PrintPreviewModal 
                isOpen={isPrintModalOpen} 
                onClose={() => setIsPrintModalOpen(false)}
                title={`Aperçu avant impression : ${selectedFacture?.numeroFacture}`}
            >
                {selectedFacture && <InvoiceHtmlRenderer factureId={selectedFacture.id} />}
            </PrintPreviewModal>
        </div>
    );
};
export default ListeDesVentesPage;