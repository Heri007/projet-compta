import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import InvoicePage from './InvoicePage';

// La liste des onglets est déjà correcte.
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

// --- NOUVELLE FONCTION DE FORMATAGE DE DATE (PLUS SÉCURISÉE) ---
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return ''; // Retourne une chaîne vide en cas d'erreur
    }
};

const ListeDesVentesPage = ({ setPage, handleConvertToDefinitive, factures: facturesBrutes, refreshData }) => {
    const [filtreStatut, setFiltreStatut] = useState('Tous');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const facturesTransformees = useMemo(() => {
        if (!Array.isArray(facturesBrutes)) return [];

        // Pas besoin de modifier cette partie si la version précédente est utilisée
        const normalizeStatut = (s) => {
            if (!s || typeof s !== 'string') return 'inconnu';
            return s.trim().toLowerCase(); // <-- CHANGEMENT CRUCIAL : on stocke tout en minuscules.
        };

        return facturesBrutes.map(f => ({
            id: f.id,
            numeroFacture: f.numero_facture,
            clientNom: f.client_nom || 'Client non trouvé',
            clientCode: f.code_tiers,
            date: formatDate(f.date_facture),
            montant: parseFloat(f.montant) || 0,
            statut: normalizeStatut(f.type_facture), // Le statut sera "proforma", "Definitive", etc.
            envoiId: f.envoi_id || null,
            ...f
        }));
    }, [facturesBrutes]);

    const facturesAffichees = useMemo(() => {
        // On compare maintenant avec la version minuscule du filtreStatut
        const filtre = filtreStatut.toLowerCase();
        
        const facturesVisibles = facturesTransformees.filter(f => f.statut !== 'convertie');

        if (filtre === 'tous') return facturesVisibles;
        return facturesVisibles.filter(f => f.statut === filtre);
    }, [facturesTransformees, filtreStatut]);


    const openFactureModal = (facture) => {
        console.log("Objet facture cliqué pour la modale :", facture); // LOG
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
        const printWindow = window.open('', '', 'width=900,height=600');
        printWindow.document.write('<html><head><title>Facture</title></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    // Cette fonction devrait maintenant marcher car `facture.statut` sera correct.
    const renderActions = (facture) => {
        // La comparaison se fait aussi en minuscules
        if (facture.statut === 'proforma') {
            
            // Si la facture a la propriété 'est_convertie' et qu'elle est vraie
            if (facture.est_convertie) {
                return <span className="text-sm text-gray-500 italic">Déjà convertie</span>;
            }
    
            // Sinon, on affiche le bouton
            return (
                <button
                    onClick={() => handleConvertToDefinitive(facture)}
                    className="text-sm text-green-600 hover:underline"
                >
                    Convertir
                </button>
            );
        }
        return <span className="text-sm text-gray-400">-</span>;
    };
    console.log("Statuts des factures transformées :", facturesTransformees.map(f => f.statut));

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
          onClick={() => openFactureModal(facture)}
          // On capitalise juste pour l'affichage
          className={`px-2 py-1 rounded-full text-xs font-bold transition-colors ${getStatusClasses(facture.statut.charAt(0).toUpperCase() + facture.statut.slice(1))}`}
      >
          {facture.statut.charAt(0).toUpperCase() + facture.statut.slice(1)}
      </button>
    </td>
                              <td className="px-4 py-3 text-center">{renderActions(facture)}</td>
                              <td className="px-4 py-3 text-center font-mono text-xs">{facture.envoiId || '-'}</td>
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
                          <InvoicePage factureId={selectedFacture.id} />
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