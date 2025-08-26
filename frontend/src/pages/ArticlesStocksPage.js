import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import FormulaireArticle from '../components/FormulaireArticle';
import FormulaireMouvementStock from '../components/FormulaireMouvementStock';

// On ajoute "factures" à la liste des props reçues
const ArticlesStocksPage = ({ articles = [], mouvements = [], factures = [], refreshData }) => {
    const [activeTab, setActiveTab] = useState('liste');
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [isMouvementModalOpen, setIsMouvementModalOpen] = useState(false);

    const formatNumber = (num) => (num ? parseFloat(num).toLocaleString('fr-FR') : '');

    return (
        <div className="p-8">
            <PageHeader
                title="Articles & Stocks"
                subtitle="Gérez vos produits et suivez les mouvements de stock."
            />

            {/* Onglets et actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('liste')}
                        className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'liste' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Liste des Articles
                    </button>
                    <button
                        onClick={() => setActiveTab('mouvements')}
                        className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'mouvements' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Mouvements de Stock
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsArticleModalOpen(true)}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition"
                    >
                        ➕ Nouvel Article
                    </button>
                    <button
                        onClick={() => setIsMouvementModalOpen(true)}
                        className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition"
                    >
                        📈 Nouveau Mouvement
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {activeTab === 'liste' && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Code</th>
                                <th className="px-4 py-3 text-left font-semibold">Désignation</th>
                                <th className="px-4 py-3 text-left font-semibold">Unité</th>
                                <th className="px-4 py-3 text-center font-semibold">Qté en Stock</th>
                                <th className="px-4 py-3 text-left font-semibold">Compte Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {articles.map(a => (
                                <tr key={a.code} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-mono">{a.code}</td>
                                    <td className="px-4 py-2 font-semibold">{a.designation}</td>
                                    <td className="px-4 py-2">{a.unite || '-'}</td>
                                    <td className="px-4 py-2 font-bold text-center">{(a.quantite || 0).toLocaleString('fr-FR')}</td>
                                    <td className="px-4 py-2">{a.compte_stock || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'mouvements' && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                                <th className="px-4 py-3 text-left font-semibold">Article</th>
                                <th className="px-4 py-3 text-left font-semibold">Réf. Document</th>
                                <th className="px-4 py-3 text-right font-semibold">Entrée</th>
                                <th className="px-4 py-3 text-right font-semibold">Sortie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mouvements.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-2 font-semibold">{m.designation}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{m.document_ref || '-'}</td>
                                    <td className="px-4 py-2 text-right font-mono text-green-600">
                                        {m.type === 'Entrée' ? formatNumber(m.quantite) : ''}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-red-600">
                                        {m.type === 'Sortie' ? formatNumber(m.quantite) : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modales */}
            <Modal isOpen={isArticleModalOpen} onClose={() => setIsArticleModalOpen(false)} title="Créer un Nouvel Article">
                <FormulaireArticle onClose={() => setIsArticleModalOpen(false)} refreshData={refreshData} />
            </Modal>
            <Modal isOpen={isMouvementModalOpen} onClose={() => setIsMouvementModalOpen(false)} title="Enregistrer un Mouvement de Stock">
                {/* --- CORRECTION : On passe la liste des factures au formulaire --- */}
                <FormulaireMouvementStock 
                    onClose={() => setIsMouvementModalOpen(false)} 
                    refreshData={refreshData} 
                    articles={articles}
                    factures={factures} // <-- AJOUT DE CETTE PROP
                />
            </Modal>
        </div>
    );
};

export default ArticlesStocksPage;