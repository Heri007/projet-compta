import React, { useMemo, useState } from 'react';
import { genererDonneesTableauImmobilisations } from '../utils/annexeHelper';
// import PageHeader from '../components/PageHeader'; // Ligne retirée
import PrintPreviewModal from '../components/PrintPreviewModal';

const formatCurrency = (val) => {
    if (val === 0 || !val) return '-';
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
};


// Note 1: Contenu textuel statique
const NotePrincipesComptables = () => (
    <section>
        <h3 className="text-lg font-bold border-b mb-2 pb-1">Note 1 : Règles et méthodes comptables</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
            Les états financiers sont préparés conformément au Plan Comptable Général 2005 de Madagascar.
            Les conventions comptables de base suivantes ont été appliquées : continuité de l'exploitation,
            comptabilité d'exercice et permanence des méthodes. Les actifs sont évalués à leur coût historique.
            Les revenus sont constatés à la livraison et les charges sont enregistrées lorsqu'elles sont encourues.
        </p>
    </section>
);

// Note 2: Tableau quantitatif dynamique
const NoteActifsImmobilises = ({ dataImmobilisations }) => (
    <section className="mt-6">
        <h3 className="text-lg font-bold border-b mb-2 pb-1">Note 2 : Mouvements des Actifs Immobilisés</h3>
        <table className="w-full text-sm">
            <thead className="bg-gray-100">
                <tr className="font-semibold text-gray-700">
                    <td className="p-2 border">Rubriques</td>
                    <td className="p-2 border text-right">Valeur brute à l'ouverture</td>
                    <td className="p-2 border text-right">Augmentations</td>
                    <td className="p-2 border text-right">Diminutions</td>
                    <td className="p-2 border text-right">Valeur brute à la clôture</td>
                </tr>
            </thead>
            <tbody>
                <tr className="hover:bg-gray-50">
                    <td className="p-2 border font-semibold">Total Immobilisations</td>
                    <td className="p-2 border text-right font-mono">{formatCurrency(dataImmobilisations.brutDebut)}</td>
                    <td className="p-2 border text-right font-mono">{formatCurrency(dataImmobilisations.augmentations)}</td>
                    <td className="p-2 border text-right font-mono">{formatCurrency(dataImmobilisations.diminutions)}</td>
                    <td className="p-2 border text-right font-mono font-bold">{formatCurrency(dataImmobilisations.brutFin)}</td>
                </tr>
            </tbody>
        </table>
    </section>
);


const AnnexePage = ({ ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const dataImmobilisations = useMemo(() => genererDonneesTableauImmobilisations(ecritures, dateCloture), [ecritures, dateCloture]);

    const AnnexeContent = () => (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Annexe aux États Financiers</h2>
                <p>Exercice clos le {dateCloture.toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="space-y-6">
                <NotePrincipesComptables />
                <NoteActifsImmobilises dataImmobilisations={dataImmobilisations} />
                {/* D'autres notes viendront s'ajouter ici... */}
            </div>
        </>
    );

    return (
        <div className="p-8 h-full overflow-y-auto bg-white">
             <div className="flex justify-end mb-4">
                <button 
                    onClick={() => setIsPreviewOpen(true)} 
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transform transition"
                >
                    🖨️ Imprimer / Aperçu
                </button>
            </div>
            <AnnexeContent />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Annexe aux États Financiers">
                <AnnexeContent />
            </PrintPreviewModal>
        </div>
    );
};

export default AnnexePage;