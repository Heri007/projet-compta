import React, { useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { genererDonneesResultatComparatif } from '../utils/compteDeResultatHelperN1';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 
import ReportToolbar from '../components/reporting/ReportToolbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ResultatRow = ({ libelle, montantN, montantN1, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantN)}</td>
        <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(montantN1)}</td>
    </tr>
);

// --- COMPOSANT D'AFFICHAGE SÉCURISÉ ---
const ResultatContent = ({ resultat, dateCloture }) => {
    // --- CORRECTION : VÉRIFICATION DE SÉCURITÉ ---
    // On s'assure que les sections et les soldes existent, avec des valeurs par défaut.
    const sections = resultat.sections || {};
    const soldes = resultat.soldes || {};

    const produitsExploitation = sections['Produits d\'exploitation'] || [];
    const chargesExploitation = sections['Charges d\'exploitation'] || [];
    const produitsFinanciers = sections['Produits financiers'] || [];
    const chargesFinancieres = sections['Charges financières'] || [];

    return (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Compte de Résultat Comparatif</h2>
                <p>Exercice clos le {dateCloture.toLocaleDateString('fr-FR')} - Unité : ARIARY</p>
            </div>
            
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="p-1 text-left w-2/3">Libellés</th>
                        <th className="p-1 text-right">Exercice (N)</th>
                        <th className="p-1 text-right">Exercice (N-1)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-gray-100 font-semibold"><td colSpan="3" className="p-1">Produits d'exploitation</td></tr>
                    {/* On peut maintenant mapper en toute sécurité */}
                    {produitsExploitation.map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    <ResultatRow libelle="Total des produits d'exploitation" montantN={soldes.totalProduitsExploitationN} montantN1={soldes.totalProduitsExploitationN1} isSubTotal />

                    <tr className="bg-gray-100 font-semibold"><td colSpan="3" className="p-1">Charges d'exploitation</td></tr>
                    {chargesExploitation.map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    <ResultatRow libelle="Total des charges d'exploitation" montantN={soldes.totalChargesExploitationN} montantN1={soldes.totalChargesExploitationN1} isSubTotal />
                    
                    <ResultatRow libelle="RÉSULTAT D'EXPLOITATION" montantN={soldes.resultatExploitationN} montantN1={soldes.resultatExploitationN1} isTotal />
                    
                    <tr className="h-4"><td colSpan="3"></td></tr>
                    <tr className="bg-gray-100 font-semibold"><td colSpan="3" className="p-1">Résultat financier</td></tr>
                    {produitsFinanciers.map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    {chargesFinancieres.map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    <ResultatRow libelle="RÉSULTAT FINANCIER" montantN={soldes.resultatFinancierN} montantN1={soldes.resultatFinancierN1} isTotal />

                    <tr className="h-4"><td colSpan="3"></td></tr>
                    <ResultatRow libelle="RÉSULTAT COURANT AVANT IMPÔTS" montantN={soldes.resultatCourantAvantImpotN} montantN1={soldes.resultatCourantAvantImpotN1} isTotal />
                    
                    <ResultatRow libelle="Impôts sur les bénéfices" montantN={0} montantN1={0} indent />
                    <tr className="h-4"><td colSpan="3"></td></tr>
                    <ResultatRow libelle="BÉNÉFICE OU PERTE NET" montantN={soldes.beneficeOuPerteN} montantN1={soldes.beneficeOuPerteN1} isTotal />
                </tbody>
            </table>
        </>
    );
};


// --- COMPOSANT PRINCIPAL ---
const CompteDeResultatComparatifPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);
    
    // Le helper `genererDonneesResultatComparatif` attend `comptes` comme premier argument
    // mais il n'était pas passé dans les props. On l'ajoute.
    const resultat = useMemo(() => genererDonneesResultatComparatif(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);

    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Compte de Résultat Comparatif au ${dateCloture.toLocaleDateString('fr-FR')}`;

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
    // --- SÉCURITÉ : On vérifie si les données sont prêtes ---
    if (!resultat || !resultat.sections || !resultat.soldes) {
        return (
            <div className="p-8 text-center text-gray-500">
                Calcul du compte de résultat comparatif...
            </div>
        );
    }

    // On redéfinit ResultatContent ici pour qu'il ait accès à la 'ref'
    const FinalResultatContent = () => (
        <div ref={reportContentRef}>
            <ResultatContent resultat={resultat} dateCloture={dateCloture} />
        </div>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            <ReportToolbar 
                onPrintClick={() => setIsPreviewOpen(true)}
                onArchiveClick={handleArchive}
                isArchiving={isArchiving}
            />
            
            <FinalResultatContent />

            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression - Compte de Résultat Comparatif"
            >
                <FinalResultatContent />
            </PrintPreviewModal>
        </div>
    );
};

export default CompteDeResultatComparatifPage;