// Fichier : frontend/src/components/TauxDeChangeWidget.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WidgetCard from './WidgetCard'; // Assurez-vous que le chemin est correct

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

const TauxDeChangeWidget = () => {
    const [taux, setTaux] = useState({ USD: null, EUR: null });
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchAndSaveRates = async () => {
            try {
                // 1. Essayer de récupérer les taux depuis l'API externe
                const response = await axios.get(EXCHANGE_RATE_API);
                const rates = response.data.rates;
                const ariaryPerUSD = rates['MGA'];
                const euroPerUSD = rates['EUR'];
                const ariaryPerEUR = ariaryPerUSD / euroPerUSD;

                setTaux({ USD: ariaryPerUSD, EUR: ariaryPerEUR });

                // 2. Sauvegarder ces nouveaux taux dans notre BDD
                await axios.post(`${API_URL}/api/taux-de-change`, { date: today, devise: 'USD', valeur: ariaryPerUSD });
                await axios.post(`${API_URL}/api/taux-de-change`, { date: today, devise: 'EUR', valeur: ariaryPerEUR });

            } catch (error) {
                console.warn("API de taux de change externe indisponible. Chargement du dernier taux local.", error);
                // 3. Si l'API externe échoue, charger le dernier taux depuis notre BDD
                try {
                    const { data: dernierTaux } = await axios.get(`${API_URL}/api/taux-de-change/dernier`);
                    setTaux({
                        USD: dernierTaux.USD?.valeur || null,
                        EUR: dernierTaux.EUR?.valeur || null
                    });
                } catch (dbError) {
                    console.error("Impossible de charger les taux depuis la base de données.", dbError);
                    setTaux({ USD: 'Erreur', EUR: 'Erreur' });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAndSaveRates();
    }, [today]);

    const formatTaux = (valeur) => {
        if (loading) return '...';
        if (typeof valeur === 'number') return valeur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return 'N/A';
    };

    return (
        <WidgetCard title="Taux de Change du Jour (MGA)">
            <div className="p-4 space-y-2 text-center h-full flex flex-col justify-center">
                <div className="font-bold text-2xl">
                    1 USD = <span className="text-blue-600">{formatTaux(taux.USD)}</span>
                </div>
                <div className="font-bold text-2xl">
                    1 EUR = <span className="text-green-600">{formatTaux(taux.EUR)}</span>
                </div>
                <p className="text-xs text-gray-400 pt-2">Mis à jour automatiquement</p>
            </div>
        </WidgetCard>
    );
};

export default TauxDeChangeWidget;