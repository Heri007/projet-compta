import React, { useState } from 'react';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';

const EnvoiPage = ({ envois = [], tiers = [], setPage }) => {
  const [selectedEnvoi, setSelectedEnvoi] = useState(null);

  const handleRowClick = (envoi) => {
    setSelectedEnvoi(envoi);
  };

  const handleCloseDetail = () => setSelectedEnvoi(null);

  const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

  return (
    <div className="p-8">
      <PageHeader title="Envois" subtitle="Liste des envois d'exportation" />

      <div className="mb-6 flex justify-end gap-4">
        <button
          onClick={() => setPage('creation_envoi')}
          className="px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transform transition"
        >
          ✈️ Nouvel Envoi
        </button>
      </div>

      <WidgetCard title="Liste des Envois" headerClassName={headerGradientClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['ID', 'Article', 'Client', 'Quantité', 'Statut'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {envois.map(e => {
                const client = tiers.find(t => t.code === e.client_code);
                return (
                  <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(e)}>
                    <td className="px-4 py-2 font-mono">{e.id}</td>
                    <td className="px-4 py-2">{e.designation}</td>
                    <td className="px-4 py-2 font-semibold text-blue-700">{client?.nom || e.client_code}</td>
                    <td className="px-4 py-2">{Math.round(Number(e.quantite))}</td>
                    <td className="px-4 py-2">{e.statut}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </WidgetCard>

      {/* Modale de détails */}
      <Modal
        isOpen={selectedEnvoi !== null}
        onClose={handleCloseDetail}
        title={`Détails de l'Envoi : ${selectedEnvoi?.designation || ''}`}
      >
        {selectedEnvoi && (
          <div className="space-y-4">
            <div>
              <p><strong>ID :</strong> {selectedEnvoi.id}</p>
              <p><strong>Article :</strong> {selectedEnvoi.designation}</p>
              <p><strong>Quantité :</strong> {Math.round(Number(selectedEnvoi.quantite))}</p>
              <p><strong>Statut :</strong> {selectedEnvoi.statut}</p>
            </div>

            <div>
              <h4 className="font-semibold mt-4 mb-2">Client Associé :</h4>
              {tiers.find(t => t.code === selectedEnvoi.client_code) ? (
                <div>
                  <p><strong>Nom / Raison Sociale :</strong> {tiers.find(t => t.code === selectedEnvoi.client_code).nom}</p>
                  <p><strong>Code :</strong> {tiers.find(t => t.code === selectedEnvoi.client_code).code}</p>
                  <p><strong>Type :</strong> {tiers.find(t => t.code === selectedEnvoi.client_code).type}</p>
                  <p><strong>Compte Général :</strong> {tiers.find(t => t.code === selectedEnvoi.client_code).compte_general}</p>
                </div>
              ) : <p>Client inconnu</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnvoiPage;
