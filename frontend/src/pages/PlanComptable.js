import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { FormulaireCompte } from '../components/Formulaires';

const PlanComptable = ({ comptes, refreshData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8">
            <PageHeader title="Plan Comptable" subtitle="Gestion du plan comptable de l'entreprise" />
            <div className="mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 transform transition"
                >
                    ➕ Nouveau Compte
                </button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un Nouveau Compte">
                <FormulaireCompte onClose={() => setIsModalOpen(false)} refreshData={refreshData} />
            </Modal>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                        <tr>
                            {['Numéro', 'Libellé', 'Classe'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {comptes.map(c => (
                            <tr key={c.numero_compte} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{c.numero_compte}</td>
                                <td className="px-4 py-2">{c.libelle}</td>
                                <td className="px-4 py-2">{c.classe}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlanComptable;