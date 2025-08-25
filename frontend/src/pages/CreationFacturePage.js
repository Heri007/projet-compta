import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import PrintPreviewModal from '../components/PrintPreviewModal';
import axios from 'axios';
import InvoicePreview from '../components/InvoicePreview';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- PAGE PRINCIPALE MISE À JOUR ---
const CreationFacturePage = ({ tiers, setPage, factureIdToConvert, refreshData, envois = [], articles = [] }) => {  const isConversionMode = Boolean(factureIdToConvert);
  const clients = useMemo(() => tiers.filter(t => t.type === 'Client'), [tiers]);
  
  // États du formulaire
  const [factureOriginale, setFactureOriginale] = useState(null);
  const [clientCode, setClientCode] = useState('');
  const [envoiSelectionne, setEnvoiSelectionne] = useState('');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [natureProduit, setNatureProduit] = useState('PIERRES INDUSTRIELLES BRUTES');
  const [paysOrigine, setPaysOrigine] = useState('MADAGASCAR');
  const [compagnieMaritime, setCompagnieMaritime] = useState('');
  const [portEmbarquement, setPortEmbarquement] = useState('MAHAJANGA');
  const [nomenclatureDouaniere, setNomenclatureDouaniere] = useState('');
  const [domiciliation, setDomiciliation] = useState('');
  const [poidsBrut, setPoidsBrut] = useState(0);
  const [tare, setTare] = useState(0);
  const [lignes, setLignes] = useState([{ id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const [numeroFacture, setNumeroFacture] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // --- NOUVEAU useEffect pour charger les données de la facture à convertir ---
  useEffect(() => {
    if (isConversionMode) {
      const fetchFactureToConvert = async () => {
        try {
          console.log(`CreationFacturePage: Chargement de la facture ID ${factureIdToConvert}`);
          const response = await axios.get(`${API_URL}/api/factures/${factureIdToConvert}`);
          const factureData = response.data;
          setFactureOriginale(factureData);
  
          // Pré-remplissage du formulaire avec les données de la proforma
          setClientCode(factureData.code_tiers || '');
          setDateFacture(new Date().toISOString().split('T')[0]); // date = aujourd’hui
          setNumeroFacture(
            factureData.numero_facture
              ? factureData.numero_facture.replace('FP-', 'FD-') // conversion FP → FD
              : ''
          );
  
          // Champs "détails d’exportation"
          setNatureProduit(factureData.nature_produit || factureData.libelle || '');
          setPaysOrigine(factureData.pays_origine || 'MADAGASCAR');
          setCompagnieMaritime(factureData.compagnie_maritime || '');
          setPortEmbarquement(factureData.port_embarquement || 'MAHAJANGA');
          setNomenclatureDouaniere(factureData.nomenclature_douaniere || '');
          setDomiciliation(factureData.domiciliation || '');
  
          // Poids
          setPoidsBrut(factureData.poids_brut || 0);
          setTare(factureData.tare || 0);
  
          // Lignes de facture (désignation incluse)
          setLignes(
            factureData.lignes && factureData.lignes.length > 0
              ? factureData.lignes
              : [{ id: Date.now(), description: '', quantite: 1, prix: 0 }]
          );
  
          // Envoi lié
          setEnvoiSelectionne(factureData.envoi_id || '');
  
        } catch (err) {
          console.error("Erreur lors du chargement de la facture à convertir:", err);
          alert("Impossible de charger les données de la facture Proforma.");
          setPage('liste_ventes');
        }
      };
      
      fetchFactureToConvert();
    }
  }, [factureIdToConvert, isConversionMode, setPage]);
  
// --- NOUVEAU : useEffect pour mettre à jour la ligne de facture quand l'envoi change ---
  useEffect(() => {
    // Ne s'applique qu'en mode création
    if (isConversionMode) return;

    if (envoiSelectionne) {
      // Trouver l'objet "envoi" complet à partir de son ID
      const envoi = envois.find(e => e.id === envoiSelectionne);
      if (envoi) {
        // Mettre à jour la première ligne de la facture
        setLignes(prevLignes => {
          const nouvellesLignes = [...prevLignes];
          // On ne modifie que la première ligne et seulement si sa description est vide
          if (nouvellesLignes.length > 0 && nouvellesLignes[0].description === '') {
            nouvellesLignes[0].description = envoi.designation || ''; // Utilise la désignation de l'article de l'envoi
          }
          return nouvellesLignes;
        });
      }
    } else {
      // Si aucun envoi n'est sélectionné, on vide la description de la première ligne
      setLignes([{ id: Date.now(), description: '', quantite: 1, prix: 0 }]);
    }
  }, [envoiSelectionne, isConversionMode, envois]);

  const client = useMemo(() => clients.find(c => c.code === clientCode), [clients, clientCode]);
  const poidsNet = useMemo(() => parseFloat(poidsBrut || 0) - parseFloat(tare || 0), [poidsBrut, tare]);
  const totalFOB = useMemo(() => lignes.reduce((sum, l) => sum + (l.quantite * l.prix || 0), 0), [lignes]);

  const handleLigneChange = (id, field, value) => setLignes(lignes.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const supprimerLigne = id => setLignes(lignes.filter(l => l.id !== id));

  // --- HANDLESUBMIT ENTIÈREMENT CORRIGÉ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client) return alert("Veuillez sélectionner un client.");
  
    try {
      if (isConversionMode) {
        if (!factureOriginale) return alert("Les données de la facture originale n'ont pas pu être chargées.");
  
        // --- Conversion Proforma → Définitive ---
        await axios.post(`${API_URL}/api/factures/${factureOriginale.id}/convertir`);
        
        alert("✅ Facture définitive créée avec succès !");
        
      } else {
        // --- CRÉATION DE PROFORMA AVEC LES BONNES DONNÉES ---
        if (!envoiSelectionne) return alert('Veuillez sélectionner un envoi.');
        
        const factureData = {
          code_tiers: clientCode,
          libelle: natureProduit,
          montant: totalFOB,
          type_facture: 'Proforma',
          date_facture: dateFacture,
          envoi_id: envoiSelectionne,
          lignes: lignes,
          // Ajouter les autres champs du formulaire
          nature_produit: natureProduit,
          pays_origine: paysOrigine,
          compagnie_maritime: compagnieMaritime,
          port_embarquement: portEmbarquement,
          nomenclature_douaniere: nomenclatureDouaniere,
          domiciliation: domiciliation,
          poids_brut: poidsBrut,
          tare: tare,
        };
        
        console.log("Envoi des données de la facture Proforma:", factureData);
        await axios.post(`${API_URL}/api/factures`, factureData);
        alert("✅ Facture Proforma enregistrée avec succès !");
      }
  
      await refreshData();
      setPage('liste_ventes');
  
    } catch (err) {
      console.error("Erreur détaillée lors de la sauvegarde :", err.response?.data || err.message);
      alert(err.response?.data?.error || "Une erreur est survenue lors de la sauvegarde.");
    }
  };
  
  const previewData = {
    isConversionMode,
    client,
    numeroFacture: numeroFacture || (isConversionMode ? factureOriginale?.numero_facture.replace('FP-','FD-') : 'Généré par le système'),
    dateFacture,
    natureProduit,
    paysOrigine,
    compagnieMaritime,
    portEmbarquement,
    nomenclatureDouaniere,
    lignes,
    domiciliation,
    poidsBrut,
    tare,
    poidsNet,
  };

  return (
    <div className="p-8">
      <PageHeader title={isConversionMode ? 'Convertir en Facture Définitive' : "Création d'une Facture Proforma"} />
      <div className="flex justify-end mb-4">
        <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">🖨️ Imprimer / Aperçu</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="bg-[#b0e5eb] p-6 rounded-xl shadow-md">
          
          {/* Section Informations Générales */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Informations Générales</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <select value={clientCode} onChange={e => setClientCode(e.target.value)} required className="w-full border p-2 rounded">
                <option value="">-- Sélectionner un client --</option>
                {clients.map(c => <option key={c.code} value={c.code}>{c.nom} ({c.code})</option>)}
              </select>
            </div>
            {!isConversionMode && (
              <div>
                <label className="block text-sm font-medium mb-1">Associer à un Envoi</label>
                <select 
                  value={envoiSelectionne} 
                  onChange={e => setEnvoiSelectionne(e.target.value)} 
                  required 
                  className="w-full border p-2 rounded"
                >
                  <option value="">-- Sélectionner un envoi --</option>
                  {/* Filtrer les envois pour ne montrer que ceux du client sélectionné */}
                  {envois
                    .filter(envoi => envoi.client_code === clientCode)
                    .map(envoi => (
                      <option key={envoi.id} value={envoi.id}>
                        {envoi.nom} ({envoi.id})
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Date de la Facture</label>
              <input type="date" value={dateFacture} onChange={e => setDateFacture(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">N° Facture</label>
              <input type="text" value={numeroFacture || 'Généré après enregistrement'} className="w-full border p-2 rounded bg-gray-100 font-mono" readOnly />
            </div>
          </div>
          
          {/* --- SECTION DÉTAILS DE L'EXPORTATION (CHAMPS AJOUTÉS) --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Détails de l'Exportation</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Nature du Produit</label>
              <input type="text" value={natureProduit} onChange={e => setNatureProduit(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pays d'Origine</label>
              <input type="text" value={paysOrigine} onChange={e => setPaysOrigine(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compagnie Maritime</label>
              <input type="text" value={compagnieMaritime} onChange={e => setCompagnieMaritime(e.target.value)} placeholder="Ex: MSC, Maersk" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Port d'Embarquement</label>
              <input type="text" value={portEmbarquement} onChange={e => setPortEmbarquement(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomenclature Douanière</label>
              <input type="text" value={nomenclatureDouaniere} onChange={e => setNomenclatureDouaniere(e.target.value)} placeholder="Code SH" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domiciliation</label>
              <input type="text" value={domiciliation} onChange={e => setDomiciliation(e.target.value)} placeholder="N° et date" className="w-full border p-2 rounded" />
            </div>
          </div>

          {/* --- SECTION POIDS --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Poids (en Kg)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Poids Brut</label>
                <input type="number" step="any" min="0" value={poidsBrut} onChange={e => setPoidsBrut(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tare</label>
                <input type="number" step="any" min="0" value={tare} onChange={e => setTare(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Poids Net</label>
                <input type="text" value={poidsNet.toLocaleString('fr-FR')} readOnly className="w-full border p-2 rounded bg-gray-100" />
              </div>
            </div>
          </div>

          {/* --- SECTION LIGNES DE FACTURE --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Lignes de la Facture</h3>
            {lignes.map(ligne => (
              <div key={ligne.id} className="grid grid-cols-[1fr_80px_120px_40px] gap-2 items-center">
                <input type="text" value={ligne.description} onChange={e => handleLigneChange(ligne.id, 'description', e.target.value)} placeholder="Désignation" required className="border p-2 rounded" />
                <input type="number" step="any" min="0" value={ligne.quantite} onChange={e => handleLigneChange(ligne.id, 'quantite', parseFloat(e.target.value))} placeholder="Qté" className="border p-2 rounded text-right" />
                <input type="number" step="any" min="0" value={ligne.prix} onChange={e => handleLigneChange(ligne.id, 'prix', parseFloat(e.target.value))} placeholder="Prix" className="border p-2 rounded text-right" />
                <button type="button" onClick={() => supprimerLigne(ligne.id)} className="text-red-500 font-bold text-xl">×</button>
              </div>
            ))}
            <button type="button" onClick={ajouterLigne} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">➕ Ajouter une ligne</button>
            <div className="text-right font-bold text-xl mt-2">
              Total FOB: {totalFOB.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} USD
            </div>
          </div>
          
          <div className="text-right pt-4 border-t">
            <button type="submit" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105">
              {isConversionMode ? 'Valider et Comptabiliser' : '💾 Enregistrer la Facture Proforma'}
            </button>
          </div>
        </form>


        <div className="lg:sticky lg:top-8">
          <InvoicePreview data={previewData} />
        </div>
      </div>

      {isPreviewOpen && <PrintPreviewModal data={<InvoicePreview data={previewData} />} onClose={() => setIsPreviewOpen(false)} />}
    </div>
  );
};

export default CreationFacturePage;