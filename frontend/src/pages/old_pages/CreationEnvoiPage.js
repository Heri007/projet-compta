import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import LISTE_ARTICLES from '../data/articlesList';

const CreationEnvoiPage = ({ tiers, setPage, handleAddEnvoi }) => {
    const clients = useMemo(() => tiers.filter(t => t.type === 'Client'), [tiers]);

    const [clientCode, setClientCode] = useState('');
    const [articleDesignation, setArticleDesignation] = useState('');
    const [quantite, setQuantite] = useState(1);
    const [envoiId, setEnvoiId] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Liste stable pour l'autocomplétion ---
    const allArticles = useMemo(() => LISTE_ARTICLES, []);

    // --- Génération automatique de l'ID (unique et lisible) ---
    useEffect(() => {
        if (!clientCode || !articleDesignation || !quantite) {
            setEnvoiId('');
            return;
        }
        const article = allArticles.find(a => a.designation === articleDesignation);
        if (!article) {
            setEnvoiId('');
            return;
        }
        const now = new Date();
        const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const rand = Math.floor(1000 + Math.random() * 9000); // pour éviter doublons
        setEnvoiId(`${prefix}-${clientCode}_${quantite}CT_${article.code}_${rand}`);
    }, [clientCode, articleDesignation, quantite, allArticles]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!envoiId) {
            alert("Impossible de créer l’envoi : informations incomplètes.");
            return;
        }

        const clientSelectionne = clients.find(c => c.code === clientCode);
        const article = allArticles.find(a => a.designation === articleDesignation);

        const envoiData = {
            id: envoiId,
            nom: `Envoi pour ${clientSelectionne?.nom} - ${articleDesignation}`,
            client_code: clientCode,
            statut: "actif",
            total_produits: 0,
            total_charges: 0,
            designation: articleDesignation, // <-- IMPORTANT
            quantite: Number(quantite),      // <-- IMPORTANT
            article_code: article.code       // <-- IMPORTANT
        };

        try {
            setLoading(true);
            await handleAddEnvoi(envoiData);
            // Reset du formulaire
            setClientCode('');
            setArticleDesignation('');
            setQuantite(1);
            setEnvoiId('');
            setPage('envoi');
        } catch (err) {
            alert(err.message || "Erreur lors de la création de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <PageHeader
                title="Créer un Nouvel Envoi"
                subtitle="Associez un client et un article à un nouvel envoi."
            />
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                <WidgetCard title="Détails de l'envoi">
                    <div className="space-y-4">
                        {/* Client */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Client *</label>
                            <select
                                value={clientCode}
                                onChange={e => setClientCode(e.target.value)}
                                className="mt-1 w-full p-2 border rounded"
                                required
                            >
                                <option value="">Sélectionner un client...</option>
                                {clients.map(c => (
                                    <option key={c.code} value={c.code}>
                                        {c.nom} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Article */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Article Principal *</label>
                            <input
                                type="text"
                                list="articles-list"
                                value={articleDesignation}
                                onChange={e => setArticleDesignation(e.target.value)}
                                className="mt-1 w-full p-2 border rounded"
                                required
                            />
                            <datalist id="articles-list">
                                {allArticles.map(a => (
                                    <option key={a.code} value={a.designation} />
                                ))}
                            </datalist>
                        </div>

                        {/* Quantité */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantité (en containers) *</label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    value={quantite}
                                    onChange={e => setQuantite(Number(e.target.value))}
                                    className="mt-1 w-full p-2 border rounded-l-md"
                                    required
                                    min="1"
                                />
                                <span className="mt-1 p-2 border-t border-b border-r rounded-r-md bg-gray-100">CT</span>
                            </div>
                        </div>

                        <hr />

                        {/* ID généré */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID de l'Envoi (auto-généré)</label>
                            <input
                                type="text"
                                value={envoiId}
                                className="mt-1 w-full p-2 border rounded bg-gray-100 font-mono"
                                readOnly
                            />
                        </div>

                        {/* Boutons */}
                        <div className="text-right pt-4">
                            <button
                                type="button"
                                onClick={() => setPage('envoi')}
                                className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !envoiId}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md disabled:opacity-50"
                            >
                                {loading ? "Création..." : "Créer l'Envoi"}
                            </button>
                        </div>
                    </div>
                </WidgetCard>
            </form>
        </div>
    );
};

export default CreationEnvoiPage;
