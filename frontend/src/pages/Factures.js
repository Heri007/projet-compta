import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import InvoicePreview from '../components/Facture';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Factures = ({ setPage }) => {
  const [factures, setFactures] = useState([]);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFactures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/factures`);
      setFactures(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des factures :", err);
      setError('Impossible de récupérer les factures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFactures(); }, []);

  const openFactureModal = async (factureId) => {
    try {
      const response = await axios.get(`${API_URL}/api/factures/${factureId}`);
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

  if (loading) return <p className="p-8">Chargement des factures...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <PageHeader title="Suivi des Factures" subtitle="Cliquez sur le statut pour voir le détail" />
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border border-gray-300 p-2">N° Facture</th>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Client</th>
              <th className="border border-gray-300 p-2">Statut</th>
              <th className="border border-gray-300 p-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">Aucune facture disponible.</td>
              </tr>
            ) : (
              factures.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-mono">{f.numero_facture}</td>
                  <td className="border p-2">{new Date(f.date_facture).toLocaleDateString('fr-FR')}</td>
                  <td className="border p-2">{f.code_tiers}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => openFactureModal(f.id)}
                      className={`px-2 py-1 rounded ${
                        f.type_facture === 'Proforma'
                          ? 'bg-yellow-300 hover:bg-yellow-400'
                          : 'bg-green-300 hover:bg-green-400'
                      }`}
                    >
                      {f.type_facture}
                    </button>
                  </td>
                  <td className="border p-2 text-right">{(f.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal Popup --- */}
      {isModalOpen && selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 font-bold text-xl"
            >
              ×
            </button>
            <div id="invoice-preview-content" className="p-6">
              <InvoicePreview data={selectedFacture} />
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🖨️ Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Factures;
