import React, { useState, useMemo } from 'react';
import { genererDonneesBilanComplet } from '../utils/bilanHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { formatNumber } from '../utils/formatUtils'; 

// --- ACTIF ---
const BilanActifRow = ({ libelle, montantBrut, amortissements, montantNet, isTotal = false, isSubTotal = false, indent = false }) => (
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
                                {sousData.lignes.map(ligne => <BilanActifRow key={ligne.libelle} {...ligne} indent={true} />)}
                                <BilanActifRow libelle={`Total ${sousMasse}`} montantBrut={sousData.totalBrut} amortissements={sousData.totalAmort} montantNet={sousData.totalNet} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        <BilanActifRow libelle={`TOTAL DE L'${grandeMasse}`} montantBrut={grandeMasseData.totalBrut} amortissements={grandeMasseData.totalAmort} montantNet={grandeMasseData.totalNet} isTotal={true} />
                    </React.Fragment>
                );
            })}
            <BilanActifRow libelle="TOTAL DE L'ACTIF" montantBrut={data.TOTAL.totalBrut} amortissements={data.TOTAL.totalAmort} montantNet={data.TOTAL.totalNet} isTotal={true} />
        </tbody>
    </table>
);


// --- PASSIF (CORRIGÉ) ---
const BilanPassifRow = ({ libelle, montantNet, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-purple-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantNet)}</td>
    </tr>
);

const BilanPassif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-2/3">PASSIF</th>
                <th className="p-1 text-right">Montant net</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse === 'TOTAL') return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="2" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                {/* Les lignes de détail n'ont pas de titre de sous-masse au passif */}
                                {sousData.lignes.map(ligne => <BilanPassifRow key={ligne.libelle} libelle={ligne.libelle} montantNet={ligne.montantNet} indent={true} />)}
                                <BilanPassifRow libelle={`Total ${sousMasse}`} montantNet={sousData.totalNet} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        {/* Le total de la grande masse n'est généralement pas affiché au passif, mais on le garde pour la cohérence si besoin */}
                        {/* <BilanPassifRow libelle={`TOTAL ${grandeMasse}`} montantNet={grandeMasseData.totalNet} isTotal={true} /> */}
                    </React.Fragment>
                );
            })}
            <BilanPassifRow libelle="TOTAL DU PASSIF" montantNet={data.TOTAL.totalNet} isTotal={true} />
        </tbody>
    </table>
);

// --- COMPOSANT PRINCIPAL (inchangé) ---
const BilanStandardPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Votre helper `genererDonneesBilanComplet` doit être mis à jour pour que data.TOTAL.totalNet existe.
    const { actif, passif } = useMemo(() => genererDonneesBilanComplet(comptes, ecritures), [comptes, ecritures]);
    const isEquilibre = Math.abs(actif.TOTAL.totalNet - passif.TOTAL.totalNet) < 0.01;

    const BilanContent = () => (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Bilan Standard</h2>
                <p>Au : {dateCloture ? dateCloture.toLocaleDateString('fr-FR') : '[Date non définie]'} - Unité : ARIARY</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BilanActif data={actif} />
                <BilanPassif data={passif} />
            </div>

            <div className={`mt-6 p-4 text-center font-bold text-lg rounded-md ${isEquilibre ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isEquilibre ? `Bilan équilibré : ${formatNumber(actif.TOTAL.totalNet)}` : `Déséquilibre de : ${formatNumber(actif.TOTAL.totalNet - passif.TOTAL.totalNet)}`}
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