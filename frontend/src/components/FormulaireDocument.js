// Fichier : frontend/src/components/FormulaireDocument.js

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Liste des types de documents basés sur votre procédure
const TYPES_DOCUMENTS = [
    "LP1", "Facture Proforma (Client)", "Facture Proforma (Révisée Mines)", 
    "Fiche de Contrôle", "Facture Définitive", "Attestation de Domiciliation",
    "Fiche de Conformité", "LP3E", "Décompte des Taxes", "Quittance Trésor",
    "Fiche de Visite", "Certificat de Conformité", "Visa Poste Minier", "Déclaration Douanière",
    "Autre"
];

export const FormulaireDocument = ({ onClose, refreshData, envois = [], factures = [] }) => {
    const [nomDocument, setNomDocument] = useState('');
    const [typeDocument, setTypeDocument] = useState(TYPES_DOCUMENTS[0]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [envoiId, setEnvoiId] = useState('');
    // ... autres liens optionnels
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("Veuillez sélectionner un fichier.");
            return;
        }
        setError('');
        
        // On utilise FormData pour envoyer un fichier
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('nom_document', nomDocument || selectedFile.name);
        formData.append('type_document', typeDocument);
        if (envoiId) formData.append('envoi_id', envoiId);

        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/documents/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await refreshData();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors du téléversement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div><label>Fichier *</label><input type="file" onChange={handleFileChange} required className="mt-1 w-full p-2 border rounded-md"/></div>
            <div><label>Nom du document</label><input type="text" value={nomDocument} onChange={e => setNomDocument(e.target.value)} placeholder="Ex: Domiciliation Envoi X" className="mt-1 w-full p-2 border rounded-md"/></div>
            <div><label>Type de document *</label><select value={typeDocument} onChange={e => setTypeDocument(e.target.value)} required className="mt-1 w-full p-2 border rounded-md">{TYPES_DOCUMENTS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label>Lier à un envoi (optionnel)</label><select value={envoiId} onChange={e => setEnvoiId(e.target.value)} className="mt-1 w-full p-2 border rounded-md"><option value="">-- Aucun --</option>{envois.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>
            
            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-blue-600 rounded-lg">{loading ? '...' : 'Téléverser'}</button>
            </div>
        </form>
    );
};