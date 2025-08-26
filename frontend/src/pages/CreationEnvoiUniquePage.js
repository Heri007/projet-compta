import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import LISTE_ARTICLES from '../data/articlesList';

const FormInputGroup = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const CreationEnvoiUniquePage = ({ tiers, setPage, handleAddEnvoi, handleAddClientAndEnvoi, planComptable }) => {  const [isNewClient, setIsNewClient] = useState(false);
  const clients = useMemo(() => tiers.filter(t => t.type === 'Client'), [tiers]);

  const [clientCode, setClientCode] = useState('');
  const [nomClient, setNomClient] = useState('');
  const [typeClient, setTypeClient] = useState('Client');
  const [compteGeneral, setCompteGeneral] = useState('411000');

  const [articleCode, setArticleCode] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [envoiId, setEnvoiId] = useState('');
  const [loading, setLoading] = useState(false);

  const allArticles = useMemo(() => LISTE_ARTICLES, []);

  // --- AJOUT : On filtre le plan comptable pour ne garder que les comptes clients ---
  const comptesClients = useMemo(() => {
    if (!planComptable) return [];
    // On garde tous les comptes qui commencent par "41"
    return planComptable.filter(c => c.numero_compte.startsWith('41'));
}, [planComptable]);

  // --- Génération automatique de l'ID d'envoi (LOGIQUE CORRIGÉE) ---
useEffect(() => {
  if ((!clientCode && !isNewClient) || (isNewClient && !nomClient) || !articleCode || !quantite) {
    setEnvoiId('');
    return;
  }

  const article = allArticles.find(a => a.code === articleCode);
  if (!article) {
    setEnvoiId('');
    return;
  }
  
  const rand = Math.floor(1000 + Math.random() * 9000);
  let finalId = '';

  if (isNewClient) {
      // --- Cas 1 : Nouveau client ---
      // On génère un préfixe et on utilise un placeholder pour le numéro de client.
      const now = new Date();
      const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      // NOTE: Le backend devra générer le vrai numéro de client (ex: -001, -002...)
      finalId = `${prefix}-NOUVEAU_${quantite}CT_${article.code}_${rand}`;
  } else {
      // --- Cas 2 : Client existant ---
      // On utilise directement le code client SANS ajouter de préfixe.
      finalId = `${clientCode}_${quantite}CT_${article.code}_${rand}`;
  }

  setEnvoiId(finalId);
}, [clientCode, nomClient, articleCode, quantite, allArticles, isNewClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!articleCode || !quantite || (isNewClient && !nomClient) || (!isNewClient && !clientCode)) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);
      const quantiteNum = Number(quantite);
      if (isNaN(quantiteNum) || quantiteNum <= 0) {
        alert("Quantité invalide.");
        return;
      }

      const article = allArticles.find(a => a.code === articleCode);
      if (!article) throw new Error("Article non trouvé.");

      if (isNewClient) {
        // --- Pour un nouveau client ---
const clientData = { nom: nomClient, type: typeClient, compte_general: compteGeneral };
const envoiDataPartial = {
  nom: `Envoi pour ${nomClient} - ${article.designation}`, // ✅ nom complet côté frontend
  article_code: article.code,
  quantite: quantiteNum
  
};
await handleAddClientAndEnvoi(clientData, envoiDataPartial);
      } else {
        // --- Pour un client existant ---
const clientSelectionne = clients.find(c => c.code === clientCode);
const envoiData = {
  id: envoiId,
  nom: `Envoi pour ${clientSelectionne.nom} - ${article.designation}`, // ✅ nom complet côté frontend
  client_code: clientCode,
  statut: "actif",
  total_produits: 0,
  total_charges: 0,
  quantite: quantiteNum,
  article_code: article.code
};
await handleAddEnvoi(envoiData);
      }

      // Reset
      setNomClient('');
      setClientCode('');
      setArticleCode('');
      setQuantite(1);
      setEnvoiId('');
      setIsNewClient(false);
      setPage('envoi');

    } catch (err) {
      console.error("Erreur création client/envoi:", err);
      alert(err.message || "Erreur lors de la création de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

  return (
    <div className="p-8">
      <PageHeader title="Créer un Envoi" subtitle="Pour un client existant ou nouveau, enregistrez un envoi." />

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* --- Choix client --- */}
          <WidgetCard title="Étape 1 : Sélection Client" headerClassName={headerGradientClass}>
            <div className="p-6 space-y-4">
              <FormInputGroup label="Type de création">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={!isNewClient} onChange={() => setIsNewClient(false)} />
                    Client existant
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={isNewClient} onChange={() => setIsNewClient(true)} />
                    Nouveau client
                  </label>
                </div>
              </FormInputGroup>

              {!isNewClient ? (
                <FormInputGroup label="Client existant *">
                  <select value={clientCode} onChange={e => setClientCode(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg shadow-sm">
                    <option value="">Sélectionner un client...</option>
                    {clients.map(c => <option key={c.code} value={c.code}>{c.nom} ({c.code})</option>)}
                  </select>
                </FormInputGroup>
              ) : (
                <>
                  <FormInputGroup label="Nom / Raison Sociale *">
                    <input type="text" value={nomClient} onChange={e => setNomClient(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg shadow-sm" />
                  </FormInputGroup>
                  <FormInputGroup label="Type">
                    <select value={typeClient} onChange={e => setTypeClient(e.target.value)} className="mt-1 w-full p-3 border rounded-lg shadow-sm">
                      <option value="Client">Client</option>
                      <option value="Fournisseur">Fournisseur</option>
                    </select>
                  </FormInputGroup>
                  <FormInputGroup label="Compte Général Associé">
  <select 
    value={compteGeneral} 
    onChange={e => setCompteGeneral(e.target.value)} 
    className="mt-1 w-full p-3 border rounded-lg shadow-sm"
  >
    {/* On boucle sur la liste des comptes clients filtrés */}
    {comptesClients.map(compte => (
      <option key={compte.numero_compte} value={compte.numero_compte}>
        {compte.numero_compte} - {compte.libelle}
      </option>
    ))}
  </select>
</FormInputGroup>
                </>
              )}
            </div>
          </WidgetCard>

          {/* --- Détails de l'envoi --- */}
          <WidgetCard title="Étape 2 : Détails de l'Envoi" headerClassName={headerGradientClass}>
            <div className="p-6 space-y-4">
              <FormInputGroup label="Article Principal *">
                <input
                  type="text"
                  list="articles-list"
                  value={articleCode}
                  onChange={e => setArticleCode(e.target.value)}
                  required
                  placeholder="Commencez à taper le nom de l'article..."
                  className="mt-1 w-full p-3 border rounded-lg shadow-sm"
                />
                <datalist id="articles-list">
                  {allArticles.map(a => (
                    <option key={a.code} value={a.code}>{a.designation}</option>
                  ))}
                </datalist>
              </FormInputGroup>

              <FormInputGroup label="Quantité (containers) *">
                <input type="number" min="1" value={quantite} onChange={e => setQuantite(Number(e.target.value))} required className="mt-1 w-full p-3 border rounded-lg shadow-sm" />
              </FormInputGroup>

              <FormInputGroup label="ID de l'Envoi (auto-généré)">
                <input type="text" value={envoiId} readOnly className="mt-1 w-full p-3 border rounded-lg bg-gray-100 font-mono" />
              </FormInputGroup>
            </div>
          </WidgetCard>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setPage('envoi')} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" disabled={loading || !envoiId} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? "Création..." : "Créer l'Envoi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreationEnvoiUniquePage;
