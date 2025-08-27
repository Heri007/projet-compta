// Fichier : frontend/src/pages/SuiviExportationPage.js

import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import ProcedureStep from '../components/ProcedureStep';

const SuiviExportationPage = ({ envoiId, envois = [], factures = [], setPage }) => {

    // 1. Isoler l'envoi et les factures concernées
    const { envoi, proforma, definitive } = useMemo(() => {
        const currentEnvoi = envois.find(e => e.id === envoiId);
        if (!currentEnvoi) return { envoi: null, proforma: null, definitive: null };

        const proformaInvoice = factures.find(f => f.envoi_id === envoiId && f.type_facture === 'Proforma');
        const definitiveInvoice = factures.find(f => f.envoi_id === envoiId && f.type_facture === 'Definitive');

        return { envoi: currentEnvoi, proforma: proformaInvoice, definitive: definitiveInvoice };
    }, [envoiId, envois, factures]);

    if (!envoi) {
        return <div className="p-8">Envoi non trouvé.</div>;
    }

    // 2. Définir le statut et l'action pour chaque étape
    const etape1Statut = proforma ? 'Fait' : 'À faire';
    const etape2Statut = definitive ? 'Fait' : (proforma ? 'En cours' : 'À faire');
    // Pour les autres étapes, il faudrait ajouter un champ dans la BDD,
    // pour l'instant on les met en "À faire".

    return (
        <div className="p-8">
            <PageHeader title={`Suivi de l'Exportation : ${envoi.nom}`} subtitle={`Fiche signalétique de la procédure pour l'envoi ID : ${envoi.id}`} />

            <div className="max-w-4xl mx-auto space-y-6 mt-6">
                
                {/* ÉTAPE 1: CONSTATATION */}
                <ProcedureStep numero={1} titre="Demande de Constatation" entite="MINES" statut={etape1Statut}
                    actionLabel="Créer la Facture Proforma"
                    onActionClick={() => setPage('creation_facture')}
                    isDisabled={etape1Statut === 'Fait'}>
                    <ul className="list-disc pl-5">
                        <li>Dossiers Société, Fiche de Déclaration, LP1</li>
                        <li>Paiement : Droit de constatation, Transport agent</li>
                        <li><b>Résultat attendu :</b> Facture Proforma révisée, Fiche de contrôle</li>
                    </ul>
                </ProcedureStep>

                {/* ÉTAPE 2: FACTURE DÉFINITIVE */}
                <ProcedureStep numero={2} titre="Facture Définitive" entite="INTERNE" statut={etape2Statut}
                    actionLabel="Convertir en Facture Définitive"
                    onActionClick={() => setPage(`creation_facture/${proforma.id}`)}
                    isDisabled={!proforma || !!definitive}>
                     <ul className="list-disc pl-5">
                        <li>Utiliser la facture proforma révisée par les Mines</li>
                        <li><b>Résultat attendu :</b> Facture Définitive générée et imprimée</li>
                    </ul>
                </ProcedureStep>

                {/* ÉTAPE 3: DOMICILIATION */}
                <ProcedureStep numero={3} titre="Demande de Domiciliation" entite="FINEX / BANQUE" statut={definitive ? 'En cours' : 'À faire'}
                    actionLabel="Voir la Facture Définitive"
                    onActionClick={() => setPage(`invoice/${definitive.id}`)}
                    isDisabled={!definitive}>
                     <ul className="list-disc pl-5">
                        <li>Soumettre la facture définitive sur le site SIG-OC</li>
                        <li>Paiement : Frais de domiciliation à la banque</li>
                        <li><b>Résultat attendu :</b> Attestation de domiciliation</li>
                    </ul>
                </ProcedureStep>

                {/* ÉTAPE 4: PARAPHE */}
                <ProcedureStep numero={4} titre="Demande de Paraphe" entite="MINES" statut="À faire">
                     <ul className="list-disc pl-5">
                        <li>Soumettre l'attestation de domiciliation et la facture définitive</li>
                        <li><b>Résultat attendu :</b> Fiche de conformité, LP3E paraphé, Décompte des taxes</li>
                    </ul>
                </ProcedureStep>

                {/* ÉTAPE 5: PAIEMENT TAXES */}
                <ProcedureStep numero={5} titre="Paiement des Taxes" entite="TRESOR PUBLIC" statut="À faire"
                    actionLabel="Saisir l'Écriture de Paiement"
                    onActionClick={() => setPage('saisie')}>
                     <ul className="list-disc pl-5">
                        <li>Payer les DTSPM, Droit de poinçonnage, Frais d’Analyse</li>
                        <li><b>Action :</b> Enregistrer la sortie de trésorerie dans le journal de Banque (BQ).</li>
                    </ul>
                </ProcedureStep>

                {/* ÉTAPES 6 & 7 */}
                <ProcedureStep numero={6} titre="PV et Formalités Douanières" entite="MINES / DOUANES / TRANSIT" statut="À faire">
                     <ul className="list-disc pl-5">
                        <li>Procédures de scellage, contrôle et constatation.</li>
                        <li><b>Résultat attendu :</b> Fiche de visite, Certificat de conformité, Visa, Déclaration douanière</li>
                    </ul>
                </ProcedureStep>
                <ProcedureStep numero={7} titre="Embarquement" entite="COMPAGNIE" statut="À faire">
                     <ul className="list-disc pl-5">
                        <li>L'envoi quitte le territoire.</li>
                        <li><b>Action :</b> Mettre à jour le statut de l'envoi à "Expédié".</li>
                    </ul>
                </ProcedureStep>

            </div>
        </div>
    );
};

export default SuiviExportationPage;