import React, { useState, useMemo } from 'react';
import { genererDonneesResultatComparatif } from '../utils/compteDeResultatHelperN1';
import PrintPreviewModal from '../components/PrintPreviewModal';

const formatCurrency = (val) => {
    if (val === 0 || !val) return '-';
    return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar`;
};

const ResultatRow = ({ libelle, montantN, montantN1, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatCurrency(montantN)}</td>
        <td className="p-1 text-right font-mono border-l border-gray-300">{formatCurrency(montantN1)}</td>
    </tr>
);

const CompteDeResultatComparatifPage = ({ ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const resultat = useMemo(() => genererDonneesResultatComparatif(ecritures, dateCloture), [ecritures, dateCloture]);

    const ResultatContent = () => (
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
                    {resultat.sections['Produits d\'exploitation'].map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    <ResultatRow libelle="Total des produits d'exploitation" montantN={resultat.soldes.totalProduitsExploitationN} montantN1={resultat.soldes.totalProduitsExploitationN1} isSubTotal />

                    <tr className="bg-gray-100 font-semibold"><td colSpan="3" className="p-1">Charges d'exploitation</td></tr>
                    {resultat.sections['Charges d\'exploitation'].map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    <ResultatRow libelle="Total des charges d'exploitation" montantN={resultat.soldes.totalChargesExploitationN} montantN1={resultat.soldes.totalChargesExploitationN1} isSubTotal />
                    
                    <ResultatRow libelle="RÉSULTAT D'EXPLOITATION" montantN={resultat.soldes.resultatExploitationN} montantN1={resultat.soldes.resultatExploitationN1} isTotal />
                    
                    <tr className="h-4"><td colSpan="3"></td></tr>
                    <tr className="bg-gray-100 font-semibold"><td colSpan="3" className="p-1">Résultat financier</td></tr>
                    {resultat.sections['Produits financiers'].map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    {resultat.sections['Charges financières'].map(item => <ResultatRow key={item.libelle} libelle={item.libelle} montantN={item.montantN} montantN1={item.montantN1} indent />)}
                    <ResultatRow libelle="RÉSULTAT FINANCIER" montantN={resultat.soldes.resultatFinancierN} montantN1={resultat.soldes.resultatFinancierN1} isTotal />

                    <tr className="h-4"><td colSpan="3"></td></tr>
                    <ResultatRow libelle="RÉSULTAT COURANT AVANT IMPÔTS" montantN={resultat.soldes.resultatCourantAvantImpotN} montantN1={resultat.soldes.resultatCourantAvantImpotN1} isTotal />
                    
                    <ResultatRow libelle="Impôts sur les bénéfices" montantN={0} montantN1={0} indent />
                    <tr className="h-4"><td colSpan="3"></td></tr>
                    <ResultatRow libelle="BÉNÉFICE OU PERTE NET" montantN={resultat.soldes.beneficeOuPerteN} montantN1={resultat.soldes.beneficeOuPerteN1} isTotal />
                </tbody>
            </table>
        </>
    );

    return (
        <div className="p-4 h-full overflow-y-auto bg-white">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transform transition"
                >
                    🖨️ Imprimer / Aperçu
                </button>
            </div>
            
            <ResultatContent />

            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression - Compte de Résultat Comparatif"
            >
                <ResultatContent />
            </PrintPreviewModal>
        </div>
    );
};

export default CompteDeResultatComparatifPage;