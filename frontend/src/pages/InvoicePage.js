import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InvoicePreview from '../components/InvoicePreview';

const InvoicePage = ({ factureId }) => {
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("factureId reçu :", factureId);
    if (!factureId) return;
  
    const fetchFacture = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3001/api/factures/${factureId}`);
        console.log(res.data); // → vérifier que res.data.lignes contient les produits
        setFacture(res.data);
      } catch (err) {
        console.error('Erreur récupération facture :', err);
        setError('Impossible de récupérer la facture.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchFacture();
  }, [factureId]);

  if (loading) return <p className="p-8">Chargement de la facture...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;
  if (!facture) return <p className="p-8 text-gray-500">Aucune facture trouvée.</p>;

  return <InvoicePreview facture={facture} />;
};

export default InvoicePage;
