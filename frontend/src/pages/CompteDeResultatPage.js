import React, { useMemo, useState } from 'react';
import { genererDonneesResultat } from '../utils/compteDeResultatHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 

const ResultatRow = ({ libelle, montant, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montant)}</td>
    </tr>
);

// --- COMPOSANT D'AFFICHAGE SÉCURISÉ ---
// Ce composant interne ne s'affichera que si les données sont valides
const ResultatContent = ({ resultat, dateCloture }) => {
    // --- CORRECTION MAJEURE : VÉRIFICATION DE SÉCURITÉ ---
    // On s'assure que les sections existent avant de les utiliser, en fournissant un tableau vide par défaut.
    const produitsExploitation = resultat.sections?.['Produits d\'exploitation'] || [];
    const chargesExploitation = resultat.sections?.['Charges d\'exploitation'] || [];
    const produitsFinanciers = resultat.sections?.['Produits financiers'] || [];
    const chargesFinancieres = resultat.sections?.['Charges financières'] || [];
    
    // Calcul des totaux directement à partir des sections sécurisées
    const totalProduitsExploitation = produitsExploitation.reduce((sum, item) => sum + item.montant, 0);
    const totalChargesExploitation = chargesExploitation.reduce((sum, item) => sum + item.montant, 0);
    const resultatExploitation = totalProduitsExploitation - totalChargesExploitation;
    
    const totalProduitsFinanciers = produitsFinanciers.reduce((sum, item) => sum + item.montant, 0);
    const totalChargesFinancieres = chargesFinancieres.reduce((sum, item) => sum + item.montant, 0);
    const resultatFinancier = totalProduitsFinanciers - totalChargesFinancieres;

    const resultatCourantAvantImpot = resultatExploitation + resultatFinancier;
    const impotSurBenefice = 0; // Simplifié
    const beneficeOuPerte = resultatCourantAvantImpot - impotSurBenefice;

    return (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Compte de Résultat Standard</h2>
                <p>
                    Pour l'exercice clos le {dateCloture ? dateCloture.toLocaleDateString('fr-FR') : '[Date non définie]'} - Unité : ARIARY
                </p>
            </div>
            
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="p-1 text-left w-2/3">Libellés</th>
                        <th className="p-1 text-right">Exercice N</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-gray-100 font-semibold"><td colSpan="2" className="p-1">Produits d'exploitation</td></tr>
                    {/* On peut maintenant mapper en toute sécurité */}
                    {produitsExploitation.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    <ResultatRow libelle="Total des produits d'exploitation" montant={totalProduitsExploitation} isSubTotal />

                    <tr className="bg-gray-100 font-semibold"><td colSpan="2" className="p-1">Charges d'exploitation</td></tr>
                    {chargesExploitation.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    <ResultatRow libelle="Total des charges d'exploitation" montant={totalChargesExploitation} isSubTotal />
                    
                    <ResultatRow libelle="RÉSULTAT D'EXPLOITATION" montant={resultatExploitation} isTotal />
                    
                    <tr className="h-4"><td colSpan="2"></td></tr>
                    <tr className="bg-gray-100 font-semibold"><td colSpan="2" className="p-1">Résultat financier</td></tr>
                    {produitsFinanciers.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    {chargesFinancieres.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    <ResultatRow libelle="RÉSULTAT FINANCIER" montant={resultatFinancier} isTotal />

                    <tr className="h-4"><td colSpan="2"></td></tr>
                    <ResultatRow libelle="RÉSULTAT COURANT AVANT IMPÔTS" montant={resultatCourantAvantImpot} isTotal />
                    
                    <ResultatRow libelle="Impôts sur les bénéfices" montant={impotSurBenefice} indent />
                    <tr className="h-4"><td colSpan="2"></td></tr>
                    <ResultatRow libelle="BÉNÉFICE OU PERTE" montant={beneficeOuPerte} isTotal />
                </tbody>
            </table>
        </>
    );
};

// --- COMPOSANT PRINCIPAL ---
const CompteDeResultatPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Le calcul des données reste le même
    const resultatData = useMemo(() => genererDonneesResultat(comptes, ecritures), [comptes, ecritures]);

    // --- SÉCURITÉ : On vérifie si les données sont prêtes avant de les afficher ---
    if (!resultatData || !resultatData.sections) {
        return (
            <div className="p-8 text-center text-gray-500">
                Calcul du compte de résultat...
            </div>
        );
    }

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
            
            <ResultatContent resultat={resultatData} dateCloture={dateCloture} />

            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression - Compte de Résultat Standard"
            >
                <ResultatContent resultat={resultatData} dateCloture={dateCloture} />
            </PrintPreviewModal>
        </div>
    );
};

export default CompteDeResultatPage;