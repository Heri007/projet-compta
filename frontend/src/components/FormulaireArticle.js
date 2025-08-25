import React, { useState } from 'react';
// 'axios' et 'API_URL' ont été retirés car non utilisés pour l'instant
import { LISTE_ARTICLES } from '../data/mockData';

const FormulaireArticle = ({ onClose, refreshData }) => {
    const [formData, setFormData] = useState({ code: '', designation: '', unite: 'Tonne', compteStock: '370000' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Nouvel article à envoyer au backend :", formData);
        // Quand vous connecterez le backend, vous décommenterez la ligne ci-dessous
        // await axios.post(`${API_URL}/api/articles`, formData);
        // await refreshData();
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Code Article</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" required />
            </div>
            <div>
                <label>Désignation</label>
                <input 
                    type="text"
                    list="articles-list"
                    value={formData.designation} 
                    onChange={e => setFormData({...formData, designation: e.target.value})} 
                    className="mt-1 block w-full p-2 border rounded-md" 
                    required 
                />
                <datalist id="articles-list">
                    {LISTE_ARTICLES.map(nom => <option key={nom} value={nom} />)}
                </datalist>
            </div>
            <div>
                <label>Unité de mesure</label>
                <select value={formData.unite} onChange={e => setFormData({...formData, unite: e.target.value})} className="mt-1 block w-full p-2 border rounded-md">
                    <option>Tonne</option>
                    <option>Kg</option>
                    <option>Pièce</option>
                </select>
            </div>
            <div>
                <label>Compte de stock associé</label>
                <input type="text" value={formData.compteStock} onChange={e => setFormData({...formData, compteStock: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" placeholder="Ex: 370000" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                <button type="submit" className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-green-500 to-green-600 rounded-md">Enregistrer</button>
            </div>
        </form>
    );
};

export default FormulaireArticle;