import React, { useMemo, useState } from 'react'; // Ajout de useState pour l'aperçu
import { genererDonneesResultat } from '../utils/compteDeResultatHelper';
import PrintPreviewModal from '../components/PrintPreviewModal'; // Import pour l'impression

const formatCurrency = (val) => {
    if (val === 0 || !val) return '-';
    return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar`;
};

const ResultatRow = ({ libelle, montant, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatCurrency(montant)}</td>
    </tr>
);

// --- MODIFIÉ : Le composant accepte maintenant la prop 'dateCloture' ---
const CompteDeResultatPage = ({ comptes, ecritures, dateCloture }) => {
    // État pour la modale d'impression
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const resultat = useMemo(() => genererDonneesResultat(comptes, ecritures), [comptes, ecritures]);

    // Contenu du rapport dans une variable pour être réutilisé (affichage et impression)
    const ResultatContent = () => (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Compte de Résultat Standard</h2>
                {/* --- MODIFIÉ : La date est maintenant dynamique et formatée --- */}
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
                    {/* --- PRODUITS D'EXPLOITATION --- */}
                    <tr className="bg-gray-100 font-semibold"><td colSpan="2" className="p-1">Produits d'exploitation</td></tr>
                    {resultat.produitsExploitation.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    <ResultatRow libelle="Total des produits d'exploitation" montant={resultat.totalProduitsExploitation} isSubTotal />

                    {/* --- CHARGES D'EXPLOITATION --- */}
                    <tr className="bg-gray-100 font-semibold"><td colSpan="2" className="p-1">Charges d'exploitation</td></tr>
                    {resultat.chargesExploitation.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    <ResultatRow libelle="Total des charges d'exploitation" montant={resultat.totalChargesExploitation} isSubTotal />
                    
                    <ResultatRow libelle="RÉSULTAT D'EXPLOITATION" montant={resultat.resultatExploitation} isTotal />
                    
                    {/* --- RÉSULTAT FINANCIER --- */}
                    <tr className="h-4"><td colSpan="2"></td></tr>
                    <tr className="bg-gray-100 font-semibold"><td colSpan="2" className="p-1">Résultat financier</td></tr>
                    {resultat.produitsFinanciers.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    {resultat.chargesFinancieres.map(item => <ResultatRow key={item.libelle} {...item} indent />)}
                    <ResultatRow libelle="RÉSULTAT FINANCIER" montant={resultat.resultatFinancier} isTotal />

                    {/* --- RÉSULTAT FINAL --- */}
                    <tr className="h-4"><td colSpan="2"></td></tr>
                    <ResultatRow libelle="RÉSULTAT COURANT AVANT IMPÔTS" montant={resultat.resultatCourantAvantImpot} isTotal />
                    
                    <ResultatRow libelle="Impôts sur les bénéfices" montant={resultat.impotSurBenefice} indent />
                    <tr className="h-4"><td colSpan="2"></td></tr>
                    <ResultatRow libelle="BÉNÉFICE OU PERTE" montant={resultat.beneficeOuPerte} isTotal />
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
                title="Aperçu avant impression - Compte de Résultat Standard"
            >
                <ResultatContent />
            </PrintPreviewModal>
        </div>
    );
};

export default CompteDeResultatPage;