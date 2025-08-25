import React from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';

// Ce composant reçoit la date de clôture actuelle et la fonction pour la modifier
const ParametresPage = ({ dateCloture, setDateCloture }) => {

    const handleDateChange = (event) => {
        // Met à jour la date dans l'état parent (App.js)
        // On s'assure que la date est bien au format Date
        setDateCloture(new Date(event.target.value));
    };

    // Pour l'affichage, on formate la date en YYYY-MM-DD
    const datePourInput = dateCloture.toISOString().split('T')[0];

    return (
        <div className="p-8">
            <PageHeader title="Paramètres" subtitle="Configuration de l'application et de l'exercice comptable." />
            
            <div className="max-w-md mx-auto">
                <WidgetCard title="Exercice Comptable">
                    <div className="space-y-2">
                        <label htmlFor="date-cloture" className="block text-sm font-medium text-gray-700">
                            Date de clôture de l'exercice (N)
                        </label>
                        <input
                            type="date"
                            id="date-cloture"
                            value={datePourInput}
                            onChange={handleDateChange}
                            className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-gray-500">
                            Tous les rapports (Bilan, Compte de Résultat...) seront calculés sur la base de cette date.
                            L'exercice N-1 sera automatiquement calculé.
                        </p>
                    </div>
                </WidgetCard>
            </div>
        </div>
    );
};

export default ParametresPage;