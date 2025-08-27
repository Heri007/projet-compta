import React, { useState, useMemo, useRef } from 'react'; 
import axios from 'axios'; 
import { genererDonneesTVCP } from '../utils/tvcpHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 
import ReportToolbar from '../components/reporting/ReportToolbar'; 

// 4. Définir l'URL de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const TableauVariationCapitauxPropresPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);
    const tvcpData = useMemo(() => genererDonneesTVCP(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);

    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Tableau de Variation des Capitaux Propres au ${dateCloture.toLocaleDateString('fr-FR')}`;

        setIsArchiving(true);
        try {
            const response = await axios.post(`${API_URL}/api/reports/archive`, { reportTitle, reportHtml });
            alert(response.data.message);
        } catch (err) {
            alert(err.response?.data?.error || "Erreur d'archivage.");
        } finally {
            setIsArchiving(false);
        }
    };

    // Sécurité : si les données ne sont pas prêtes
    if (!tvcpData) {
        return <div className="p-8 text-center text-gray-500">Calcul du tableau de variation...</div>;
    }

    const TvcpContent = () => (
        // 7. Lier la référence au conteneur du contenu
        <div ref={reportContentRef}>
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
                            <td className="p-2 text-right font-mono">{formatNumber(row.capital)}</td>
                            <td className="p-2 text-right font-mono">{formatNumber(row.reserves)}</td>
                            <td className="p-2 text-right font-mono">{formatNumber(row.resultat)}</td>
                            <td className="p-2 text-right font-mono font-semibold">{formatNumber(row.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            {/* 8. Remplacer l'ancien bouton par la barre d'outils */}
            <ReportToolbar 
                onPrintClick={() => setIsPreviewOpen(true)}
                onArchiveClick={handleArchive}
                isArchiving={isArchiving}
            />

            <TvcpContent />
            
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Variation des Capitaux Propres">
                <TvcpContent />
            </PrintPreviewModal>
        </div>
    );
};

export default TableauVariationCapitauxPropresPage;