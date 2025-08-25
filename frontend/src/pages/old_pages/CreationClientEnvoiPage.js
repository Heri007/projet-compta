import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import LISTE_ARTICLES from '../data/articlesList';

const FormInputGroup = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const CreationClientEnvoiPage = ({ setPage,  handleAddClientAndEnvoi }) => {
  const [nomClient, setNomClient] = useState('');
  const [typeClient, setTypeClient] = useState('Client');
  const [compteGeneral, setCompteGeneral] = useState('411000');
  const [articleDesignation, setArticleDesignation] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(false);

  const allArticles = useMemo(() => LISTE_ARTICLES, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomClient || !articleDesignation || !quantite) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
  
    try {
      setLoading(true);
  
      // Préparer les données client
      const clientData = { nom: nomClient, type: typeClient, compte_general: compteGeneral };
  
      // Préparer les données partielles de l'envoi
      const envoiDataPartial = {
        nom: `Envoi pour ${nomClient} - ${articleDesignation}`,
        articleDesignation,
        quantite: Number(quantite)
      };
      
      
      // Création combinée client + envoi
      await handleAddClientAndEnvoi(clientData, envoiDataPartial);
      console.log("Création combinée - ClientData:", clientData);
      console.log("Création combinée - EnvoiDataPartial:", envoiDataPartial);
      setPage('envoi'); // rediriger vers la liste des envois
    } catch (err) {
      console.error("Erreur lors de la création combinée:", err);
      alert(err.message || "Erreur lors de la création du client ou de l'envoi.");
    } finally {
      setLoading(false);
    }
  };
  

  const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

  return (
    <div className="p-8">
      <PageHeader
        title="Nouveau Client & Premier Envoi"
        subtitle="Enregistrez un nouveau partenaire et son premier envoi en une seule étape."
      />
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <WidgetCard title="Étape 1 : Informations sur le Client" headerClassName={headerGradientClass}>
            <div className="p-6 space-y-4">
              <FormInputGroup label="Nom / Raison Sociale *">
                <input
                  type="text"
                  value={nomClient}
                  onChange={e => setNomClient(e.target.value)}
                  required
                  className="mt-1 w-full p-3 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormInputGroup>
              <FormInputGroup label="Type">
                <select value={typeClient} onChange={e => setTypeClient(e.target.value)} className="mt-1 w-full p-3 border rounded-lg shadow-sm">
                  <option value="Client">Client</option>
                  <option value="Fournisseur">Fournisseur</option>
                </select>
              </FormInputGroup>
              <FormInputGroup label="Compte Général Associé">
                <select value={compteGeneral} onChange={e => setCompteGeneral(e.target.value)} className="mt-1 w-full p-3 border rounded-lg shadow-sm">
                  <option value="411000">411000 - Clients</option>
                  <option value="401000">401000 - Fournisseurs</option>
                </select>
              </FormInputGroup>
            </div>
          </WidgetCard>

          <WidgetCard title="Étape 2 : Détails du Premier Envoi" headerClassName={headerGradientClass}>
            <div className="p-6 space-y-4">
              <FormInputGroup label="Article Principal *">
                <input
                  type="text"
                  list="articles-list"
                  value={articleDesignation}
                  onChange={e => setArticleDesignation(e.target.value)}
                  required
                  placeholder="Commencez à taper le nom de l'article..."
                  className="mt-1 w-full p-3 border rounded-lg shadow-sm"
                />
                <datalist id="articles-list">
                  {allArticles.map(a => <option key={a.code} value={a.designation} />)}
                </datalist>
              </FormInputGroup>
              <FormInputGroup label="Quantité (containers) *">
                <input
                  type="number"
                  min="1"
                  value={quantite}
                  onChange={e => setQuantite(e.target.value)}
                  required
                  className="mt-1 w-full p-3 border rounded-lg shadow-sm"
                />
              </FormInputGroup>
            </div>
          </WidgetCard>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setPage('dashboard')} className="px-6 py-2 bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? "Enregistrement..." : "Créer Client et Envoi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreationClientEnvoiPage;
