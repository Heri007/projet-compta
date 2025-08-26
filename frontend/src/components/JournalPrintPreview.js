// Fichier : frontend/src/components/JournalPrintPreview.js

import React from 'react';

const JournalPrintPreview = ({ piecesComptables }) => {
    
    const formatCurrency = (value) => {
        const num = parseFloat(value);
        return num ? num.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '';
    };

    const totalDebit = piecesComptables.flatMap(p => p.lignes).reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = piecesComptables.flatMap(p => p.lignes).reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

    return (
        <div className="p-8 font-sans text-sm">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Journal Comptable</h1>
                <p className="text-gray-500">Liste de toutes les écritures</p>
            </div>

            <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border border-gray-300">Date</th>
                        <th className="p-2 border border-gray-300">Pièce</th>
                        <th className="p-2 border border-gray-300">Journal</th>
                        <th className="p-2 border border-gray-300">Compte</th>
                        <th className="p-2 border border-gray-300">Libellé</th>
                        <th className="p-2 border border-gray-300 text-right">Débit</th>
                        <th className="p-2 border border-gray-300 text-right">Crédit</th>
                    </tr>
                </thead>
                <tbody>
                    {piecesComptables.flatMap(piece => piece.lignes).map(ligne => (
                        <tr key={ligne.id} className="border-t border-gray-200">
                            <td className="p-2 border border-gray-300">{new Date(ligne.date).toLocaleDateString('fr-FR')}</td>
                            <td className="p-2 border border-gray-300 font-mono">{ligne.numero_piece}</td>
                            <td className="p-2 border border-gray-300">{ligne.journal_code}</td>
                            <td className="p-2 border border-gray-300">{ligne.compte_general}</td>
                            <td className="p-2 border border-gray-300">{ligne.libelle_ligne || ligne.libelle_operation}</td>
                            <td className="p-2 border border-gray-300 text-right font-mono">{formatCurrency(ligne.debit)}</td>
                            <td className="p-2 border border-gray-300 text-right font-mono">{formatCurrency(ligne.credit)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                    <tr>
                        <td colSpan="5" className="p-2 border border-gray-300 text-right">TOTAUX</td>
                        <td className="p-2 border border-gray-300 text-right font-mono">{formatCurrency(totalDebit)}</td>
                        <td className="p-2 border border-gray-300 text-right font-mono">{formatCurrency(totalCredit)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default JournalPrintPreview;