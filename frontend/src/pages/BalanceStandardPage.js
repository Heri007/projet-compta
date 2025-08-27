import React, { useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { genererDonneesBalance } from '../utils/balanceHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils';
import ReportToolbar from '../components/reporting/ReportToolbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const BalanceContent = ({ data, dateCloture }) => (
    <>
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">Balance de Vérification Standard</h2>
            <p>Période close le {dateCloture.toLocaleDateString('fr-FR')}</p>
        </div>
        <table className="w-full text-sm">
            <thead className="bg-gray-100 font-bold">
                <tr className="border-b-2 border-black">
                    <th className="p-2 text-left">Compte</th>
                    <th className="p-2 text-left">Libellé</th>
                    <th className="p-2 text-right">Total Débit</th>
                    <th className="p-2 text-right">Total Crédit</th>
                    <th className="p-2 text-right">Solde Débiteur</th>
                    <th className="p-2 text-right">Solde Créditeur</th>
                </tr>
            </thead>
            <tbody>
                {data.lignes.map(l => (
                    <tr key={l.numero_compte} className="border-b hover:bg-blue-50">
                        <td className="p-2 font-mono">{l.numero_compte}</td>
                        <td className="p-2">{l.libelle}</td>
                        <td className="p-2 text-right font-mono">{formatNumber(l.totalDebit)}</td>
                        <td className="p-2 text-right font-mono">{formatNumber(l.totalCredit)}</td>
                        <td className="p-2 text-right font-mono text-green-700">{formatNumber(l.soldeDebit)}</td>
                        <td className="p-2 text-right font-mono text-blue-700">{formatNumber(l.soldeCredit)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-gray-200 font-bold">
                <tr>
                    <td colSpan="2" className="p-2 text-right">TOTAUX</td>
                    <td className="p-2 text-right font-mono">{formatNumber(data.totaux.totalDebit)}</td>
                    <td className="p-2 text-right font-mono">{formatNumber(data.totaux.totalCredit)}</td>
                    <td className="p-2 text-right font-mono text-green-700">{formatNumber(data.totaux.soldeDebit)}</td>
                    <td className="p-2 text-right font-mono text-blue-700">{formatNumber(data.totaux.soldeCredit)}</td>
                </tr>
            </tfoot>
        </table>
    </>
);

const BalanceStandardPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);

    const balanceData = useMemo(() => genererDonneesBalance(comptes, ecritures), [comptes, ecritures]);

    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Balance Standard au ${dateCloture.toLocaleDateString('fr-FR')}`;
        setIsArchiving(true);
        try {
            await axios.post(`${API_URL}/api/reports/archive`, { reportTitle, reportHtml });
            alert('Rapport archivé avec succès !');
        } catch (err) { alert("Erreur d'archivage."); }
        finally { setIsArchiving(false); }
    };

    if (!balanceData) return <div className="p-8">Calcul en cours...</div>;

    const FinalContent = () => <div ref={reportContentRef}><BalanceContent data={balanceData} dateCloture={dateCloture} /></div>;

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            <ReportToolbar onPrintClick={() => setIsPreviewOpen(true)} onArchiveClick={handleArchive} isArchiving={isArchiving} />
            <FinalContent />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Balance Standard">
                <FinalContent />
            </PrintPreviewModal>
        </div>
    );
};

export default BalanceStandardPage;