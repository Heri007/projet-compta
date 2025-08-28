// Fichier : frontend/src/pages/EnvoiPage.js

import React from 'react';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import Modal from '../components/Modal';
import { FormulaireSaisieAchat } from '../components/FormulaireSaisieAchat';
// On utilise directement la page de suivi que nous avons créée,
// plus besoin de gérer l'état "liste" vs "détail" ici.

const EnvoiPage = ({ envois = [], tiers = [], setPage, refreshData }) => { 
    const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";
    const [envoiPourAchat, setEnvoiPourAchat] = useState(null);
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Suivi des Envois" subtitle="Liste de tous les projets d'exportation." />
                <button 
                    onClick={() => setPage('creation_envoi')} 
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                    ✈️ Ajouter un Envoi
                </button>
            </div>

            <WidgetCard title="Liste des Envois" headerClassName={headerGradientClass}>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-gray-600">Projet / Envoi</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Client Associé</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Article Principal</th>
                                <th className="p-3 text-center font-semibold text-gray-600">Quantité (CT)</th>
                                <th className="text-center">Statut Achat</th>
                                {/* --- NOUVELLE COLONNE --- */}
                                <th className="p-3 text-center font-semibold text-gray-600">Actions</th> 
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {(envois && envois.length > 0) ? (
                                envois.map(envoi => {
                                    const client = tiers.find(t => t.code === envoi.client_code);
                                    const isAchatSaisi = envoi.statut_achat === 'Comptabilisé';
                                    return (
                                        <tr key={envoi.id} className="hover:bg-blue-50">
                                            <td className="p-3">
                                                <div className="font-bold text-blue-700">{envoi.nom}</div>
                                                <div className="text-gray-500 font-mono text-xs mt-1">{envoi.id}</div>
                                            </td>
                                            <td className="p-3 text-gray-700">{client ? client.nom : <span className="text-red-500 italic">Client non trouvé</span>}</td>
                                            <td className="p-3">{envoi.designation || 'Non spécifié'}</td>
                                            <td className="p-3 text-center font-mono">{envoi.quantite || 'N/A'}</td>
                                            
                                            {/* --- NOUVELLE CELLULE AVEC LE BOUTON "SUIVRE" --- */}
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => setPage(`suivi_exportation/${envoi.id}`)}
                                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-md text-xs hover:bg-indigo-200"
                                                >
                                                    Suivre
                                                </button>
                                            </td>
                                            <td className="text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isAchatSaisi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {envoi.statut_achat}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        {!isAchatSaisi && (
                                            <button onClick={() => setEnvoiPourAchat(envoi)} className="text-blue-600 hover:underline text-xs">
                                                Saisir Achat (LP1)
                                            </button>
                                        )}
                                        <button onClick={() => setPage(`suivi_exportation/${envoi.id}`)} className="ml-4 text-indigo-600 hover:underline text-xs">
                                            Suivre Procédure
                                        </button>
                                    </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-gray-400">
                                        Aucun envoi trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </WidgetCard>
            <Modal isOpen={envoiPourAchat !== null} onClose={() => setEnvoiPourAchat(null)} title="Saisie des Informations d'Achat">
    {envoiPourAchat && <FormulaireSaisieAchat envoi={envoiPourAchat} onClose={() => setEnvoiPourAchat(null)} refreshData={refreshData} />}
</Modal>
        </div>
    );
};

export default EnvoiPage;