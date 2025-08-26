import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import Modal from '../components/Modal';
import { PROCEDURE_EXPORTATION } from '../data/procedure'; // Assurez-vous que ce fichier existe

// --- SOUS-COMPOSANT : VUE DÉTAILLÉE D'UN ENVOI ---
// (Cette partie est pour le suivi de la procédure)
const EnvoiDetailPage = ({ project, procedure, statuses, updateStatus, onBack }) => {
    const getStatusClasses = (status) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-800 border-green-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="p-8">
            <button onClick={onBack} className="mb-6 text-blue-600 hover:underline">
                &larr; Retour à la liste des envois
            </button>
            <PageHeader title={project.nom} subtitle="Suivi de la procédure d'exportation" />
            <div className="space-y-4">
                {procedure.map(step => {
                    const status = statuses[step.id] || 'pending';
                    return (
                        <div key={step.id} className={`p-4 rounded-lg border-l-4 transition-all ${getStatusClasses(status)}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{step.id}. {step.titre}</h3>
                                    <ul className="list-disc list-inside mt-2 text-sm">
                                        {step.taches.map((tache, index) => <li key={index}>{tache}</li>)}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {status === 'pending' ? (
                                        <button onClick={() => updateStatus(project.id, step.id, 'done')} className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">
                                            Terminé
                                        </button>
                                    ) : (
                                        <button onClick={() => updateStatus(project.id, step.id, 'pending')} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400">
                                            À faire
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANT : RÉSUMÉ DE L'ENVOI DANS LA MODALE ---
const EnvoiResume = ({ envoi, client, onDetailClick }) => (
    <div className="p-2 space-y-4 text-sm">
        <div>
            <h4 className="font-bold text-lg text-blue-600">{envoi.nom}</h4>
            <p className="text-gray-500 font-mono">{envoi.id}</p>
        </div>
        <hr />
        <div>
            <h5 className="font-semibold text-gray-800 mb-2">Client Associé</h5>
            <p><strong>Nom / Raison Sociale :</strong> {client?.nom || 'N/A'}</p>
            <p><strong>Code Client :</strong> {client?.code || 'N/A'}</p>
        </div>
        <hr />
        <div>
            <h5 className="font-semibold text-gray-800 mb-2">Données Financières (Estimées)</h5>
            <p><strong>Total Produits :</strong> {parseFloat(envoi.total_produits || 0).toLocaleString('fr-FR')} Ar</p>
            <p><strong>Total Charges :</strong> {parseFloat(envoi.total_charges || 0).toLocaleString('fr-FR')} Ar</p>
        </div>
        <div className="text-right pt-4">
            <button
                onClick={onDetailClick}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
            >
                Voir le Suivi Détaillé &rarr;
            </button>
        </div>
    </div>
);

// --- SOUS-COMPOSANT : LISTE PRINCIPALE DES ENVOIS ---
const EnvoiListPage = ({ envois = [], tiers = [], onSelectEnvoi, setPage }) => {
    const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {(envois && envois.length > 0) ? (
                                envois.map(p => {
                                    const client = tiers.find(t => t.code === p.client_code);
                                    return (
                                        <tr key={p.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => onSelectEnvoi(p)}>
                                            <td className="p-3">
                                                <div className="font-bold text-blue-700">{p.nom}</div>
                                                <div className="text-gray-500 font-mono text-xs mt-1">{p.id}</div>
                                            </td>
                                            <td className="p-3 text-gray-700">{client ? client.nom : <span className="text-red-500 italic">Client non trouvé</span>}</td>
                                            <td className="p-3">{p.designation || 'Non spécifié'}</td>
                                            <td className="p-3 text-center font-mono">{p.quantite || 'N/A'}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-gray-400">
                                        Aucun envoi trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </WidgetCard>
        </div>
    );
};

// --- PAGE PRINCIPALE : GÈRE L'ÉTAT ET LA LOGIQUE ---
const EnvoiPage = ({ envois, tiers, setPage }) => {
    const [vue, setVue] = useState('liste');
    const [envoiSelectionne, setEnvoiSelectionne] = useState(null);
    const [projectStatuses, setProjectStatuses] = useState({});

    const handleUpdateProjectStatus = (projectId, stepId, newStatus) => {
        setProjectStatuses(prev => ({
            ...prev,
            [projectId]: { ...prev[projectId], [stepId]: newStatus }
        }));
    };

    const handleSelectEnvoiForModal = (envoi) => setEnvoiSelectionne(envoi);
    const handleCloseModal = () => setEnvoiSelectionne(null);
    const handleGoToDetail = () => setVue('detail');
    const handleBackToList = () => {
        setEnvoiSelectionne(null);
        setVue('liste');
    };

    if (vue === 'detail' && envoiSelectionne) {
        return (
            <EnvoiDetailPage
                project={envoiSelectionne}
                procedure={PROCEDURE_EXPORTATION}
                statuses={projectStatuses[envoiSelectionne.id] || {}}
                updateStatus={handleUpdateProjectStatus}
                onBack={handleBackToList}
            />
        );
    }

    return (
        <>
            <EnvoiListPage
                envois={envois}
                tiers={tiers}
                onSelectEnvoi={handleSelectEnvoiForModal}
                setPage={setPage}
            />
            <Modal isOpen={envoiSelectionne !== null && vue === 'liste'} onClose={handleCloseModal} title="Résumé de l'Envoi">
                {envoiSelectionne && (
                    <EnvoiResume
                        envoi={envoiSelectionne}
                        client={tiers.find(t => t.code === envoiSelectionne.client_code)}
                        onDetailClick={handleGoToDetail}
                    />
                )}
            </Modal>
        </>
    );
};

export default EnvoiPage;