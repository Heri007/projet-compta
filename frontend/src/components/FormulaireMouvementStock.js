// Fichier : frontend/src/components/FormulaireMouvementStock.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FormInputGroup = ({ label, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

// Le formulaire reçoit maintenant la prop "factures"
const FormulaireMouvementStock = ({ onClose, refreshData, articles = [], factures = [] }) => {
    const [type, setType] = useState('Sortie');
    const [articleCode, setArticleCode] = useState('');
    const [quantite, setQuantite] = useState('');
    const [documentRef, setDocumentRef] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- NOUVELLE LOGIQUE : Mise à jour automatique basée sur la facture ---
    useEffect(() => {
        // Si le document de référence est une facture
        if (documentRef.startsWith('FP-') || documentRef.startsWith('FD-')) {
            const factureSelectionnee = factures.find(f => f.numero_facture === documentRef);
            
            if (factureSelectionnee && factureSelectionnee.lignes && factureSelectionnee.lignes.length > 0) {
                // On prend la première ligne de la facture pour l'exemple
                const premiereLigne = factureSelectionnee.lignes[0];
                
                if (premiereLigne.article_code) {
                    // On met à jour l'article automatiquement
                    setArticleCode(premiereLigne.article_code);
                }
                // Optionnel : vous pourriez aussi pré-remplir la quantité
                // setQuantite(premiereLigne.quantite);
            }
        }
    }, [documentRef, factures]); // Se déclenche quand la référence change


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            const payload = { type, article_code: articleCode, quantite, document_ref: documentRef };
            await axios.post(`${API_URL}/api/mouvements`, payload);
            await refreshData();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
            
            <FormInputGroup label="Type de Mouvement *">
                <select value={type} onChange={e => setType(e.target.value)} required className="mt-1 w-full p-2 border rounded-md">
                    <option value="Sortie">Sortie (Vente)</option>
                    <option value="Entrée">Entrée (Achat/Retour)</option>
                </select>
            </FormInputGroup>

            {/* --- CORRECTION : Menu déroulant pour le Document de Référence --- */}
            <FormInputGroup label="Document de référence (Facture)">
                <select
                    value={documentRef}
                    onChange={e => setDocumentRef(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">-- Sélectionner une facture (optionnel) --</option>
                    {factures.map(facture => (
                        <option key={facture.id} value={facture.numero_facture}>
                            {facture.numero_facture} - {facture.client_nom}
                        </option>
                    ))}
                </select>
            </FormInputGroup>

            <FormInputGroup label="Article *">
                <select
                    value={articleCode}
                    onChange={e => setArticleCode(e.target.value)}
                    // Le champ est désactivé si une facture a été sélectionnée et a défini l'article
                    disabled={documentRef && articleCode}
                    required
                    className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100"
                >
                    <option value="">-- Sélectionner un article --</option>
                    {articles.map(article => (
                        <option key={article.code} value={article.code}>{article.designation}</option>
                    ))}
                </select>
            </FormInputGroup>

            <FormInputGroup label="Quantité *">
                <input type="number" step="any" value={quantite} onChange={e => setQuantite(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
            </FormInputGroup>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-purple-500 rounded-lg">{loading ? '...' : 'Enregistrer'}</button>
            </div>
        </form>
    );
};

export default FormulaireMouvementStock;