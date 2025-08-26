import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Composants réutilisables
import Sidebar from './components/Sidebar';
import PlaceholderPage from './components/PlaceholderPage';

// Pages
import Dashboard from './pages/Dashboard';
import EntreprisePage from './pages/EntreprisePage';
import ClientsVentesPage from './pages/ClientsVentesPage';
import FournisseursAchatsPage from './pages/FournisseursAchatsPage';
import ArticlesStocksPage from './pages/ArticlesStocksPage';
import EnvoiPage from './pages/EnvoiPage';
import SaisieEcritures from './pages/SaisieEcritures';
import ConsultationEcritures from './pages/ConsultationEcritures';
import PlanComptable from './pages/PlanComptable';
import Tiers from './pages/Tiers';
import ReportingPage from './pages/ReportingPage';
import ParametresPage from './pages/ParametresPage';
import PoubellePage from './pages/PoubellePage';
import CreationFacturePage from './pages/CreationFacturePage';
import ListeDesVentesPage from './pages/ListeDesVentesPage';
import ListeDesEncaissementsPage from './pages/ListeDesEncaissementsPage';
import CreationEnvoiUniquePage from './pages/CreationEnvoiUniquePage';
import InvoicePage from './pages/InvoicePage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États de l'application
  const [planComptable, setPlanComptable] = useState([]);
  const [journaux, setJournaux] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [ecritures, setEcritures] = useState([]);
  const [articles, setArticles] = useState([]);
  const [envois, setEnvois] = useState([]);
  const [factures, setFactures] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [dateCloture, setDateCloture] = useState(new Date('2025-12-31'));
  const [ecritureToEdit, setEcritureToEdit] = useState(null);
  const [targetReportId, setTargetReportId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [comptesRes, journauxRes, tiersRes, ecrituresRes, articlesRes, envoisRes, facturesRes, mouvementsRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/comptes`),
          axios.get(`${API_URL}/api/journaux`),
          axios.get(`${API_URL}/api/tiers`),
          axios.get(`${API_URL}/api/ecritures`),
          axios.get(`${API_URL}/api/articles`),
          axios.get(`${API_URL}/api/envois`),
          axios.get(`${API_URL}/api/factures`),
          axios.get(`${API_URL}/api/mouvements`)
        ]);

      setPlanComptable(comptesRes.data);
      setJournaux(journauxRes.data);
      setTiers(tiersRes.data);
      setEcritures(ecrituresRes.data);
      setArticles(articlesRes.data);
      setEnvois(envoisRes.data);
      setFactures(facturesRes.data);
      setMouvements(mouvementsRes.data);
    } catch (err) {
      console.error("Erreur de chargement des données:", err);
      setError("Impossible de charger les données. Vérifiez le serveur backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEditEcriture = (ecriture) => { setEcritureToEdit(ecriture); setPage('saisie'); };
  const clearEcritureToEdit = () => setEcritureToEdit(null);
  const navigateToReport = (reportId) => { setTargetReportId(reportId); setPage('reporting'); };
  const handleConvertToDefinitive = (facture) => { setPage(`creation_facture/${facture.id}`); };

  // --- Gestion des envois ---
  const handleAddEnvoi = async (envoiData) => {
    try {
      // Force la quantité en nombre
      envoiData.quantite = Number(envoiData.quantite);
      if (isNaN(envoiData.quantite) || envoiData.quantite <= 0) {
        throw new Error("Quantité invalide.");
      }
  
      await axios.post(`${API_URL}/api/envois`, envoiData);
      alert('Envoi ajouté avec succès !');
      await fetchData();
      setPage('envoi');
  
    } catch (err) {
      console.error("Erreur ajout envoi:", err);
      alert(err.response?.data?.error || "Erreur lors de l'ajout de l'envoi.");
    }
  };

  // --- NOUVELLE FONCTION POUR GÉRER LA SUPPRESSION ---
  const handleDeleteEcriture = async (numeroPiece) => {
    if (!numeroPiece) return alert("Numéro de pièce invalide.");
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la pièce n° ${numeroPiece} et toutes ses lignes ?`)) {
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/api/ecritures/piece/${numeroPiece}`);
            await fetchData(); // Pour rafraîchir les données après suppression
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
            alert(err.response?.data?.error || "Une erreur est survenue.");
            setLoading(false);
        }
    }
};
  

  const handleAddClientAndEnvoi = async (clientData, envoiDataPartial) => {
    try {
      // --- Création du client ---
      const responseClient = await axios.post(`${API_URL}/api/tiers`, clientData);
      const nouveauClient = responseClient.data;
  
      // --- Recherche de l'article exact ---
      const article = articles.find(
        a => a.code === envoiDataPartial.article_code || a.designation === envoiDataPartial.articleDesignation
      );
      if (!article) throw new Error("Article non trouvé.");
  
      // --- Forcer la quantité en nombre ---
      const quantiteNum = Number(envoiDataPartial.quantite);
      if (isNaN(quantiteNum) || quantiteNum <= 0) throw new Error("Quantité invalide.");
  
      // --- Création de l'envoi complet ---
      const timestamp = Date.now().toString().slice(-4);
      const envoiDataComplet = {
        id: `${nouveauClient.code}_${article.code}_${quantiteNum}CT_${timestamp}`,
        nom: envoiDataPartial.nom,
        client_code: nouveauClient.code,
        statut: "actif",
        total_produits: 0,
        total_charges: 0,
        designation: article.designation,
        quantite: quantiteNum,
        article_code: article.code
      };
  
      await axios.post(`${API_URL}/api/envois`, envoiDataComplet);
      await fetchData();
      setPage('envoi');
  
      return nouveauClient;
  
    } catch (err) {
      console.error("Erreur création client+envoi:", err);
      throw err;
    }
  };
  

  const renderPage = () => {
    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    if (error) return <div className="p-8 m-auto mt-10 max-w-lg text-center text-red-700 bg-red-100 rounded-md border border-red-300">{error}</div>;

    const [mainPage, subId] = page.split('/');

    switch (mainPage) {
      case 'dashboard': return <Dashboard planComptable={planComptable} ecritures={ecritures} tiers={tiers} articles={articles} envois={envois} mouvements={mouvements} dateCloture={dateCloture} setPage={setPage} navigateToReport={navigateToReport} />;
      case 'entreprise': return <EntreprisePage />;
      case 'clients_ventes': return <ClientsVentesPage tiers={tiers} setPage={setPage} envois={envois} />;
      case 'fournisseurs_achats': return <FournisseursAchatsPage tiers={tiers} setPage={setPage} />;
      case 'articles_stocks': 
        return <ArticlesStocksPage 
                  articles={articles}     // Passer la liste d'articles
                  mouvements={mouvements} // Passer la liste des mouvements
                  refreshData={fetchData} 
                />;
      case 'envoi': return <EnvoiPage envois={envois} tiers={tiers} setPage={setPage} />;
      case 'creation_envoi': 
      case 'creation_client_envoi':
        return <CreationEnvoiUniquePage 
                  tiers={tiers} 
                  setPage={setPage} 
                  handleAddEnvoi={handleAddEnvoi} 
                  handleAddClientAndEnvoi={handleAddClientAndEnvoi} 
                  articles={articles} 
                  planComptable={planComptable}
               />;
      case 'saisie': return <SaisieEcritures journaux={journaux} planComptable={planComptable} setPage={setPage} refreshData={fetchData} ecritureToEdit={ecritureToEdit} clearEcritureToEdit={clearEcritureToEdit} />;
      case 'ecritures': return <ConsultationEcritures setPage={setPage} ecritures={ecritures} loading={loading} refreshData={fetchData} handleEdit={handleEditEcriture} handleDelete={handleDeleteEcriture}  clearEcritureToEdit={clearEcritureToEdit} />;
      case 'poubelle': return <PoubellePage setPage={setPage} />;
      case 'plan_comptable': return <PlanComptable comptes={planComptable} refreshData={fetchData} />;
      case 'tiers': return <Tiers tiers={tiers} envois={envois} refreshData={fetchData} setPage={setPage} planComptable={planComptable}  />;
      case 'reporting': return <ReportingPage comptes={planComptable} ecritures={ecritures} dateCloture={dateCloture} initialSelectedReportId={targetReportId} />;
      case 'import': return <PlaceholderPage title="Import / Export" />;
      case 'parametres': return <ParametresPage dateCloture={dateCloture} setDateCloture={setDateCloture} />;
      case 'creation_facture': return <CreationFacturePage tiers={tiers} envois={envois} setPage={setPage} factureIdToConvert={subId} refreshData={fetchData} />;
      case 'liste_ventes': 
  return <ListeDesVentesPage 
            setPage={setPage} 
            handleConvertToDefinitive={handleConvertToDefinitive} 
            factures={factures} 
            refreshData={fetchData} 
         />;
      case 'invoice':
          return <InvoicePage factureId={subId} />;
            
      case 'liste_encaissements': return <ListeDesEncaissementsPage setPage={setPage} />;
      default: return <Dashboard planComptable={planComptable} ecritures={ecritures} tiers={tiers} articles={articles} envois={envois} dateCloture={dateCloture} setPage={setPage} navigateToReport={navigateToReport} />;
    }
  };

  return (
    <div className="p-5 min-h-screen bg-gray-50">
      <header className="relative rounded-2xl mb-5 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/banner.jpg)" }}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex items-center p-4 gap-5">
            <div><img src="/logo.png" alt="VINA EXPORT SARLU Logo" className="h-20 w-auto" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md text-left">VINA EXPORT SARLU</h1>
              <p className="text-gray-200 text-xs mt-1 drop-shadow-md text-left">
                  NIF: 4019364331 - STAT: 46625412025000948 - RCS: 2025B00036<br/>
                  Siège: Secteur 01 Centra A - AMBOROVY - MAHAJANGA 401 - MADAGASCAR<br/>
                  heri.razafii@gmail.com - Bank of Africa (B.O.A): 00009 03000 25040520003 55
              </p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-[280px_1fr] gap-5 h-[calc(100vh-140px)]">
        <Sidebar page={page} setPage={setPage} onSaisieClick={() => { clearEcritureToEdit(); setPage('saisie'); }} onEnvoiClick={() => setPage('envoi')} />
        <main className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
