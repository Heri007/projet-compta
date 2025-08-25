// components/PageHeader.js

import React from 'react';

const PageHeader = ({ title, subtitle, className }) => { // Accepte `className` en prop
    return (
        <div className={`mb-4 pb-2 border-b ${className || ''}`}> {/* Applique la prop className */}
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-black-500">{subtitle}</p>
        </div>
    );
};

export default PageHeader;