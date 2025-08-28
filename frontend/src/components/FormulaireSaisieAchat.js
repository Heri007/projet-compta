import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const FormulaireSaisieAchat = ({ envoi, onClose, refreshData }) => {
    const [formData, setFormData] = useState({
        cout_achat_total: '',
        fournisseur_lp1: '',
        date_achat: new Date().toISOString().split('T')[0],
        quantite_achetee: envoi.quantite || ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        try {
            // --- Étape 1 : Enregistrement de l'achat ---
            await axios.post(`${API_URL}/api/envois/${envoi.id}/enregistrer-achat`, formData);
    
            // Si on arrive ici, l'enregistrement a réussi. C'est une certitude.
            alert("Achat pour l'envoi enregistré avec succès !");
    
            // --- Étape 2 : Tentative de rafraîchissement des données ---
            try {
                await refreshData();
                onClose(); // On ne ferme la modale que si le refresh réussit
            } catch (refreshError) {
                // L'enregistrement a fonctionné, mais pas le rafraîchissement
                console.error("ERREUR lors du rafraîchissement des données après l'achat :", refreshError);
                setError("L'enregistrement a réussi, mais le rafraîchissement automatique a échoué. Veuillez recharger la page manuellement.");
                // On ne ferme pas la modale pour que l'utilisateur voie le message.
            }
    
        } catch (postError) {
            // Cette erreur ne concerne QUE l'échec de l'enregistrement initial
            console.error("ERREUR lors de l'enregistrement de l'achat :", postError);
            setError(postError.response?.data?.details || postError.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <p className="text-sm">Enregistrement des informations d'achat (LP1) pour l'envoi <strong>{envoi.nom}</strong>.</p>
            
            <div><label>Date d'achat *</label><input type="date" name="date_achat" value={formData.date_achat} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
            <div><label>Fournisseur (selon LP1)</label><input type="text" name="fournisseur_lp1" value={formData.fournisseur_lp1} onChange={handleChange} placeholder="Nom du fournisseur" className="mt-1 w-full p-2 border rounded-md" /></div>
            <div><label>Quantité Achetée (en Kg) *</label><input type="number" name="quantite_achetee" value={formData.quantite_achetee} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
            <div><label>Coût Total Achat (Net de ristournes) en Ariary *</label><input type="number" name="cout_achat_total" value={formData.cout_achat_total} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-blue-600 rounded-lg">{loading ? '...' : 'Enregistrer Achat'}</button>
            </div>
        </form>
    );
};