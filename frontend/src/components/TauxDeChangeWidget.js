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
                const response = await axios.get(EXCHANGE_RATE_API);
                const rates = response.data.rates;
                const ariaryPerUSD = rates['MGA'];
                const euroPerUSD = rates['EUR'];
                const ariaryPerEUR = ariaryPerUSD / euroPerUSD;

                setTaux({ USD: ariaryPerUSD, EUR: ariaryPerEUR });

                await axios.post(`${API_URL}/api/taux-de-change`, { date: today, devise: 'USD', valeur: ariaryPerUSD });
                await axios.post(`${API_URL}/api/taux-de-change`, { date: today, devise: 'EUR', valeur: ariaryPerEUR });

            } catch (error) {
                console.warn("API de taux de change externe indisponible. Chargement du dernier taux local.", error);
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
            {/* --- SECTION CORRIGÉE POUR UN MEILLEUR CONTRASTE --- */}
            <div className="relative h-full flex flex-col justify-center text-center rounded-b-lg overflow-hidden">
                
                {/* Couche pour l'image de fond (inchangée) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/change.webp')" }}
                ></div>

                {/* CORRECTION 1 : Superposition plus sombre pour le contraste */}
                {/* On passe de bg-black/30 à bg-black/60 */}
                <div className="absolute inset-0 bg-black/60"></div> 
                
                {/* CORRECTION 2 : Contenu textuel avec un style amélioré */}
                <div className="relative z-10 p-4 text-white">
                    <div className="text-3xl font-extrabold drop-shadow-lg">
                        <span className="opacity-80">1 USD = </span>
                        <span className="text-cyan-300">{formatTaux(taux.USD)}</span>
                    </div>
                    <div className="text-3xl font-extrabold drop-shadow-lg mt-1">
                        <span className="opacity-80">1 EUR = </span>
                        <span className="text-emerald-300">{formatTaux(taux.EUR)}</span>
                    </div>
                    <p className="text-xs text-gray-300 pt-3 drop-shadow-lg">Mis à jour automatiquement</p>
                </div>
            </div>
        </WidgetCard>
    );
};

export default TauxDeChangeWidget;