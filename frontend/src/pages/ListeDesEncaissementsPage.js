import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

// --- Données Fictives (à remplacer par un appel API) ---
// Note: J'ai ajouté un champ 'payee' pour suivre le statut du paiement.
const mockFactures = [
    { id: 1, numeroFacture: 'FP-2025-001', clientNom: 'Client A SARL', date: '2025-08-20', montant: 1500000, statut: 'Proforma', payee: false },
    { id: 2, numeroFacture: 'FP-2025-002', clientNom: 'Client B Export', date: '2025-08-21', montant: 3250000, statut: 'Soumise', payee: false },
    { id: 3, numeroFacture: 'FD-2025-001', clientNom: 'Client A SARL', date: '2025-08-18', montant: 5000000, statut: 'Définitive', payee: false },
    { id: 4, numeroFacture: 'FD-2025-002', clientNom: 'Client C International', date: '2025-08-22', montant: 850000, statut: 'Définitive', payee: false },
    { id: 5, numeroFacture: 'FD-2025-003', clientNom: 'Client B Export', date: '2025-08-25', montant: 4200000, statut: 'Définitive', payee: true }, // Cette facture est déjà payée
];

const formatCurrency = (val) => `${parseFloat(val || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar`;

const ListeDesEncaissementsPage = ({ setPage }) => {
    // --- États ---
    const [factures, setFactures] = useState(mockFactures);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [factureAPayer, setFactureAPayer] = useState(null);
    
    // --- Données Dérivées ---
    const facturesAEncaisser = useMemo(() => {
        return factures.filter(f => f.statut === 'Définitive' && !f.payee);
    }, [factures]);
    
    const totalCreances = useMemo(() => {
        return facturesAEncaisser.reduce((sum, f) => sum + f.montant, 0);
    }, [facturesAEncaisser]);

    // --- Gestion de la Modale ---
    const handleOpenModal = (facture) => {
        setFactureAPayer(facture);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFactureAPayer(null);
    };
    
    const handlePaiementSubmit = (e) => {
        e.preventDefault();
        // Simulation de la logique
        console.log("--- SIMULATION D'ENREGISTREMENT DE PAIEMENT ---");
        console.log(`Facture N°: ${factureAPayer.numeroFacture}`);
        console.log(`Montant: ${factureAPayer.montant}`);
        console.log("Génération de l'écriture comptable :");
        console.log(`  - DÉBIT: 512... (Compte Bancaire) - ${factureAPayer.montant} Ar`);
        console.log(`  - CRÉDIT: 411... (Client: ${factureAPayer.clientNom}) - ${factureAPayer.montant} Ar`);
        
        // Mettre à jour l'état local pour refléter le paiement
        setFactures(factures.map(f => f.id === factureAPayer.id ? { ...f, payee: true } : f));
        
        alert(`Paiement pour la facture ${factureAPayer.numeroFacture} enregistré avec succès !`);
        handleCloseModal();
    };

    return (
        <div className="p-8">
            <PageHeader title="Encaissements Clients" subtitle="Enregistrez les paiements reçus pour les factures de vente définitives." />

            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => setPage('clients_ventes')} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                    &larr; Retour à Clients & Ventes
                </button>
                <div className="text-right">
                    <p className="text-gray-600">Total des créances en attente :</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCreances)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['N° Facture', 'Client', 'Date', 'Montant Dû', 'Action'].map(h => 
                                <th key={h} className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${h === 'Action' ? 'text-center' : ''}`}>
                                    {h}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facturesAEncaisser.length > 0 ? (
                            facturesAEncaisser.map(facture => (
                                <tr key={facture.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-700">{facture.numeroFacture}</td>
                                    <td className="px-4 py-3 text-gray-600">{facture.clientNom}</td>
                                    <td className="px-4 py-3 text-gray-600">{facture.date}</td>
                                    <td className="px-4 py-3 font-mono text-right text-gray-800">{formatCurrency(facture.montant)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleOpenModal(facture)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600">
                                            Encaisser
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center p-6 text-gray-500">🎉 Toutes les factures définitives sont réglées !</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modale d'enregistrement du paiement */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Encaisser la facture n° ${factureAPayer?.numeroFacture}`}>
                <form onSubmit={handlePaiementSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Montant à recevoir</label>
                        <input type="text" value={formatCurrency(factureAPayer?.montant)} className="mt-1 block w-full p-2 border rounded-md bg-gray-100" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date de l'encaissement</label>
                        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Compte bancaire à créditer</label>
                        <select className="mt-1 block w-full p-2 border rounded-md" required>
                            {/* Dans une vraie app, cette liste viendrait de la BDD */}
                            <option value="512100">512100 - Bank of Africa (B.O.A)</option>
                            <option value="530000">530000 - Caisse</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                        <button type="submit" className="px-4 py-2 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700">Confirmer le Paiement</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ListeDesEncaissementsPage;