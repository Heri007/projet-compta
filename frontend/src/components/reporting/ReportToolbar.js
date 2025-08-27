// Fichier : frontend/src/components/reporting/ReportToolbar.js
import React from 'react';

const ReportToolbar = ({ onPrintClick, onArchiveClick, isArchiving = false }) => (
    <div className="flex justify-end mb-4 gap-2 no-print">
        <button
            onClick={onArchiveClick}
            disabled={isArchiving}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
        >
            {isArchiving ? 'Archivage...' : '🗄️ Archiver'}
        </button>
        <button
            onClick={onPrintClick}
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300"
        >
            🖨️ Imprimer / Aperçu
        </button>
    </div>
);

export default ReportToolbar;