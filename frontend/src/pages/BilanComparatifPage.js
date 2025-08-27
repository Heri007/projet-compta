import React, { useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { genererDonneesBilanComparatif } from '../utils/bilanHelperN1';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 
import ReportToolbar from '../components/reporting/ReportToolbar'; // 2. Importer la barre d'outils

// 3. Définir l'URL de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// --- MIS À JOUR POUR AFFICHER LES 4 COLONNES ---
const BilanRow = ({ libelle, N, N1, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(N.brut)}</td>
        <td className="p-1 text-right font-mono bg-gray-50">{formatNumber(N.amort)}</td>
        <td className="p-1 text-right font-mono">{formatNumber(N.net)}</td>
        <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(N1.net)}</td>
    </tr>
);

const BilanActif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-2/5">ACTIF</th>
                <th className="p-1 text-right">Montant brut</th>
                <th className="p-1 text-right">Amort. ou Prov.</th>
                <th className="p-1 text-right">Montant net (N)</th>
                <th className="p-1 text-right">Montant net (N-1)</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="5" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                <tr><td colSpan="5" className="p-1 font-semibold italic">{sousMasse}</td></tr>
                                {sousData.lignes.map(ligne => <BilanRow key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanRow libelle={`Total ${sousMasse}`} N={sousData.total.N} N1={sousData.total.N1} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        <BilanRow libelle={`TOTAL DE L'${grandeMasse}`} N={grandeMasseData.total.N} N1={grandeMasseData.total.N1} isTotal={true} />
                    </React.Fragment>
                );
            })}
            <BilanRow libelle="TOTAL DE L'ACTIF" N={data.TOTAL.N} N1={data.TOTAL.N1} isTotal={true} />
        </tbody>
    </table>
);

const BilanPassif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-2/3">PASSIF</th>
                <th className="p-1 text-right">Exercice (N)</th>
                <th className="p-1 text-right">Exercice (N-1)</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse.startsWith('TOTAL')) return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="3" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                {sousData.lignes.map(ligne => (
                                    <tr key={ligne.libelle} className="border-b hover:bg-purple-50">
                                        <td className="p-1 pl-8">{ligne.libelle}</td>
                                        <td className="p-1 text-right font-mono">{formatNumber(ligne.montantBrutN)}</td>
                                        <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(ligne.montantBrutN1)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold">
                                    <td className="p-1">{`Total ${sousMasse}`}</td>
                                    <td className="p-1 text-right font-mono">{formatNumber(sousData.totalN)}</td>
                                    <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(sousData.totalN1)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            })}
            <tr className="bg-gray-200 font-bold">
                <td className="p-1">TOTAL DU PASSIF</td>
                <td className="p-1 text-right font-mono">{formatNumber(data.TOTAL_N)}</td>
                <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(data.TOTAL_N1)}</td>
            </tr>
        </tbody>
    </table>
);

const BilanComparatifPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);
    const { actif, passif } = useMemo(() => genererDonneesBilanComparatif(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);
    // Correction de la vérification de l'équilibre
    const isEquilibreN = Math.abs((actif.TOTAL?.N?.net || 0) - (passif.TOTAL_N || 0)) < 0.01;
    const isEquilibreN1 = Math.abs((actif.TOTAL?.N1?.net || 0) - (passif.TOTAL_N1 || 0)) < 0.01;

    // la fonction d'archivage
    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Bilan Comparatif au ${dateCloture.toLocaleDateString('fr-FR')}`;

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
    const BilanContent = () => (
        <div ref={reportContentRef}>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Bilan Comparatif</h2>
                <p>Au : {dateCloture.toLocaleDateString('fr-FR')} - Unité : ARIARY</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BilanActif data={actif} />
                <BilanPassif data={passif} />
            </div>
            <div className={`mt-6 p-4 text-center font-bold text-lg rounded-md ${isEquilibreN && isEquilibreN1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isEquilibreN && isEquilibreN1 ? `Bilans équilibrés` : `Déséquilibre détecté`}
            </div>
        </div>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            {/* 7. Remplacer l'ancien bouton par la barre d'outils */}
            <ReportToolbar 
                onPrintClick={() => setIsPreviewOpen(true)}
                onArchiveClick={handleArchive}
                isArchiving={isArchiving}
            />
            
            <BilanContent />
            
            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression - Bilan Comparatif"
            >
                <BilanContent />
            </PrintPreviewModal>
        </div>
    );
};

export default BilanComparatifPage;