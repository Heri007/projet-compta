import React, { useState, useMemo } from 'react'; // Assurez-vous que useMemo est importé
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- COMPOSANT FORMULAIRE RÉUTILISABLE (inchangé) ---
const FormInputGroup = ({ label, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

// =================================================================================
// FORMULAIRE COMPTE (NETTOYÉ ET CORRECT)
// =================================================================================
// Ce formulaire sert à créer un NOUVEAU compte dans le plan comptable.
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

            {/* Le menu déroulant des comptes tiers a été logiquement retiré d'ici */}

            <FormInputGroup label="Numéro de Compte *">
                <input
                    type="text"
                    name="numero_compte"
                    value={formData.numero_compte}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border rounded-lg"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Libellé *">
                <input
                    type="text"
                    name="libelle"
                    value={formData.libelle}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border rounded-lg"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Classe">
                <select
                    name="classe"
                    value={formData.classe}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border rounded-lg"
                >
                    {[1, 2, 3, 4, 5, 6, 7].map(c => <option key={c} value={c}>Classe {c}</option>)}
                </select>
            </FormInputGroup>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-green-500 rounded-lg">{loading ? '...' : 'Enregistrer'}</button>
            </div>
        </form>
    );
};

// =================================================================================
// FORMULAIRE TIERS (CORRIGÉ AVEC LA LISTE DYNAMIQUE)
// =================================================================================
// Ce formulaire sert à créer un Client ou un Fournisseur.
export const FormulaireTiers = ({ onClose, refreshData, planComptable }) => {
    const [nom, setNom] = useState('');
    const [type, setType] = useState('Client');
    const [compteGeneral, setCompteGeneral] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // La logique de filtrage est ici, au bon endroit.
    const comptesTiersDisponibles = useMemo(() => {
        if (!planComptable) return [];
        return planComptable.filter(c => c.numero_compte.startsWith('41') || c.numero_compte.startsWith('40'));
    }, [planComptable]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { nom, type, compte_general: compteGeneral || null };
        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/tiers`, payload);
            await refreshData();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de sauvegarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

            <FormInputGroup label="Code Tiers">
                <input type="text" value="Généré automatiquement" readOnly className="mt-1 w-full p-3 border rounded-lg bg-gray-100"/>
            </FormInputGroup>

            <FormInputGroup label="Nom / Raison Sociale *">
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="mt-1 block w-full p-3 border rounded-lg" required />
            </FormInputGroup>

            <FormInputGroup label="Type">
                <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full p-3 border rounded-lg">
                    <option value="Client">Client</option>
                    <option value="Fournisseur">Fournisseur</option>
                </select>
            </FormInputGroup>

            <FormInputGroup label="Compte Général Associé">
                <select value={compteGeneral} onChange={e => setCompteGeneral(e.target.value)} className="mt-1 block w-full p-3 border rounded-lg">
                    <option value="">-- Aucun --</option>
                    {comptesTiersDisponibles.map(compte => (
                        <option key={compte.numero_compte} value={compte.numero_compte}>
                            {compte.numero_compte} - {compte.libelle}
                        </option>
                    ))}
                </select>
            </FormInputGroup>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-green-500 rounded-lg">{loading ? '...' : 'Enregistrer'}</button>
            </div>
        </form>
    );
};