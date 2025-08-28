// Fichier : frontend/src/components/reporting/ReportPrintLayouts.js
import React from 'react';
import { formatNumber } from '../../utils/formatUtils';

// --- COMPOSANT EN-TÊTE ---
const ReportHeader = ({ title, dateCloture, unit = 'ARIARY' }) => (
    <div className="report-header mb-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <p>Au : <strong>{dateCloture?.toLocaleDateString('fr-FR')}</strong> - Unité : <strong>{unit}</strong></p>
    </div>
);

// --- LIGNES ACTIF ---
const BilanActifPrintRow = ({ libelle, montantBrut, amortissements, montantNet, isTotal, isSubTotal, indent = 0 }) => (
    <tr className={isTotal ? "total-row font-bold" : isSubTotal ? "subtotal-row font-semibold" : ""}>
        <td style={{ paddingLeft: `${indent * 20}px` }}>{libelle}</td>
        <td className="text-right font-mono">{formatNumber(montantBrut)}</td>
        <td className="text-right font-mono">{formatNumber(amortissements)}</td>
        <td className="text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);

// --- LIGNES PASSIF ---
const BilanPassifPrintRow = ({ libelle, montantNet, isTotal, isSubTotal, indent = 0 }) => (
    <tr className={isTotal ? "total-row font-bold" : isSubTotal ? "subtotal-row font-semibold" : ""}>
        <td style={{ paddingLeft: `${indent * 20}px` }}>{libelle}</td>
        <td className="text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);

// --- BILAN GLOBAL ---
export const BilanPrint = ({ data, dateCloture }) => (
    <div className="report-container">
        <ReportHeader title="Bilan" dateCloture={dateCloture} />

        {/* --- ACTIF --- */}
        <table className="report-table mb-6 w-full border-collapse">
            <thead>
                <tr>
                    <th>ACTIF</th>
                    <th className="text-right">Brut</th>
                    <th className="text-right">Amortissements</th>
                    <th className="text-right">Net</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(data.actif).map(([grandeMasse, grandeMasseData]) => {
                    if (grandeMasse === 'TOTAL') return null;
                    const totalGrandeMasse = grandeMasseData.total || { totalBrut: 0, totalAmort: 0, totalNet: 0 };

                    return (
                        <React.Fragment key={grandeMasse}>
                            <tr className="bg-gray-800 text-white font-bold">
                                <td colSpan="4">{grandeMasse}</td>
                            </tr>
                            {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => {
                                const totalSousMasse = sousData.total || { totalBrut: 0, totalAmort: 0, totalNet: 0 };
                                return (
                                    <React.Fragment key={sousMasse}>
                                        <tr>
                                            <td colSpan="4" className="font-semibold italic">{sousMasse}</td>
                                        </tr>
                                        {sousData.lignes.map(l => <BilanActifPrintRow key={l.libelle} {...l} indent={1} />)}
                                        <BilanActifPrintRow 
                                            libelle={`Total ${sousMasse}`} 
                                            montantBrut={totalSousMasse.totalBrut} 
                                            amortissements={totalSousMasse.totalAmort} 
                                            montantNet={totalSousMasse.totalNet} 
                                            isSubTotal 
                                        />
                                    </React.Fragment>
                                );
                            })}
                            <BilanActifPrintRow 
                                libelle={`TOTAL DE L'${grandeMasse}`} 
                                montantBrut={totalGrandeMasse.totalBrut} 
                                amortissements={totalGrandeMasse.totalAmort} 
                                montantNet={totalGrandeMasse.totalNet} 
                                isTotal 
                            />
                        </React.Fragment>
                    );
                })}
                <BilanActifPrintRow 
                    libelle="TOTAL DE L'ACTIF" 
                    montantBrut={data.actif.TOTAL?.totalBrut || 0} 
                    amortissements={data.actif.TOTAL?.totalAmort || 0} 
                    montantNet={data.actif.TOTAL?.totalNet || 0} 
                    isTotal 
                />
            </tbody>
        </table>

        {/* --- PASSIF --- */}
        <table className="report-table w-full border-collapse">
            <thead>
                <tr>
                    <th>PASSIF</th>
                    <th className="text-right">Montant net</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(data.passif).map(([grandeMasse, grandeMasseData]) => {
                    if (grandeMasse === 'TOTAL') return null;
                    const totalGrandeMasse = grandeMasseData.total || { totalNet: 0 };

                    return (
                        <React.Fragment key={grandeMasse}>
                            <tr className="bg-gray-800 text-white font-bold">
                                <td colSpan="2">{grandeMasse}</td>
                            </tr>
                            {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => {
                                const totalSousMasse = sousData.total || { totalNet: 0 };
                                return (
                                    <React.Fragment key={sousMasse}>
                                        {sousData.lignes.map(l => 
                                            <BilanPassifPrintRow key={l.libelle} libelle={l.libelle} montantNet={l.montantNet || 0} indent={1} />
                                        )}
                                        <BilanPassifPrintRow 
                                            libelle={`Total ${sousMasse}`} 
                                            montantNet={totalSousMasse.totalNet} 
                                            isSubTotal 
                                        />
                                    </React.Fragment>
                                );
                            })}
                            <BilanPassifPrintRow 
                                libelle={`TOTAL DE ${grandeMasse}`} 
                                montantNet={totalGrandeMasse.totalNet} 
                                isTotal 
                            />
                        </React.Fragment>
                    );
                })}
                <BilanPassifPrintRow 
                    libelle="TOTAL DU PASSIF" 
                    montantNet={data.passif.TOTAL?.totalNet || 0} 
                    isTotal 
                />
            </tbody>
        </table>
    </div>
);

