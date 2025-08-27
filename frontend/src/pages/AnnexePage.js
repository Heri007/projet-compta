import React, { useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { genererDonneesTableauImmobilisations } from '../utils/annexeHelper';
import PrintPreviewModal from '../components/PrintPreviewModal';
import ReportToolbar from '../components/reporting/ReportToolbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const formatCurrency = (val) => {
    if (val === 0 || !val) return '-';
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
};

// --- SOUS-COMPOSANTS (inchangés) ---
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


// --- COMPOSANT PRINCIPAL (corrigé) ---
const AnnexePage = ({ comptes, ecritures, dateCloture }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const reportContentRef = useRef(null);
    
    // Ajout d'une vérification : on ne calcule que si les données sont prêtes
    const dataImmobilisations = useMemo(() => {
        if (!ecritures || !dateCloture) return {}; // Retourne un objet vide si les données sont absentes
        return genererDonneesTableauImmobilisations(ecritures, dateCloture);
    }, [ecritures, dateCloture]);

    const handleArchive = async () => {
        if (!reportContentRef.current) return;
        
        const reportHtml = reportContentRef.current.innerHTML;
        const reportTitle = `Annexe aux États Financiers au ${dateCloture.toLocaleDateString('fr-FR')}`;

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

    const AnnexeContent = () => (
        // Le commentaire a été retiré, le code est maintenant valide
        <div ref={reportContentRef}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Annexe aux États Financiers</h2>
                <p>Exercice clos le {dateCloture ? dateCloture.toLocaleDateString('fr-FR') : '...'}</p>
            </div>
            <div className="space-y-6">
                <NotePrincipesComptables />
                <NoteActifsImmobilises dataImmobilisations={dataImmobilisations} />
            </div>
        </div>
    );

    return (
        <div className="p-8 h-full overflow-y-auto bg-white">
            <ReportToolbar 
                onPrintClick={() => setIsPreviewOpen(true)}
                onArchiveClick={handleArchive}
                isArchiving={isArchiving}
            />

            <AnnexeContent />
            
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu - Annexe aux États Financiers">
                <AnnexeContent />
            </PrintPreviewModal>
        </div>
    );
};

export default AnnexePage;