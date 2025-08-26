import React, { useState, useMemo } from 'react';
import { genererDonneesBilanComplet } from '../utils/bilanHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 

// --- MIS À JOUR POUR AFFICHER LES 3 COLONNES ---
const BilanRow = ({ libelle, montantBrut, amortissements, montantNet, isTotal = false, isSubTotal = false, indent = false }) => (
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
                                {sousData.lignes.map(ligne => <BilanRow key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanRow libelle={`Total ${sousMasse}`} montantBrut={sousData.totalBrut} amortissements={sousData.totalAmort} montantNet={sousData.totalNet} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        <BilanRow libelle={`TOTAL DE L'${grandeMasse}`} montantBrut={grandeMasseData.totalBrut} amortissements={grandeMasseData.totalAmort} montantNet={grandeMasseData.totalNet} isTotal={true} />
                    </React.Fragment>
                );
            })}
            <BilanRow libelle="TOTAL DE L'ACTIF" montantBrut={data.TOTAL.totalBrut} amortissements={data.TOTAL.totalAmort} montantNet={data.TOTAL.totalNet} isTotal={true} />
        </tbody>
    </table>
);

const BilanPassif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-1/2">PASSIF</th>
                <th colSpan="3" className="p-1 text-right">Montant net</th>
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
                                {sousData.lignes.map(ligne => (
                                    <tr key={ligne.libelle} className="border-b hover:bg-purple-50">
                                        <td className="p-1 pl-8">{ligne.libelle}</td>
                                        <td colSpan="3" className="p-1 text-right font-mono">{formatNumber(ligne.montantBrut)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold">
                                    <td className="p-1">{`Total ${sousMasse}`}</td>
                                    <td colSpan="3" className="p-1 text-right font-mono">{formatNumber(sousData.total)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            })}
            <tr className="bg-gray-200 font-bold">
                <td className="p-1">TOTAL DU PASSIF</td>
                <td colSpan="3" className="p-1 text-right font-mono">{formatNumber(data.TOTAL)}</td>
            </tr>
        </tbody>
    </table>
);

// --- MODIFIÉ : Le composant accepte maintenant la prop 'dateCloture' ---
const BilanStandardPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { actif, passif } = useMemo(() => genererDonneesBilanComplet(comptes, ecritures), [comptes, ecritures]);
    const isEquilibre = Math.abs(actif.TOTAL - passif.TOTAL) < 0.01;

    // Le contenu du rapport est mis dans un composant interne pour être réutilisé
    const BilanContent = () => (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Bilan Standard</h2>
                {/* --- MODIFIÉ : La date est maintenant dynamique et formatée --- */}
                <p>
                    Au : {dateCloture ? dateCloture.toLocaleDateString('fr-FR') : '[Date non définie]'} - Unité : ARIARY
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BilanActif data={actif} />
                <BilanPassif data={passif} />
            </div>

            <div className={`mt-6 p-4 text-center font-bold text-lg rounded-md ${isEquilibre ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isEquilibre ? `Bilan équilibré : ${formatNumber(actif.TOTAL)}` : `Déséquilibre de : ${formatNumber(actif.TOTAL - passif.TOTAL)}`}
            </div>
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
            
            <BilanContent />
            
            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression - Bilan Standard"
            >
                <BilanContent />
            </PrintPreviewModal>
        </div>
    );
};

export default BilanStandardPage;