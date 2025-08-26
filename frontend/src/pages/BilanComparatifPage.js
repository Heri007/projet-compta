import React, { useState, useMemo } from 'react';
import { genererDonneesBilanComparatif } from '../utils/bilanHelperN1';
import PrintPreviewModal from '../components/PrintPreviewModal'; // Import de la modale d'impression
import { formatNumber } from '../utils/formatUtils'; 

const BilanRow = ({ libelle, montantN, montantN1, isTotal = false, isSubTotal = false, indent = false }) => (
    <tr className={isTotal ? "bg-gray-200 font-bold" : isSubTotal ? "bg-gray-100 font-semibold" : "border-b hover:bg-blue-50"}>
        <td className={`p-1 ${indent ? 'pl-8' : ''}`}>{libelle}</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantN)}</td>
        <td className="p-1 text-right font-mono bg-gray-50">#VALUE!</td>
        <td className="p-1 text-right font-mono">{formatNumber(montantN)}</td>
        <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(montantN1)}</td>
    </tr>
);

const BilanActif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-2/5">ACTIF</th>
                <th className="p-1 text-right">Montant brut</th>
                <th className="p-1 text-right">Amort. ou Prov.</th>
                <th className="p-1 text-right">Montant net (N)</th>
                <th className="p-1 text-right">Montant net (N-1)</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse.startsWith('TOTAL')) return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="5" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                <tr><td colSpan="5" className="p-1 font-semibold italic">{sousMasse}</td></tr>
                                {sousData.lignes.map(ligne => <BilanRow key={ligne.libelle} libelle={ligne.libelle} montantN={ligne.montantBrutN} montantN1={ligne.montantBrutN1} indent={true} />)}
                                <BilanRow libelle={`Total ${sousMasse}`} montantN={sousData.totalN} montantN1={sousData.totalN1} isSubTotal={true} />
                            </React.Fragment>
                        ))}
                        <BilanRow libelle={`TOTAL DE L'${grandeMasse}`} montantN={grandeMasseData.totalN} montantN1={grandeMasseData.totalN1} isTotal={true} />
                    </React.Fragment>
                );
            })}
            <BilanRow libelle="TOTAL DE L'ACTIF" montantN={data.TOTAL_N} montantN1={data.TOTAL_N1} isTotal={true} />
        </tbody>
    </table>
);

const BilanPassif = ({ data }) => (
    <table className="w-full text-sm">
        <thead>
            <tr className="border-b-2 border-black">
                <th className="p-1 text-left w-2/3">PASSIF</th>
                <th className="p-1 text-right">Exercice (N)</th>
                <th className="p-1 text-right">Exercice (N-1)</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([grandeMasse, grandeMasseData]) => {
                if (grandeMasse.startsWith('TOTAL')) return null;
                return (
                    <React.Fragment key={grandeMasse}>
                        <tr className="bg-gray-800 text-white font-bold"><td colSpan="3" className="p-1">{grandeMasse}</td></tr>
                        {Object.entries(grandeMasseData.sous_masses).map(([sousMasse, sousData]) => (
                            <React.Fragment key={sousMasse}>
                                {sousData.lignes.map(ligne => (
                                    <tr key={ligne.libelle} className="border-b hover:bg-purple-50">
                                        <td className="p-1 pl-8">{ligne.libelle}</td>
                                        <td className="p-1 text-right font-mono">{formatNumber(ligne.montantBrutN)}</td>
                                        <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(ligne.montantBrutN1)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold">
                                    <td className="p-1">{`Total ${sousMasse}`}</td>
                                    <td className="p-1 text-right font-mono">{formatNumber(sousData.totalN)}</td>
                                    <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(sousData.totalN1)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            })}
            <tr className="bg-gray-200 font-bold">
                <td className="p-1">TOTAL DU PASSIF</td>
                <td className="p-1 text-right font-mono">{formatNumber(data.TOTAL_N)}</td>
                <td className="p-1 text-right font-mono border-l border-gray-300">{formatNumber(data.TOTAL_N1)}</td>
            </tr>
        </tbody>
    </table>
);

const BilanComparatifPage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { actif, passif } = useMemo(() => genererDonneesBilanComparatif(comptes, ecritures, dateCloture), [comptes, ecritures, dateCloture]);
    const isEquilibreN = Math.abs(actif.TOTAL_N - passif.TOTAL_N) < 0.01;
    const isEquilibreN1 = Math.abs(actif.TOTAL_N1 - passif.TOTAL_N1) < 0.01;

    const BilanContent = () => (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Bilan Comparatif</h2>
                <p>Au : {dateCloture.toLocaleDateString('fr-FR')} - Unité : ARIARY</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BilanActif data={actif} />
                <BilanPassif data={passif} />
            </div>
            <div className={`mt-6 p-4 text-center font-bold text-lg rounded-md ${isEquilibreN && isEquilibreN1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isEquilibreN && isEquilibreN1 ? `Bilans équilibrés` : `Déséquilibre détecté`}
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
                title="Aperçu avant impression - Bilan Comparatif"
            >
                <BilanContent />
            </PrintPreviewModal>
        </div>
    );
};

export default BilanComparatifPage;