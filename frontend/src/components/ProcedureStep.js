// Fichier : frontend/src/components/ProcedureStep.js

import React from 'react';

// Ce composant affiche une seule étape de la procédure
const ProcedureStep = ({ numero, titre, entite, statut, actionLabel, onActionClick, isDisabled = false, children }) => {
    
    const getStatusClasses = () => {
        switch (statut) {
            case 'Fait': return 'bg-green-100 text-green-800 border-green-300';
            case 'En cours': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-500 border-gray-300';
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden flex">
            {/* Numéro de l'étape */}
            <div className={`w-16 flex items-center justify-center text-3xl font-bold text-white ${statut === 'Fait' ? 'bg-green-500' : 'bg-gray-400'}`}>
                {numero}
            </div>

            <div className="flex-grow p-4">
                {/* Titre et Entité */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{titre}</h3>
                        <p className="text-sm text-gray-500">Entité concernée : <span className="font-semibold">{entite}</span></p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClasses()}`}>
                        {statut}
                    </span>
                </div>

                {/* Contenu : liste des dossiers/paiements */}
                <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                    {children}
                </div>
                
                {/* Bouton d'action */}
                {actionLabel && (
                    <div className="text-right mt-3">
                        <button
                            onClick={onActionClick}
                            disabled={isDisabled}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {actionLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcedureStep;