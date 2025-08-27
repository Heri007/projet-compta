import React, { useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { genererDonneesBilanComparatif } from '../utils/bilanHelperN1';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 
import ReportToolbar from '../components/reporting/ReportToolbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- SOUS-COMPOSANTS SIMPLIFIÉS POUR L'IMPRESSION ---

const BilanActifRowN1 = ({ libelle, N, N1, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "total-row" : isSubTotal ? "subtotal-row" : ""}>
        <td className={indent ? 'pl-8' : ''}>{libelle}</td>
        <td className="text-right font-mono">{formatNumber(N.brut)}</td>
        <td className="text-right font-mono">{formatNumber(N.amort)}</td>
        <td className="text-right font-mono">{formatNumber(N.net)}</td>
        <td className="text-right font-mono">{formatNumber(N1.net)}</td>
    </tr>
);

const BilanActifN1 = ({ data }) => (
    <table>
        <thead>
            <tr>
                <th className="w-2/5">ACTIF</th>
                <th className="text-right">Montant brut</th>
                <th className="text-right">Amort. ou Prov.</th>
                <th className="text-right">Montant net (N)</th>
                <th className="text-right">Montant net (N-1)</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="total-row"><td colSpan="5">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                <tr><td colSpan="5"><em>{sousMasse}</em></td></tr>
                                {sousData.lignes.map(ligne => <BilanActifRowN1 key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanActifRowN1 libelle={`Total ${sousMasse}`} N={sousData.total.N} N1={sousData.total.N1} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        <BilanActifRowN1 libelle={`TOTAL DE L'${grandeMasse}`} N={grandeMasseData.total.N} N1={grandeMasseData.total.N1} isTotal={true} />
                    </React.Fragment>
                );
            })}
            <BilanActifRowN1 libelle="TOTAL DE L'ACTIF" N={data.TOTAL.N} N1={data.TOTAL.N1} isTotal={true} />
        </tbody>
    </table>
);

const BilanPassifN1 = ({ data }) => (
    <table>
        <thead>
            <tr>
                <th className="w-2/3">PASSIF</th>
                <th className="text-right">Exercice (N)</th>
                <th className="text-right">Exercice (N-1)</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse.startsWith('TOTAL')) return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="total-row"><td colSpan="3">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                {sousData.lignes.map(ligne => (
                                    <tr key={ligne.libelle}>
                                        <td className="pl-8">{ligne.libelle}</td>
                                        <td className="text-right font-mono">{formatNumber(ligne.montantBrutN)}</td>
                                        <td className="text-right font-mono">{formatNumber(ligne.montantBrutN1)}</td>
                                    </tr>
                                ))}
                                <tr className="subtotal-row">
                                    <td>{`Total ${sousMasse}`}</td>
                                    <td className="text-right font-mono">{formatNumber(sousData.totalN)}</td>
                                    <td className="text-right font-mono">{formatNumber(sousData.totalN1)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            })}
            <tr className="total-row">
                <td>TOTAL DU PASSIF</td>
                <td className="text-right font-mono">{formatNumber(data.TOTAL_N)}</td>
                <td className="text-right font-mono">{formatNumber(data.TOTAL_N1)}</td>
            </tr>
        </tbody>
    </table>
);


// --- COMPOSANT PRINCIPAL ---
const BilanComparatifPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);

    const { actif, passif } = useMemo(() => genererDonneesBilanComparatif(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);
    
    const isEquilibreN = Math.abs((actif.TOTAL?.N?.net || 0) - (passif.TOTAL_N || 0)) < 0.01;
    const isEquilibreN1 = Math.abs((actif.TOTAL?.N1?.net || 0) - (passif.TOTAL_N1 || 0)) < 0.01;

    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Bilan Comparatif au ${dateCloture.toLocaleDateString('fr-FR')}`;
        setIsArchiving(true);
        try {
            await axios.post(`${API_URL}/api/reports/archive`, { reportTitle, reportHtml });
            alert('Rapport archivé avec succès !');
        } catch (err) { alert(err.response?.data?.error || "Erreur d'archivage."); }
        finally { setIsArchiving(false); }
    };

    const BilanContent = () => (
        <div ref={reportContentRef} className="report-container">
            <div className="text-center">
                <h2>Bilan Comparatif</h2>
                <p>Au : {dateCloture.toLocaleDateString('fr-FR')} - Unité : ARIARY</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <BilanActifN1 data={actif} />
                <BilanPassifN1 data={passif} />
            </div>
            <div className={`screen-only mt-6 p-4 text-center font-bold text-lg rounded-md ${isEquilibreN && isEquilibreN1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isEquilibreN && isEquilibreN1 ? `Bilans équilibrés` : `Déséquilibre détecté`}
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