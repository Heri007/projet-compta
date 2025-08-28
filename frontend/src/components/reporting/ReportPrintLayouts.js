import React from 'react';
import { formatNumber } from '../../utils/formatUtils';

// --- COMPOSANT DE BASE POUR L'EN-TÊTE ---
const ReportHeader = ({ title, dateCloture, unit = 'ARIARY' }) => (
    <div className="report-header">
        <h1 className="report-title">{title}</h1>
        <p className="report-subtitle">
            Au : <strong>{dateCloture.toLocaleDateString('fr-FR')}</strong> - Unité : <strong>{unit}</strong>
        </p>
    </div>
);

// --- SOUS-COMPOSANTS POUR LE BILAN PRINT ---
const BilanActifPrintRow = ({ libelle, montantBrut, amortissements, montantNet, isTotal, isSubTotal, indent }) => (
    <tr className={isTotal ? "total-row" : isSubTotal ? "subtotal-row" : ""}>
        <td style={{ paddingLeft: indent ? '24px' : '8px' }}>{libelle}</td>
        <td className="text-right font-mono">{formatNumber(montantBrut)}</td>
        <td className="text-right font-mono">{formatNumber(amortissements)}</td>
        <td className="text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);

const BilanActifPrint = ({ data }) => (
    <table className="report-table">
        <thead>
            <tr>
                <th style={{width: '40%'}}>ACTIF</th>
                <th className="text-right">Montant brut</th>
                <th className="text-right">Amort. ou Prov.</th>
                <th className="text-right">Montant net</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="grand-titre"><td colSpan="4"><strong>{grandeMasse}</strong></td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                <tr><td colSpan="4"><em>{sousMasse}</em></td></tr>
                                {sousData.lignes.map(ligne => <BilanActifPrintRow key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanActifPrintRow libelle={`Total ${sousMasse}`} {...sousData.total} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            })}
            <BilanActifPrintRow libelle="TOTAL DE L'ACTIF" {...data.TOTAL} isTotal={true} />
        </tbody>
    </table>
);

const BilanPassifPrintRow = ({ libelle, montantNet, isTotal, isSubTotal, indent }) => (
    <tr className={isTotal ? "total-row" : isSubTotal ? "subtotal-row" : ""}>
        <td style={{ paddingLeft: indent ? '24px' : '8px' }}>{libelle}</td>
        <td className="text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);

const BilanPassifPrint = ({ data }) => (
    <table className="report-table">
        <thead>
            <tr>
                <th style={{width: '70%'}}>PASSIF</th>
                <th className="text-right">Montant net</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="grand-titre"><td colSpan="2"><strong>{grandeMasse}</strong></td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                {sousData.lignes.map(ligne => <BilanPassifPrintRow key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanPassifPrintRow libelle={`Total ${sousMasse}`} montantNet={sousData.totalNet} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            })}
            <BilanPassifPrintRow libelle="TOTAL DU PASSIF" montantNet={data.TOTAL.totalNet} isTotal={true} />
        </tbody>
    </table>
);

// --- COMPOSANT PRINCIPAL D'IMPRESSION POUR LE BILAN STANDARD ---
export const BilanPrint = ({ data, dateCloture }) => {
    if (!data || !data.actif || !data.passif) return <p>Données du bilan incomplètes.</p>;

    return (
        <div className="report-container">
            {/* CORRECTION : Utilisation des sous-composants */}
            <ReportHeader title="Bilan Standard" dateCloture={dateCloture} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <BilanActifPrint data={data.actif} />
                <BilanPassifPrint data={data.passif} />
            </div>
        </div>
    );
};