import React, { useState, useMemo } from 'react';
import { genererDonneesTFT } from '../utils/tftHelper';
// import PageHeader from '../components/PageHeader'; // Ligne retirée
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 

const TftRow = ({ libelle, montant, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b"}>
        <td className={`p-2 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-2 text-right font-mono">{formatNumber(montant)}</td>
    </tr>
);

const TableauFluxTresoreriePage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const tftData = useMemo(() => genererDonneesTFT(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);

    const TftContent = () => (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Tableau des Flux de Trésorerie</h2>
                <p>(Méthode Indirecte)</p>
                <p>Exercice clos le {dateCloture.toLocaleDateString('fr-FR')} - Unité : ARIARY</p>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="p-2 text-left w-2/3">Libellés</th>
                        <th className="p-2 text-right">Montant</th>
                    </tr>
                </thead>
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
        </>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transform transition">
                    🖨️ Imprimer / Aperçu
                </button>
            </div>
            <TftContent />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Tableau des Flux de Trésorerie">
                <TftContent />
            </PrintPreviewModal>
        </div>
    );
};

export default TableauFluxTresoreriePage;