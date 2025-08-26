import React, { useState } from 'react';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import { FormulaireTiers } from '../components/Formulaires';

const Tiers = ({ tiers = [], envois = [], refreshData, setPage, planComptable }) => { 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTiers, setSelectedTiers] = useState(null);

    const getEnvoisForClient = (clientCode) => {
        if (!clientCode || !envois || envois.length === 0) return [];
        return envois.filter(e => String(e.client_code).trim() === String(clientCode).trim());
    };

    const handleRowClick = (t) => {
        const associatedEnvois = getEnvoisForClient(t.code);
        setSelectedTiers({ ...t, envois: associatedEnvois });
    };

    const handleCloseDetail = () => setSelectedTiers(null);

    const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

    return (
        <div className="p-8">
            <PageHeader title="Gestion des Tiers" subtitle="Consultez et gérez vos clients et fournisseurs." />

            <div className="mb-6 flex justify-end gap-4">
                 <button
                    onClick={() => setPage('creation_client_envoi')}
                    className="px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transform transition"
                >
                    🚀 Nouveau Client & Envoi
                </button>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 transform transition"
                >
                    👤 Créer un Tiers Seul
                </button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un Nouveau Tiers (sans envoi)">
                {/* --- CORRECTION ICI --- */}
                {/* On s'assure de passer la prop `setPage` au formulaire */}
                <FormulaireTiers 
                    onClose={() => setIsModalOpen(false)} 
                    refreshData={refreshData} 
                    setPage={setPage} 
                    planComptable={planComptable} 
                />
            </Modal>

            <WidgetCard title="Liste des Tiers" headerClassName={headerGradientClass}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {['Code', 'Nom', 'Type', 'Compte Général', 'Envois Associés'].map(h =>
                                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {(tiers || []).map(t => {
                                const associatedEnvois = getEnvoisForClient(t.code);
                                const envoiIds = associatedEnvois.map(e => e.id).join(', ');

                                return (
                                    <tr key={t.code} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(t)}>
                                        <td className="px-4 py-2 font-mono">{t.code}</td>
                                        <td className="px-4 py-2 font-semibold text-blue-700">{t.nom}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    t.type === 'Client' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}
                                            >
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{t.compte_general}</td>
                                        <td className="px-4 py-2 font-mono text-xs">{envoiIds || 'Aucun'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </WidgetCard>

            {/* Modale de détails */}
<Modal
    isOpen={selectedTiers !== null}
    onClose={handleCloseDetail}
    title={`Détails du Tiers : ${selectedTiers?.nom || ''}`}
>
    {selectedTiers && (
        <div className="space-y-4">
            <div>
                <p><strong>Code :</strong> {selectedTiers.code}</p>
                <p><strong>Nom :</strong> {selectedTiers.nom}</p>
                <p><strong>Type :</strong> {selectedTiers.type}</p>
                <p><strong>Compte Général :</strong> {selectedTiers.compte_general}</p>
            </div>

            <div>
                <h4 className="font-semibold mt-4 mb-2">Envois Associés :</h4>
                {selectedTiers.envois && selectedTiers.envois.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">ID</th>
                                <th className="px-3 py-2 text-left">Article</th>
                                <th className="px-3 py-2 text-left">Quantité</th>
                                <th className="px-3 py-2 text-left">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedTiers.envois.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-1 font-mono">{e.id}</td>
                                    <td className="px-3 py-1">{e.designation}</td>
                                    <td className="px-3 py-1">{Math.round(Number(e.quantite))}</td>
                                    <td className="px-3 py-1">{e.statut}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Aucun envoi associé.</p>
                )}
            </div>
        </div>
    )}
</Modal>

        </div>
    );
};

export default Tiers;