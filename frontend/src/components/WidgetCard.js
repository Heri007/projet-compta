// src/components/WidgetCard.js

import React from 'react';

// Le composant accepte maintenant une nouvelle prop : `headerClassName`
const WidgetCard = ({ title, children, headerClassName }) => {
    
    // On définit une classe par défaut pour le titre
    const defaultHeaderClass = "px-4 py-3 font-bold text-gray-800 bg-gray-50 border-b";
    
    // On combine la classe par défaut avec celle passée en prop (si elle existe)
    const finalHeaderClass = headerClassName ? headerClassName : defaultHeaderClass;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
            {title && (
                <div className={finalHeaderClass}>
                    <h3 className="text-base font-semibold">{title}</h3>
                </div>
            )}
            <div className="p-4 flex-grow">
                {children}
            </div>
        </div>
    );
};

export default WidgetCard;