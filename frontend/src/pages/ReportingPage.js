import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import BilanStandardPage from './BilanStandardPage';
import BilanComparatifPage from './BilanComparatifPage';
import CompteDeResultatPage from './CompteDeResultatPage';
import CompteDeResultatComparatifPage from './CompteDeResultatComparatifPage';
import { REPORTS_DATA } from '../data/reportsData';
import TableauFluxTresoreriePage from './TableauFluxTresoreriePage';
import TableauVariationCapitauxPropresPage from './TableauVariationCapitauxPropresPage';
import AnnexePage from './AnnexePage';

// --- Composant ReportTreeItem MIS À JOUR ---
const ReportTreeItem = ({ report, onSelect, selectedReportId }) => {
    const isSelected = selectedReportId === report.id;

    return (
        <li>
            <button
                onClick={() => onSelect(report)}
                className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                    isSelected 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'hover:bg-blue-50 text-gray-700'
                }`}
            >
                {/* Utiliser style = null pour les enlever */}
                <span className={report.isStyled ? "font-extrabold uppercase tracking-wider" : ""}>
                    {report.nom}
                </span>
                {isSelected && <span className="text-xs">✓</span>}
            </button>
            {report.children && (
                <ul className="pl-4 mt-1 border-l-2 ml-2 space-y-1">
                    {report.children.map(child => (
                        <ReportTreeItem 
                            key={child.id}
                            report={child}
                            onSelect={onSelect}
                            selectedReportId={selectedReportId}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

// --- Fonction utilitaire pour retrouver un rapport par son ID ---
const findReportById = (id, reports = REPORTS_DATA) => {
    for (const type of reports) {
        if (type.rapports) {
            for (const r of type.rapports) {
                if (r.id === id) return r;
                if (r.children) {
                    const child = findReportById(id, [{ rapports: r.children }]);
                    if (child) return child;
                }
            }
        }
    }
    return null;
};

// --- COMPOSANT PRINCIPAL REPORTINGPAGE ---
const ReportingPage = ({ comptes, ecritures, dateCloture, initialSelectedReportId }) => {
    const [selectedReport, setSelectedReport] = useState(null);

    //  --- Définition de la classe de style pour l'en-tête ---
const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

    useEffect(() => {
        const initialReport = findReportById(initialSelectedReportId || 'bilan_std');
        setSelectedReport(initialReport);
    }, [initialSelectedReportId]);

    const renderReportPreview = () => {
        if (!selectedReport) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
                    <span className="text-6xl mb-4">📄</span>
                    <h3 className="text-xl font-bold text-gray-700">Bienvenue au Centre des Rapports</h3>
                    <p className="text-gray-500 mt-2">Veuillez sélectionner un rapport dans la liste de gauche pour commencer.</p>
                </div>
            );
        }

        switch (selectedReport.id) {
            case 'bilan_std':
                return <BilanStandardPage comptes={comptes} ecritures={ecritures} dateCloture={dateCloture} />;
            case 'bilan_comp':
                return <BilanComparatifPage comptes={comptes} ecritures={ecritures} dateCloture={dateCloture} />;
            case 'resultat_std':
                return <CompteDeResultatPage comptes={comptes} ecritures={ecritures} dateCloture={dateCloture} />;
            case 'resultat_comp':
                return <CompteDeResultatComparatifPage ecritures={ecritures} dateCloture={dateCloture} />;
            case 'tft_indirect':
                return <TableauFluxTresoreriePage comptes={comptes} ecritures={ecritures} dateCloture={dateCloture} />;
            case 'tvcp_std':
                return <TableauVariationCapitauxPropresPage comptes={comptes} ecritures={ecritures} dateCloture={dateCloture} />;
            case 'annexe_std':
                return <AnnexePage ecritures={ecritures} dateCloture={dateCloture} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
                        <span className="text-6xl mb-4">🛠️</span>
                        <h4 className="text-xl font-bold text-gray-700">{selectedReport.nom}</h4>
                        <p className="text-sm mt-2 text-gray-500">Ce rapport n'a pas encore de prévisualisation.</p>
                        <button className="mt-6 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                            Générer le Rapport
                        </button>
                    </div>
                );
        }
    };

    // --- Objet de configuration pour les couleurs des titres ---
    const titleColors = {
        'bilan': '#d4c9f5',
        'tvcp': '#d4c9f5',
    };
    
    return (
        <div className="p-8 h-full flex flex-col">
            {/* --- APPLIQUER LE STYLE ICI --- */}
            <PageHeader 
                title="Centre des Rapports" 
                subtitle="Générez et consultez vos états financiers. " 
                className={headerGradientClass} // Ajouter la classe ici
            />            
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 flex-grow mt-6">
                
                {/* Colonne de gauche : Sélection des Rapports */}
                <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto">
                {REPORTS_DATA.map(category => {
                        const backgroundColor = titleColors[category.nom];
                        return (
                            <div key={category.id} className="mb-6">
                                {/* --- CORRECTION ET AMÉLIORATION DU TITRE ICI --- */}
                                <h3 
                                    className="text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-3 px-2 py-1 rounded"
                                    style={{ 
                                        backgroundColor: backgroundColor,
                                    }}
                                >
                                    {category.nom}
                                </h3>
                                <ul className="space-y-1">
                                    {category.rapports.map(report => (
                                        <ReportTreeItem
                                            key={report.id}
                                            report={report}
                                            onSelect={setSelectedReport}
                                            selectedReportId={selectedReport?.id}
                                        />
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Colonne de droite : Aperçu du Rapport */}
                <div className="bg-white rounded-lg shadow-md h-full overflow-hidden flex flex-col">
                    {renderReportPreview()}
                </div>
            </div>
        </div>
    );
};

export default ReportingPage;