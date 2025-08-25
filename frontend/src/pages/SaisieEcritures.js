import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { ModalSelectionCompte } from '../components/ModalSelectionCompte';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const SaisieEcritures = ({ journaux, planComptable, setPage, refreshData, ecritureToEdit, clearEcritureToEdit }) => {
    const isEditMode = Boolean(ecritureToEdit);

    const [lignes, setLignes] = useState([{ id: Date.now(), compte: '', libelle: '', debit: '', credit: '' }]);
    const [journal, setJournal] = useState(journaux[0]?.code || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [numeroPiece, setNumeroPiece] = useState('');
    const [libelleOperation, setLibelleOperation] = useState('');
    const [message, setMessage] = useState(null);
    const [modalPourLigneId, setModalPourLigneId] = useState(null);

    // État pour le numéro de pièce généré automatiquement
    const [numeroPieceGenere, setNumeroPieceGenere] = useState('');

    // Pré-remplissage si mode édition
    useEffect(() => {
        if (isEditMode && ecritureToEdit && ecritureToEdit.length > 0) {
            const header = ecritureToEdit[0];
            setJournal(header.journal_code);
            setDate(new Date(header.date).toISOString().split('T')[0]);
            setNumeroPiece(header.numero_piece || '');
            setLibelleOperation(header.libelle_operation);

            setLignes(ecritureToEdit.map(ligne => ({
                id: ligne.id,
                compte: ligne.compte_general,
                libelle: ligne.libelle_ligne,
                debit: parseFloat(ligne.debit) > 0 ? ligne.debit : '',
                credit: parseFloat(ligne.credit) > 0 ? ligne.credit : '',
            })));
        }
        return () => { if (clearEcritureToEdit) clearEcritureToEdit(); };
    }, [ecritureToEdit, clearEcritureToEdit, isEditMode]);

    // Totaux et équilibre
    const totalDebit = lignes.reduce((s, li) => s + (parseFloat(li.debit) || 0), 0);
    const totalCredit = lignes.reduce((s, li) => s + (parseFloat(li.credit) || 0), 0);
    const isEquilibre = Math.abs(totalDebit - totalCredit) < 0.01;

    // Gestion des champs
    const handleLigneChange = (id, field, value) => {
        setLignes(lignes.map(li => {
            if (li.id === id) {
                const updatedLigne = { ...li, [field]: value };
                if (field === 'debit' && value) updatedLigne.credit = '';
                if (field === 'credit' && value) updatedLigne.debit = '';
                return updatedLigne;
            }
            return li;
        }));
    };

    const handleCompteSelect = (compte) => {
        if (modalPourLigneId) handleLigneChange(modalPourLigneId, 'compte', compte.numero_compte);
        setModalPourLigneId(null);
    };

    const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), compte: '', libelle: libelleOperation, debit: '', credit: '' }]);
    const supprimerLigne = (id) => setLignes(lignes.filter(li => li.id !== id));

    // Préparer lignes pour envoi (transforme '' en 0)
    const sanitizedLignes = lignes.map(({ id, debit, credit, ...l }) => ({
        ...l,
        debit: parseFloat(debit) || 0,
        credit: parseFloat(credit) || 0
    }));

    // Effet pour générer automatiquement le numéro de pièce
    useEffect(() => {
        if (!journal || !date) {
            setNumeroPieceGenere('');
            return;
        }
        const annee = date.substring(0, 4);
        const mois = date.substring(5, 7);

        let prefixe = '';
        if (journal === 'VT') {
            prefixe = 'FACT';
        } else if (journal === 'BQ') {
            setNumeroPieceGenere('');
            return;
        } else if (journal === 'CA') {
            prefixe = 'RC';
        } else {
            setNumeroPieceGenere('');
            return;
        }

        const numeroPieceBase = `${prefixe}_${annee}_${mois}_`;

        const fetchLastNumeroPiece = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/ecritures/last_numero_piece?journal_code=${journal}&annee=${annee}&mois=${mois}`);
                const lastNumeroPiece = response.data;
                let numero = 1;
                if (lastNumeroPiece) {
                    const match = lastNumeroPiece.match(/_(\d+)$/);
                    if (match) numero = parseInt(match[1], 10) + 1;
                }
                setNumeroPieceGenere(numeroPieceBase + String(numero).padStart(4, '0'));
            } catch (error) {
                console.error("Erreur récupération dernier numéro:", error);
                setNumeroPieceGenere(numeroPieceBase + "0001");
            }
        };

        fetchLastNumeroPiece();
    }, [journal, date]);

    // Enregistrement ou mise à jour
    const handleSubmit = async () => {
        if (!isEquilibre) {
            setMessage({ type: 'error', text: 'Une écriture doit être équilibrée.' });
            return;
        }
        if (lignes.length > 0 && totalDebit === 0) {
            setMessage({ type: 'error', text: 'Une écriture ne peut pas avoir un total de zéro.' });
            return;
        }
        if (!journal) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner un journal.' });
            return;
        }

        const numeroPieceAEnvoyer = (journal === 'BQ') ? numeroPiece : numeroPieceGenere;

        try {
            if (isEditMode) {
                if (numeroPiece) {
                    const payload = { journal_code: journal, date, libelleOperation, lignes: sanitizedLignes };
                    await axios.put(`${API_URL}/api/ecritures/piece/${numeroPiece}`, payload);
                    setMessage({ type: 'success', text: 'Pièce mise à jour avec succès !' });
                } else {
                    const ligne = sanitizedLignes[0];
                    const payload = { journal_code: journal, date, libelleOperation, ligne };
                    await axios.put(`${API_URL}/api/ecritures/${lignes[0].id}`, payload);
                    setMessage({ type: 'success', text: 'Ligne mise à jour avec succès !' });
                }
            } else {
                const payload = { journal_code: journal, date, numero_piece: numeroPieceAEnvoyer, libelleOperation, lignes: sanitizedLignes };
                await axios.post(`${API_URL}/api/ecritures`, payload);
                setMessage({ type: 'success', text: 'Écriture enregistrée avec succès !' });
            }

            await refreshData();
            if (clearEcritureToEdit) clearEcritureToEdit();
            setTimeout(() => setPage('ecritures'), 1500);

        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            setMessage({ type: 'error', text: err.response?.data?.details || 'Erreur lors de la sauvegarde.' });
        }
    };

    return (
        <div className="p-8">
            <PageHeader
                title={isEditMode ? `Modification d'écriture` : "Saisie d'une Écriture"}
                subtitle={isEditMode ? `Pièce n° ${numeroPiece || `(ligne unique)`}` : "Créez une nouvelle pièce comptable"}
            />
            {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                {/* Infos en-tête */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Journal</label>
                        <select
                            value={journal}
                            onChange={e => setJournal(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                        >
                            <option value="">Sélectionner un journal</option>
                            {journaux.map(j => (
                                <option key={j.code} value={j.code}>{j.code} - {j.libelle}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">N° de Pièce</label>
                        {journal === 'BQ' ? (
                            <input
                                type="text"
                                value={numeroPiece}
                                onChange={e => setNumeroPiece(e.target.value)}
                                placeholder="CHQ-001"
                                className="mt-1 block w-full p-2 border rounded-md"
                            />
                        ) : (
                            <input
                                type="text"
                                value={numeroPieceGenere}
                                readOnly
                                className="mt-1 block w-full p-2 border rounded-md bg-gray-100"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Libellé Opération</label>
                        <input
                            type="text"
                            value={libelleOperation}
                            onChange={e => setLibelleOperation(e.target.value)}
                            placeholder="Achat de marchandises..."
                            className="mt-1 block w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* Table des lignes */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left w-2/5">Compte</th>
                                <th className="px-3 py-2 text-left w-2/5">Libellé Ligne</th>
                                <th className="px-3 py-2 text-right">Débit</th>
                                <th className="px-3 py-2 text-right">Crédit</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lignes.map(li => (
                                <tr key={li.id}>
                                    <td className="py-2 px-1">
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={li.compte}
                                                onChange={e => handleLigneChange(li.id, 'compte', e.target.value)}
                                                className="w-full p-1 border rounded-l-md"
                                                placeholder="N° Compte..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setModalPourLigneId(li.id)}
                                                className="p-2 bg-gray-200 border-t border-b border-r rounded-r-md hover:bg-gray-300"
                                            >
                                                🔍
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            value={li.libelle}
                                            onChange={e => handleLigneChange(li.id, 'libelle', e.target.value)}
                                            className="w-full p-1 border rounded"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="number"
                                            value={li.debit}
                                            onChange={e => handleLigneChange(li.id, 'debit', e.target.value)}
                                            className="w-full p-1 border rounded text-right"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="number"
                                            value={li.credit}
                                            onChange={e => handleLigneChange(li.id, 'credit', e.target.value)}
                                            className="w-full p-1 border rounded text-right"
                                        />
                                    </td>
                                    <td className="py-2 px-1 text-center">
                                        <button
                                            onClick={() => supprimerLigne(li.id)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={ajouterLigne}
                    className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    + Ajouter une ligne
                </button>

                {/* Totaux + bouton valider */}
                <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-md">
                    <div className="flex space-x-6 font-mono text-sm">
                        <span>Débit: {totalDebit.toFixed(2)}</span>
                        <span>Crédit: {totalCredit.toFixed(2)}</span>
                        <span className={!isEquilibre ? 'text-red-600' : 'text-green-600'}>
                            Balance: {(totalDebit - totalCredit).toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!isEquilibre || totalDebit === 0}
                        className={`px-6 py-3 font-bold text-white rounded-md transition-colors ${
                            isEquilibre && totalDebit > 0
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isEditMode ? "Enregistrer les modifications" : "Valider l'écriture"}
                    </button>
                </div>
            </div>

            {/* Sélection du compte */}
            <ModalSelectionCompte
                isOpen={modalPourLigneId !== null}
                onClose={() => setModalPourLigneId(null)}
                planComptable={planComptable}
                onSelect={handleCompteSelect}
            />
        </div>
    );
};

export default SaisieEcritures;
