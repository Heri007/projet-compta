// Fichier : frontend/src/components/FormulaireImmobilisation.js

import React, { useState, useMemo } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FormInputGroup = ({ label, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

export const FormulaireImmobilisation = ({ onClose, refreshData, planComptable }) => {
    const [formData, setFormData] = useState({
        libelle: '',
        date_acquisition: new Date().toISOString().split('T')[0],
        valeur_origine: '',
        duree_amortissement: 5,
        compte_immobilisation: '',
        compte_amortissement: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // On filtre le plan comptable pour ne montrer que les comptes pertinents
    const comptesImmo = useMemo(() => {
        if (!planComptable) return [];
        return planComptable.filter(c => c.numero_compte.startsWith('20') || c.numero_compte.startsWith('21'));
    }, [planComptable]);

    const comptesAmort = useMemo(() => {
        if (!planComptable) return [];
        return planComptable.filter(c => c.numero_compte.startsWith('28'));
    }, [planComptable]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/immobilisations`, formData);
            await refreshData(); // Pour mettre à jour la liste principale
            onClose(); // Pour fermer la modale
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
            
            <FormInputGroup label="Libellé de l'immobilisation *">
                <input type="text" name="libelle" value={formData.libelle} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" placeholder="Ex: Ordinateur Dell, Véhicule 4x4..." />
            </FormInputGroup>

            <div className="grid grid-cols-2 gap-4">
                <FormInputGroup label="Date d'acquisition *">
                    <input type="date" name="date_acquisition" value={formData.date_acquisition} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                </FormInputGroup>
                <FormInputGroup label="Valeur d'origine (HT) *">
                    <input type="number" step="any" name="valeur_origine" value={formData.valeur_origine} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                </FormInputGroup>
            </div>

            <FormInputGroup label="Durée d'amortissement (années) *">
                <select name="duree_amortissement" value={formData.duree_amortissement} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                    <option value={3}>3 ans (Informatique)</option>
                    <option value={4}>4 ans (Véhicules légers)</option>
                    <option value={5}>5 ans (Matériel, Mobilier)</option>
                    <option value={7}>7 ans (Outillage)</option>
                    <option value={10}>10 ans (Agencements)</option>
                    <option value={20}>20 ans (Constructions)</option>
                </select>
            </FormInputGroup>

            <div className="grid grid-cols-2 gap-4">
                <FormInputGroup label="Compte d'immobilisation *">
                    <select name="compte_immobilisation" value={formData.compte_immobilisation} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                        <option value="">-- Sélectionner --</option>
                        {comptesImmo.map(c => <option key={c.numero_compte} value={c.numero_compte}>{c.numero_compte} - {c.libelle}</option>)}
                    </select>
                </FormInputGroup>
                <FormInputGroup label="Compte d'amortissement *">
                    <select name="compte_amortissement" value={formData.compte_amortissement} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                        <option value="">-- Sélectionner --</option>
                        {comptesAmort.map(c => <option key={c.numero_compte} value={c.numero_compte}>{c.numero_compte} - {c.libelle}</option>)}
                    </select>
                </FormInputGroup>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-green-500 rounded-lg">{loading ? '...' : 'Enregistrer'}</button>
            </div>
        </form>
    );
};