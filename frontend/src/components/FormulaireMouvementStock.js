import React, { useState } from 'react';
// 'axios' et 'API_URL' ont été retirés car non utilisés pour l'instant

const FormulaireMouvementStock = ({ onClose, refreshData, articles }) => {
    const [formData, setFormData] = useState({ type: 'Entrée', articleCode: articles[0]?.code || '', quantite: '', documentRef: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Nouveau mouvement à envoyer au backend :", formData);
        // Quand vous connecterez le backend, vous décommenterez la ligne ci-dessous
        // await axios.post(`${API_URL}/api/mouvements`, formData);
        // await refreshData();
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Type de Mouvement</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full p-2 border rounded-md">
                    <option>Entrée</option>
                    <option>Sortie</option>
                </select>
            </div>
            <div>
                <label>Article</label>
                <select value={formData.articleCode} onChange={e => setFormData({...formData, articleCode: e.target.value})} className="mt-1 block w-full p-2 border rounded-md">
                    {articles.map(a => <option key={a.code} value={a.code}>{a.code} - {a.designation}</option>)}
                </select>
            </div>
            <div>
                <label>Quantité</label>
                <input type="number" step="0.01" value={formData.quantite} onChange={e => setFormData({...formData, quantite: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" required />
            </div>
            <div>
                <label>Document de référence</label>
                <input type="text" value={formData.documentRef} onChange={e => setFormData({...formData, documentRef: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" placeholder="N° Facture Achat, N° Projet..." required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                <button type="submit" className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-green-500 to-green-600 rounded-md">Enregistrer</button>
            </div>
        </form>
    );
};

export default FormulaireMouvementStock;