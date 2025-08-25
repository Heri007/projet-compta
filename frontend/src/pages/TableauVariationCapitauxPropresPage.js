import React, { useState, useMemo } from 'react';
import { genererDonneesTVCP } from '../utils/tvcpHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';

const formatCurrency = (val) => val === 0 ? '-' : val.toLocaleString('fr-FR', { minimumFractionDigits: 2 });

const TableauVariationCapitauxPropresPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const tvcpData = useMemo(() => genererDonneesTVCP(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);

    const TvcpContent = () => (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Tableau de Variation des Capitaux Propres</h2>
                <p>Unité : ARIARY</p>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-y-2 border-black bg-gray-100 font-bold">
                        <th className="p-2 text-left w-1/3">Libellés</th>
                        <th className="p-2 text-right">Capital social</th>
                        <th className="p-2 text-right">Primes & Réserves</th>
                        <th className="p-2 text-right">Résultat & Report à Nouveau</th>
                        <th className="p-2 text-right">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {tvcpData.map((row, index) => (
                        <tr key={index} className={`border-b ${row.libelle.toLowerCase().startsWith('solde') ? 'font-bold bg-gray-100' : ''}`}>
                            <td className="p-2">{row.libelle}</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(row.capital)}</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(row.reserves)}</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(row.resultat)}</td>
                            <td className="p-2 text-right font-mono font-semibold">{formatCurrency(row.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 bg-gray-200 ...">🖨️ Imprimer / Aperçu</button>
            </div>
            <TvcpContent />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Variation des Capitaux Propres">
                <TvcpContent />
            </PrintPreviewModal>
        </div>
    );
};

export default TableauVariationCapitauxPropresPage;