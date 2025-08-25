// src/pages/ClientsVentesPage.js

import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import IconCard from '../components/IconCard';


const ClientsVentesPage = ({ tiers, setPage, envois = [] }) => {
    const clients = useMemo(() => tiers.filter(t => t.type === 'Client'), [tiers]);
    const formatCurrency = (value) => `$ ${parseFloat(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`;
    const getEnvoisForClient = (clientCode) => {
        if (!envois || envois.length === 0) return [];
        return envois.filter(e => e.client_code?.toString().trim().toLowerCase() === clientCode.toString().trim().toLowerCase());
    };

    const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

    return (
        <div className="p-8">
            <PageHeader title="Clients & Ventes" subtitle="Gérez vos clients, devis, factures et encaissements." />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Colonne de gauche : Actions Principales --- */}
                <div className="flex flex-col gap-6">
                    <WidgetCard 
                        title="Point de Départ (Recommandé)" 
                        headerClassName={headerGradientClass}
                    >
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Commencez ici pour enregistrer un nouveau client et son premier envoi en une seule fois.
                            </p>
                            <IconCard 
                                icon="🚀" 
                                label="Nouveau Client & Envoi" 
                                onClick={() => setPage('creation_client_envoi')} 
                                isPrimary={true}
                            />
                        </div>
                    </WidgetCard>
                    
                    <WidgetCard 
                        title="Actions Spécifiques"
                        headerClassName={headerGradientClass}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <IconCard icon="👨‍💼" label="Gérer les Tiers" onClick={() => setPage('tiers')} />
                            <IconCard icon="✈️" label="Gérer les Envois" onClick={() => setPage('envoi')} />
                            <IconCard icon="🧾" label="Créer Facture" onClick={() => setPage('creation_facture')} />
                            <IconCard icon="📄" label="Suivi Factures" onClick={() => setPage('liste_ventes')} />
                        </div>
                    </WidgetCard>
                </div>
            {/* --- Colonne de droite : Informations rapides --- */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <WidgetCard 
                    title="Clients Actifs"
                    headerClassName={headerGradientClass}
                >
                    <div className="h-64 overflow-y-auto">
                        <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-gray-200 text-black">
    <tr>
        <th className="p-2 text-left font-semibold text-gray-600 text-center">Code Client</th>
        <th className="p-2 text-left font-semibold text-gray-600 text-center">Nom du client</th>
        <th className="p-2 text-left font-semibold text-gray-600">Envois Associés</th>
        <th className="p-2 text-right font-semibold text-gray-600">Solde</th>
    </tr>
</thead>
<tbody className="divide-y divide-gray-200">
    {clients.map(c => {
        const associatedEnvois = getEnvoisForClient(c.code);
        return (
            <tr key={c.code} className="border-t hover:bg-gray-50">
                <td className="p-2 font-mono text-sm text-gray-700">{c.code}</td> {/* Code client visible */}
                <td 
                    className="p-2 text-blue-600 font-semibold cursor-pointer flex flex-col items-start md:items-center" 
                    onClick={() => setPage('tiers')}
                >
                    <span className="text-sm">{c.nom}</span>
                </td>
                <td className="p-2 text-gray-500 font-mono text-xs">
                    {associatedEnvois.length > 0 ? (
                        associatedEnvois.map((envoi, index) => (
                            <React.Fragment key={envoi.id}>
                                <button
                                    onClick={() => setPage(`envoi/${envoi.id}`)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {envoi.id}
                                </button>
                                {index < associatedEnvois.length - 1 ? ', ' : ''}
                            </React.Fragment>
                        ))
                    ) : 'Aucun'}
                </td>
                <td className="p-2 font-mono text-right">{formatCurrency(c.solde)}</td>
            </tr>
        );
    })}
</tbody>

                            </table>
                        </div>
                        </WidgetCard>
                    <WidgetCard 
                        title="Rapports Rapides"
                        headerClassName={headerGradientClass}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📈</span>
                            <select className="flex-grow p-2 border rounded-md">
                                <option>Liste des clients</option>
                                <option>Historique des ventes</option>
                                <option>État des comptes fournisseurs</option>
                            </select>
                            <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">Générer</button>
                        </div>
                    </WidgetCard>
                </div>
            </div>
        </div>
    );
};

export default ClientsVentesPage;