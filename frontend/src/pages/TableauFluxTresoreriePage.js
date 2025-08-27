import React, { useState, useMemo, useRef } from 'react'; 
import axios from 'axios'; 
import { genererDonneesTFT } from '../utils/tftHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 
import ReportToolbar from '../components/reporting/ReportToolbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const TftRow = ({ libelle, montant, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b"}>
        <td className={`p-2 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-2 text-right font-mono">{formatNumber(montant)}</td>
    </tr>
);

const TableauFluxTresoreriePage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);
    const tftData = useMemo(() => genererDonneesTFT(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);

    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Tableau des Flux de Trésorerie au ${dateCloture.toLocaleDateString('fr-FR')}`;

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

    // Sécurité : si tftData n'est pas prêt, on affiche un message
    if (!tftData) {
        return <div className="p-8 text-center text-gray-500">Calcul des flux de trésorerie...</div>;
    }
    const TftContent = () => (
        // Lier la référence au conteneur du contenu
        <div ref={reportContentRef}>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Tableau des Flux de Trésorerie</h2>
                <p>(Méthode Indirecte)</p>
                <p>Exercice clos le {dateCloture.toLocaleDateString('fr-FR')} - Unité : ARIARY</p>
            </div>
            <table className="w-full text-sm">
                {/* ... (le contenu du tableau reste le même) ... */}
                <tbody>
                    <tr className="bg-gray-800 text-white font-bold"><td colSpan="2" className="p-1">Flux de trésorerie liés à l'activité</td></tr>
                    <TftRow libelle="Résultat net de l'exercice" montant={tftData.resultatNetN} />
                    <TftRow libelle="Ajustements pour :" isSubTotal />
                    <TftRow libelle="Amortissements et provisions" montant={tftData.dotationsAmortProv} indent />
                    <TftRow libelle="Variation des stocks" montant={tftData.varStocks} indent />
                    <TftRow libelle="Variation des clients et autres créances" montant={tftData.varClients} indent />
                    <TftRow libelle="Variation des fournisseurs et autres dettes" montant={tftData.varFournisseurs} indent />
                    <TftRow libelle="Flux de trésorerie générés par l'activité (A)" montant={tftData.fluxOperationnelNet} isTotal />

                    <tr className="h-4"><td colSpan="2"></td></tr>

                    <tr className="bg-gray-800 text-white font-bold"><td colSpan="2" className="p-1">Flux de trésorerie liés aux opérations d'investissement</td></tr>
                    <TftRow libelle="Décaissements sur acquisitions d'immobilisations" montant={tftData.decaissementsImmo} indent />
                    <TftRow libelle="Flux de trésorerie liés aux opérations d'investissement (B)" montant={tftData.fluxInvestissementNet} isTotal />

                    <tr className="h-4"><td colSpan="2"></td></tr>
                    
                    <tr className="bg-gray-800 text-white font-bold"><td colSpan="2" className="p-1">Flux de trésorerie liés aux activités de financement</td></tr>
                    <TftRow libelle="Variation des capitaux propres (hors résultat)" montant={tftData.varCapitauxPropres} indent />
                    <TftRow libelle="Variation des dettes financières" montant={tftData.varDettesFinancieres} indent />
                    <TftRow libelle="Flux de trésorerie liés aux opérations de financement (C)" montant={tftData.fluxFinancementNet} isTotal />
                    
                    <tr className="h-4"><td colSpan="2"></td></tr>

                    <TftRow libelle="Variation de trésorerie de la période (A+B+C)" montant={tftData.variationTresorerie} isTotal />
                    
                    <tr className="h-4"><td colSpan="2"></td></tr>

                    <TftRow libelle="Trésorerie d'ouverture" montant={tftData.tresorerieOuverture} />
                    <TftRow libelle="Trésorerie de clôture" montant={tftData.tresorerieCloture} />
                    <TftRow libelle="Variation de trésorerie" montant={tftData.tresorerieCloture - tftData.tresorerieOuverture} isSubTotal />
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
            
            <TftContent />
            
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Tableau des Flux de Trésorerie">
                <TftContent />
            </PrintPreviewModal>
        </div>
    );
};

export default TableauFluxTresoreriePage;