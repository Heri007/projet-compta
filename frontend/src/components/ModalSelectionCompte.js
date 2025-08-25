// src/components/ModalSelectionCompte.js

import React, { useState, useMemo } from 'react';

// Le composant Modal générique que vous avez déjà dans App.js
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-1">{children}</div>
            </div>
        </div>
    );
};


export const ModalSelectionCompte = ({ isOpen, onClose, planComptable, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('numero'); // 'numero' ou 'nom'

    const filteredComptes = useMemo(() => {
        if (!searchTerm) return planComptable;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return planComptable.filter(compte => {
            if (searchBy === 'numero') {
                return compte.numero_compte.startsWith(searchTerm);
            } else { // search by 'nom'
                return compte.libelle.toLowerCase().includes(lowerSearchTerm);
            }
        });
    }, [searchTerm, searchBy, planComptable]);

    const handleSelectCompte = (compte) => {
        onSelect(compte);
        onClose(); // Ferme la modale après la sélection
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sélectionner un Compte">
            <div className="p-4">
                {/* Barre de recherche */}
                <div className="flex items-center gap-4 mb-4 p-2 bg-gray-50 rounded-md">
                    <input
                        type="text"
                        placeholder="Chercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <label className="flex items-center"><input type="radio" name="searchBy" value="numero" checked={searchBy === 'numero'} onChange={() => setSearchBy('numero')} className="mr-1"/> Numéro</label>
                        <label className="flex items-center"><input type="radio" name="searchBy" value="nom" checked={searchBy === 'nom'} onChange={() => setSearchBy('nom')} className="mr-1"/> Nom</label>
                    </div>
                </div>

                {/* Tableau des résultats */}
                <div className="h-96 overflow-y-auto border rounded-md">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-gray-100">
                            <tr>
                                <th className="p-2 text-left font-semibold text-gray-700 w-1/4">Numéro</th>
                                <th className="p-2 text-left font-semibold text-gray-700 w-2/4">Nom du compte</th>
                                <th className="p-2 text-left font-semibold text-gray-700 w-1/4">Classe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredComptes.map(compte => (
                                <tr key={compte.numero_compte} onClick={() => handleSelectCompte(compte)} className="hover:bg-blue-100 cursor-pointer">
                                    <td className="p-2">{compte.numero_compte}</td>
                                    <td className="p-2">{compte.libelle}</td>
                                    <td className="p-2">{compte.classe}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pied de la modale */}
            <div className="flex justify-end gap-3 p-4 border-t mt-2">
                 <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
                 {/* Le bouton "Sélectionner" est implicite en cliquant sur une ligne */}
            </div>
        </Modal>
    );
};