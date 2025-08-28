import React, { useState, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import { genererDonneesBilanComplet } from '../utils/bilanHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils';
import ReportToolbar from '../components/reporting/ReportToolbar';
import { BilanPrint } from '../components/reporting/ReportPrintLayouts'; // Importer la version d'impression

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- Composants d'affichage à l'écran (avec styles Tailwind) ---
const BilanActifRow = ({ libelle, montantBrut, amortissements, montantNet, isTotal, isSubTotal, indent }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantBrut)}</td>
        <td className="p-1 text-right font-mono bg-gray-50">{formatNumber(amortissements)}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);
const BilanActif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-1/2">ACTIF</th>
                <th className="p-1 text-right">Montant brut</th>
                <th className="p-1 text-right">Amort. ou Prov.</th>
                <th className="p-1 text-right">Montant net</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="4" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                <tr><td colSpan="4" className="p-1 font-semibold italic">{sousMasse}</td></tr>
                                {sousData.lignes.map(ligne => <BilanActifRow key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanActifRow libelle={`Total ${sousMasse}`} {...sousData.total} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        <BilanActifRow libelle={`TOTAL DE L'${grandeMasse}`} {...grandeMasseData.total} isTotal={true} />
                    </React.Fragment>
                );
            })}
            <BilanActifRow libelle="TOTAL DE L'ACTIF" {...data.TOTAL} isTotal={true} />
        </tbody>
    </table>
);

const BilanPassifRow = ({ libelle, montantNet, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-purple-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);

const BilanPassif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-2/3">PASSIF</th>
                <th className="p-1 text-right">Montant net</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="2" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                {/* Les lignes de détail n'ont pas de titre de sous-masse au passif */}
                                {sousData.lignes.map(ligne => <BilanPassifRow key={ligne.libelle} libelle={ligne.libelle} montantNet={ligne.montantNet} indent={true} />)}
                                <BilanPassifRow libelle={`Total ${sousMasse}`} montantNet={sousData.totalNet} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        {/* Le total de la grande masse n'est généralement pas affiché au passif, mais on le garde pour la cohérence si besoin */}
                        {/* <BilanPassifRow libelle={`TOTAL ${grandeMasse}`} montantNet={grandeMasseData.totalNet} isTotal={true} /> */}
                    </React.Fragment>
                );
            })}
            <BilanPassifRow libelle="TOTAL DU PASSIF" montantNet={data.TOTAL.totalNet} isTotal={true} />
        </tbody>
    </table>
);

const BilanStandardPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const bilanData = useMemo(() => genererDonneesBilanComplet(comptes, ecritures), [comptes, ecritures]);
    const isEquilibre = Math.abs((bilanData.actif.TOTAL.totalNet || 0) - (bilanData.passif.TOTAL.totalNet || 0)) < 0.01;

    const handleArchive = async () => {
        const reportTitle = `Bilan Standard au ${dateCloture.toLocaleDateString('fr-FR')}`;
        // On génère le HTML à partir du composant d'impression dédié
        const reportHtml = ReactDOMServer.renderToStaticMarkup(
            <BilanPrint data={bilanData} dateCloture={dateCloture} />
        );

        setIsArchiving(true);
        try {
            await axios.post(`${API_URL}/api/reports/archive`, { reportTitle, reportHtml });
            alert('Rapport archivé avec succès !');
        } catch (err) {
            alert(err.response?.data?.error || "Erreur d'archivage.");
        } finally {
            setIsArchiving(false);
        }
    };

    // Composant d'affichage à l'écran
    const BilanContentScreen = () => (
        <div>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Bilan Standard</h2>
                <p>Au : {dateCloture ? dateCloture.toLocaleDateString('fr-FR') : ''} - Unité : ARIARY</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BilanActif data={bilanData.actif} />
                <BilanPassif data={bilanData.passif} />
            </div>
            <div className={`screen-only mt-6 p-4 text-center font-bold text-lg rounded-md ${isEquilibre ? 'bg-green-100' : 'bg-red-100'}`}>
                {isEquilibre ? `Bilan équilibré : ${formatNumber(bilanData.actif.TOTAL.totalNet)}` : `Déséquilibre : ${formatNumber(bilanData.actif.TOTAL.totalNet - bilanData.passif.TOTAL.totalNet)}`}
            </div>
        </div>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            <ReportToolbar 
                onPrintClick={() => setIsPreviewOpen(true)}
                onArchiveClick={handleArchive}
                isArchiving={isArchiving}
            />
            
            <BilanContentScreen />
            
            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression - Bilan Standard"
            >
                <BilanPrint data={bilanData} dateCloture={dateCloture} />
            </PrintPreviewModal>
        </div>
    );
};

export default BilanStandardPage;