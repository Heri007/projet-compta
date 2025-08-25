// src/components/reporting/ReportTreeItem.js

import React from 'react';

const ReportTreeItem = ({ report, onSelect, selectedReportId }) => {
    const isSelected = selectedReportId === report.id;

    return (
        <li>
            <button
                onClick={() => onSelect(report)}
                className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                    isSelected 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'hover:bg-blue-50 text-gray-700'
                }`}
            >
                {/* Utiliser style = null pour les enlever */}
                <span className={report.isStyled ? "font-extrabold uppercase tracking-wider" : ""}>
                    {report.nom}
                </span>
                {isSelected && <span className="text-xs">✓</span>}
            </button>
            {report.children && (
                <ul className="pl-4 mt-1 border-l-2 ml-2 space-y-1">
                    {report.children.map(child => (
                        <ReportTreeItem 
                            key={child.id}
                            report={child}
                            onSelect={onSelect}
                            selectedReportId={selectedReportId}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};


export default ReportTreeItem;