import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import PrintPreviewModal from '../components/PrintPreviewModal';
import axios from 'axios';
import InvoicePreview from '../components/InvoicePreview'; // Uniquement pour l'aperçu à l'écran

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- COMPOSANT DÉDIÉ AU CHARGEMENT DU HTML POUR L'APERÇU ---
const InvoiceHtmlRenderer = ({ factureData }) => {
    const [html, setHtml] = useState('<p style="text-align: center; padding: 20px;">Génération de l\'aperçu...</p>');
    useEffect(() => {
        const renderHtml = async () => {
            if (!factureData) return;
            try {
                // On appelle la route POST qui renvoie le HTML prêt
                const response = await axios.post(`${API_URL}/api/factures/render-html`, factureData);
                setHtml(response.data);
            } catch (err) {
                setHtml('<p style="text-align: center; padding: 20px; color: red;">Erreur de chargement.</p>');
            }
        };
        renderHtml();
    }, [factureData]);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


const CreationFacturePage = ({ tiers, setPage, factureIdToConvert, refreshData, envois = [], articles = [] }) => {
    const isConversionMode = Boolean(factureIdToConvert);
    const clients = useMemo(() => tiers.filter(t => t.type === 'Client'), [tiers]);

    // --- ÉTATS DU FORMULAIRE ---
    const [factureOriginale, setFactureOriginale] = useState(null);
    const [clientCode, setClientCode] = useState('');
    const [envoiSelectionne, setEnvoiSelectionne] = useState('');
    const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
    const [natureProduit, setNatureProduit] = useState('Pierres industrielles');
    const [paysOrigine, setPaysOrigine] = useState('MADAGASCAR');
    const [compagnieMaritime, setCompagnieMaritime] = useState('');
    const [portEmbarquement, setPortEmbarquement] = useState('MAHAJANGA');
    const [nomenclatureDouaniere, setNomenclatureDouaniere] = useState('');
    const [domiciliation, setDomiciliation] = useState('');
    const [poidsBrut, setPoidsBrut] = useState('');
    const [tare, setTare] = useState('');
    const [poidsNet, setPoidsNet] = useState('');
    const [lignes, setLignes] = useState([{ id: Date.now(), description: '', quantite: 1, prix: 0, article_code: '' }]);
    const [numeroFacture, setNumeroFacture] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // --- LOGIQUE DE REMPLISSAGE (Chargement / Sélection d'envoi) ---
    useEffect(() => {
    if (!isConversionMode) return;

    const fetchFacture = async () => {
      try {
        const { data: factureData } = await axios.get(`${API_URL}/api/factures/${factureIdToConvert}`);
        setFactureOriginale(factureData);

        setClientCode(factureData.code_tiers || '');
        setDateFacture(new Date().toISOString().split('T')[0]);
        setNumeroFacture(factureData.numero_facture?.replace('FP-', 'FD-') || '');
        setNatureProduit(factureData.nature_produit || factureData.libelle || '');
        setPaysOrigine(factureData.pays_origine || '');
        setCompagnieMaritime(factureData.compagnie_maritime || '');
        setPortEmbarquement(factureData.port_embarquement || '');
        setNomenclatureDouaniere(factureData.nomenclature_douaniere || '');
        setDomiciliation(factureData.domiciliation || '');
        setPoidsBrut(factureData.poids_brut || 0);
        setTare(factureData.tare || 0);
        setEnvoiSelectionne(factureData.envoi_id || '');
        setLignes(
          factureData.lignes?.length > 0
            ? factureData.lignes.map(l => ({
                id: l.id,
                description: l.description || '',
                quantite: l.quantite || 1,
                prix: l.prix || 0,
              }))
            : [{ id: Date.now(), description: '', quantite: 1, prix: 0 }]
        );
      } catch (err) {
        console.error(err);
        alert("Impossible de charger la facture à convertir.");
        setPage('liste_ventes');
      }
    };

    fetchFacture();
  }, [factureIdToConvert, isConversionMode, setPage]);
  
    useEffect(() => {
    if (isConversionMode) return;

    if (envoiSelectionne) {
      const envoi = envois.find(e => e.id === envoiSelectionne);
      if (envoi) {
        console.log('Envoi sélectionné, mise à jour des lignes avec:', envoi);
        setLignes([{ 
          id: Date.now(), 
          description: envoi.designation || 'Produit non renseigné', 
          quantite: envoi.quantite || 1, 
          prix: envoi.prix_unitaire || 0 
        }]);
        setNatureProduit(envoi.nature_produit || natureProduit);
        setPaysOrigine(envoi.pays_origine || paysOrigine);
        setCompagnieMaritime(envoi.compagnie_maritime || compagnieMaritime);
        setPortEmbarquement(envoi.port_embarquement || portEmbarquement);
        setNomenclatureDouaniere(envoi.nomenclature_douaniere || nomenclatureDouaniere);
        setPoidsBrut(envoi.poids || poidsBrut);
        setTare(envoi.tare || tare);
      }
    } else {
      console.log('Aucun envoi sélectionné, réinitialisation des lignes');
      setLignes([{ id: Date.now(), description: '', quantite: 1, prix: 0 }]);
    }
  }, [envoiSelectionne, isConversionMode, envois, natureProduit, paysOrigine, compagnieMaritime, portEmbarquement, nomenclatureDouaniere, poidsBrut, tare]);


    // --- CALCULS & GESTION DES LIGNES ---
    const client = useMemo(() => clients.find(c => c.code === clientCode), [clients, clientCode]);
    const totalFOB = useMemo(() => lignes.reduce((sum, l) => sum + (Number(l.quantite || 0) * Number(l.prix || 0)), 0), [lignes]);

    const handleLigneChange = (id, field, value) => {
        setLignes(prevLignes => prevLignes.map(l => {
            if (l.id === id) {
                const updatedLigne = { ...l, [field]: value };
                if (field === 'description') {
                    const article = articles.find(a => a.designation === value);
                    updatedLigne.article_code = article ? article.code : '';
                }
                return updatedLigne;
            }
            return l;
        }));
    };
    const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), description: '', quantite: 1, prix: 0, article_code: '' }]);
    const supprimerLigne = id => setLignes(lignes.filter(l => l.id !== id));

    // --- SOUMISSION & APERÇU ---
    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client) return alert("Veuillez sélectionner un client.");

    try {
      if (isConversionMode) {
        if (!factureOriginale) return alert("Facture originale introuvable.");

        // --- CORRECTION COMPLÈTE DU PAYLOAD ---
        const conversionPayload = {
          // Données générales (déjà bonnes)
          date_facture: dateFacture,
          libelle: `Vente client ${client.nom} - Facture définitive`,
          montant: totalFOB,
          lignes, // Le tableau de lignes (déjà bon)

          // Données d'en-tête (À AJOUTER)
          nature_produit: natureProduit,
          pays_origine: paysOrigine,
          compagnie_maritime: compagnieMaritime,
          port_embarquement: portEmbarquement,
          nomenclature_douaniere: nomenclatureDouaniere,
          domiciliation: domiciliation,
          
          // Données de poids (À AJOUTER)
          poids_brut: parseFloat(poidsBrut) || null,
          tare: parseFloat(tare) || null,
          poids_net: parseFloat(poidsNet) || null
        };

        await axios.put(`${API_URL}/api/factures/convertir/${factureOriginale.id}`, conversionPayload);
        alert("✅ Facture définitive créée avec succès !");

      } else {
        // La logique de création de proforma reste la même
        const factureData = {
          code_tiers: clientCode,
          libelle: natureProduit,
          montant: totalFOB,
          type_facture: 'Proforma',
          date_facture: dateFacture,
          envoi_id: envoiSelectionne,
          lignes,
          nature_produit: natureProduit,
          pays_origine: paysOrigine,
          compagnie_maritime: compagnieMaritime,
          port_embarquement: portEmbarquement,
          nomenclature_douaniere: nomenclatureDouaniere,
          domiciliation,
          poids_brut: parseFloat(poidsBrut) || null,
          tare: parseFloat(tare) || null,
          poids_net: parseFloat(poidsNet) || null,
        };
        await axios.post(`${API_URL}/api/factures`, factureData);
        alert("✅ Facture Proforma enregistrée !");
      }

      await refreshData();
      setPage('liste_ventes');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la facture.");
    }
  };

    const previewData = useMemo(() => {
    console.log('=== CREATION PREVIEW DATA ===');
    console.log('lignes dans previewData (état actuel):', lignes);
    console.log('lignes.length:', lignes?.length);
    
    const processedLignes = lignes && lignes.length > 0 
      ? lignes.map((ligne, index) => {
          console.log(`Ligne ${index}:`, ligne);
          return {
            description: ligne.description || '',
            quantite: ligne.quantite || 0,
            prix: ligne.prix || 0
          };
        })
      : [{
          description: '',
          quantite: 0,
          prix: 0
        }];
    
    console.log('Lignes processées pour preview:', processedLignes);
    
    const result = {
      client_nom: client?.nom || '',
      client_code: client?.code || '',
      numero_facture: numeroFacture || (isConversionMode ? factureOriginale?.numero_facture?.replace('FP-', 'FD-') : 'Généré par le système'),
      date_facture: dateFacture || '',
      nature_produit: natureProduit || '',
      pays_origine: paysOrigine || '',
      compagnie_maritime: compagnieMaritime || '',
      port_embarquement: portEmbarquement || '',
      nomenclature_douaniere: nomenclatureDouaniere || '',
      lignes: processedLignes,
      domiciliation,
      poids_brut: poidsBrut || 0,
      tare: tare || 0,
      poids_net: poidsNet || '',
    };
    
    return result;
  }, [
    client, numeroFacture, factureOriginale, dateFacture, natureProduit, paysOrigine,
    compagnieMaritime, portEmbarquement, nomenclatureDouaniere, lignes, domiciliation,
    poidsBrut, tare, poidsNet, isConversionMode
  ]);

    return (
        <div className="p-8">
            <PageHeader title={isConversionMode ? 'Convertir en Facture Définitive' : "Création d'une Facture Proforma"} />

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    🖨️ Imprimer / Aperçu
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="bg-[#b0e5eb] p-6 rounded-xl shadow-md space-y-6">
                    {/* Section Informations Générales */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Informations Générales</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <select
                value={clientCode}
                onChange={e => setClientCode(e.target.value)}
                required
                className="w-full border p-2 rounded"
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.nom} ({c.code})
                  </option>
                ))}
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
              <input
                type="date"
                value={dateFacture}
                onChange={e => setDateFacture(e.target.value)}
                required
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">N° Facture</label>
              <input
                type="text"
                value={numeroFacture || 'Généré après enregistrement'}
                readOnly
                className="w-full border p-2 rounded bg-gray-100 font-mono"
              />
            </div>
          </div>

          {/* Section Détails de l'Exportation */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Détails de l'Exportation</h3>

<div>
  <label className="block text-sm font-medium mb-1">Nature du Produit</label>
  <select
    value={natureProduit}
    onChange={e => setNatureProduit(e.target.value)}
    className="w-full border p-2 rounded"
  >
    <option value="Pierres industrielles">Pierres industrielles</option>
    <option value="Produits Locaux">Produits Locaux</option>
  </select>
</div>

            <div>
              <label className="block text-sm font-medium mb-1">Pays d'Origine</label>
              <input
                type="text"
                value={paysOrigine}
                onChange={e => setPaysOrigine(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Compagnie Maritime</label>
              <input
                type="text"
                value={compagnieMaritime}
                onChange={e => setCompagnieMaritime(e.target.value)}
                placeholder="Ex: MSC, Maersk"
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
  <label className="block text-sm font-medium mb-1">Port d'Embarquement</label>
  <select
    value={portEmbarquement}
    onChange={e => setPortEmbarquement(e.target.value)}
    className="w-full border p-2 rounded"
  >
    <option value="MAHAJANGA">MAHAJANGA</option>
    <option value="TOAMASINA">TOAMASINA</option>
  </select>
</div>

            <div>
              <label className="block text-sm font-medium mb-1">Nomenclature Douanière</label>
              <input
                type="text"
                value={nomenclatureDouaniere}
                onChange={e => setNomenclatureDouaniere(e.target.value)}
                placeholder="Code SH"
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domiciliation</label>
              <input
                type="text"
                value={domiciliation}
                onChange={e => setDomiciliation(e.target.value)}
                placeholder="N° et date"
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {/* Section Poids */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Poids (en Kg)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Poids Brut</label>
                <input
                  type="number" // Garder "number" pour le clavier numérique
                  value={poidsBrut}
                  onChange={e => setPoidsBrut(e.target.value)} // On garde la chaîne de caractères
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tare</label>
                <input
                  type="number"
                  value={tare}
                  onChange={e => setTare(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Poids Net</label>
                <input
                  type="number" // Mettre 'number' pour la cohérence
                  value={poidsNet}
                  onChange={e => setPoidsNet(e.target.value)} // Le rendre modifiable
                  className="w-full border p-2 rounded bg-gray-100"
                />
              </div>
            </div>
          </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">Lignes de la Facture</h3>
                        {lignes.map((ligne) => (
                            <div key={ligne.id} className="grid grid-cols-[1fr_80px_120px_40px] gap-2 items-center">
                                <input 
                                    type="text" 
                                    list="articles-datalist"
                                    value={ligne.description}
                                    onChange={e => handleLigneChange(ligne.id, 'description', e.target.value)} 
                                    placeholder="Désignation de l'article" 
                                    required 
                                    className="border p-2 rounded" 
                                />
                                <input type="number" value={ligne.quantite} onChange={e => handleLigneChange(ligne.id, 'quantite', e.target.value)} placeholder="Qté" className="border p-2 rounded text-right" />
                                <input type="number" value={ligne.prix} onChange={e => handleLigneChange(ligne.id, 'prix', e.target.value)} placeholder="Prix" className="border p-2 rounded text-right" />
                                <button type="button" onClick={() => supprimerLigne(ligne.id)} className="text-red-500 font-bold text-xl hover:text-red-700">×</button>
                            </div>
                        ))}
                        <datalist id="articles-datalist">
                            {articles.map(a => <option key={a.code} value={a.designation} />)}
                        </datalist>
                        <button type="button" onClick={ajouterLigne} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">
                            ➕ Ajouter une ligne
                        </button>
                        <div className="text-right font-bold text-xl mt-2">
                            Total FOB: {totalFOB.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} USD
                        </div>
                    </div>

                    <div className="text-right pt-4 border-t">
                        <button type="submit" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700">
                            {isConversionMode ? 'Valider et Comptabiliser' : '💾 Enregistrer la Facture Proforma'}
                        </button>
                    </div>
                </form>
              
                <div className="lg:sticky lg:top-8">
                    <InvoicePreview facture={previewData} />
                </div>
            </div>

            <PrintPreviewModal 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)}
                title="Aperçu avant impression"
            >
                {/* La modale affiche le HTML généré par le backend */}
                <InvoiceHtmlRenderer factureData={previewData} />
            </PrintPreviewModal>
        </div>
    );
};
export default CreationFacturePage;