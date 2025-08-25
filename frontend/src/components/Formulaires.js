import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- COMPOSANT FORMULAIRE RÉUTILISABLE ---
const FormInputGroup = ({ label, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

// --- FORMULAIRE COMPTE (DESIGN AMÉLIORÉ) ---
export const FormulaireCompte = ({ onClose, refreshData }) => {
    const [formData, setFormData] = useState({ numero_compte: '', libelle: '', classe: '7' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/comptes`, formData);
            await refreshData();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

            <FormInputGroup label="Numéro de Compte *">
                <input
                    type="text"
                    name="numero_compte"
                    value={formData.numero_compte}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Libellé *">
                <input
                    type="text"
                    name="libelle"
                    value={formData.libelle}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Classe">
                <select
                    name="classe"
                    value={formData.classe}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {[1, 2, 3, 4, 5, 6, 7].map(c => <option key={c} value={c}>Classe {c}</option>)}
                </select>
            </FormInputGroup>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-white font-semibold bg-green-500 rounded-lg shadow-md hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
};


// =================================================================================
// FORMULAIRE TIERS (VERSION AUTOMATIQUE DU CODE)
// =================================================================================
export const FormulaireTiers = ({ onClose, refreshData, setPage }) => {
    const [nom, setNom] = useState('');
    const [type, setType] = useState('Client');
    const [compteGeneral, setCompteGeneral] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Le code sera généré côté backend
        const payload = { nom, type, compte_general: compteGeneral || null };

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/tiers`, payload);

            await refreshData();
            alert(`Le tiers "${response.data.nom}" a été créé avec succès !`);
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Une erreur est survenue lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

            <FormInputGroup label="Code Tiers">
                <input
                    type="text"
                    value="Généré automatiquement"
                    readOnly
                    className="mt-1 w-full p-3 border rounded-lg bg-gray-100 font-mono text-sm"
                />
            </FormInputGroup>

            <FormInputGroup label="Nom / Raison Sociale *">
                <input
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Type">
                <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="Client">Client</option>
                    <option value="Fournisseur">Fournisseur</option>
                </select>
            </FormInputGroup>

            <FormInputGroup label="Compte Général Associé">
                <select
                    value={compteGeneral}
                    onChange={e => setCompteGeneral(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">-- Aucun --</option>
                    <option value="4111">411 - Clients Malagasy</option>
                    <option value="4011">4011 - Fournisseurs de biens et services Malagasy</option>
                </select>
            </FormInputGroup>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-white font-semibold bg-green-500 rounded-lg shadow-md hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
};

