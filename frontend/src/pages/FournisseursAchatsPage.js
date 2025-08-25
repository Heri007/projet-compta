import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import IconCard from '../components/IconCard';
import WorkflowStep from '../components/WorkflowStep';

const FournisseursAchatsPage = ({ tiers, setPage }) => {
    const fournisseurs = useMemo(() => tiers.filter(t => t.type === 'Fournisseur'), [tiers]);
    
    const formatCurrency = (value) => `Ar ${parseFloat(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`;

    const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

    return (
        <div className="p-8">
            <PageHeader title="Fournisseurs & Achats" subtitle="Gérez vos fournisseurs, bons de commande et factures." />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- Colonne de gauche : Actions et Flux de Travail (MISE À JOUR) --- */}
                <div className="flex flex-col gap-8">
                    
                    {/* Ce widget prend sa hauteur naturelle */}
                    <WidgetCard title="Actions Principales" headerClassName={headerGradientClass}>
                        <div className="grid grid-cols-2 gap-4">
                            <IconCard icon="👥" label="Gérer les Tiers" onClick={() => setPage('tiers')} />
                            <IconCard icon="📄" label="Saisir Facture Achat" onClick={() => setPage('saisie')} />
                        </div>
                    </WidgetCard>

                    {/* Ce widget s'étirera pour remplir l'espace restant */}
                    <div className="flex-grow">
                        <WidgetCard title="Flux de Travail des Achats" headerClassName={headerGradientClass}>
                            <div className="flex flex-col items-center justify-around h-full space-y-4 py-4">
                                <WorkflowStep icon="📋" title="Bons de commande" />
                                <WorkflowStep icon="🚚" title="Réception marchandises" />
                                <WorkflowStep icon="🧾" title="Factures d'achat" />
                                <WorkflowStep icon="💳" title="Paiements" isLastStep={true} />
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2 pb-2 italic">(Fonctionnalités à venir)</p>
                        </WidgetCard>
                    </div>
                </div>

                {/* --- Colonne de droite : Informations et Rapports (INCHANGÉE) --- */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    <WidgetCard title="Fournisseurs Actifs" headerClassName={headerGradientClass}>
                        <div className="h-64 overflow-y-auto">
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 bg-white">
                                    <tr>
                                        <th className="p-2 text-left font-semibold text-gray-600">Nom du Fournisseur</th>
                                        <th className="p-2 text-right font-semibold text-gray-600">Solde Dû</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {fournisseurs.length > 0 ? (
                                        fournisseurs.map(f => (
                                            <tr key={f.code} className="hover:bg-gray-50">
                                                <td 
                                                    className="p-2 text-blue-600 font-semibold cursor-pointer" 
                                                    onClick={() => setPage('tiers')}
                                                >
                                                    {f.nom}
                                                </td>
                                                <td className="p-2 font-mono text-right">{formatCurrency(f.solde)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center p-8 text-gray-400">
                                                Aucun fournisseur trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </WidgetCard>
                    
                    <WidgetCard title="Rapports Rapides" headerClassName={headerGradientClass}>
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📊</span>
                            <select className="flex-grow p-2 border rounded-md">
                                <option>Liste des fournisseurs</option>
                                <option>Historique des achats</option>
                                <option>État des comptes fournisseurs</option>
                            </select>
                            <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
                                Générer
                            </button>
                        </div>
                    </WidgetCard>
                </div>
            </div>
        </div>
    );
};

export default FournisseursAchatsPage;
