import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import { genererDonneesResultat } from '../utils/compteDeResultatHelper';
import TauxDeChangeWidget from '../components/TauxDeChangeWidget';
import { getStatusClasses } from '../utils/uiHelpers';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={`p-5 rounded-xl shadow-lg text-white w-full text-left transition-transform hover:scale-105 focus:outline-none focus:ring-4 ${color}`}
  >
    <div className="flex justify-between items-center">
      <div>
        <div className="text-4xl font-bold">{value}</div>
        <div className="text-sm opacity-90">{title}</div>
      </div>
      <div className="text-5xl opacity-80">{icon}</div>
    </div>
  </button>
);

// --- CORRECTION : Définir le style de l'en-tête pour les widgets ---
  // On utilise une classe arbitraire de Tailwind CSS pour la couleur #fcd4c5
  // et on choisit une couleur de texte sombre pour le contraste.
  const widgetHeaderStyle = "px-4 py-3 font-bold text-gray-800 bg-[#c5eafc]";

const Dashboard = ({ planComptable, ecritures = [], tiers = [], articles = [], envois = [], factures = [], mouvements = [], setPage, navigateToReport }) => {  // --- CORRECTION DU BLOC useMemo ENTIER ---
  const dashboardData = useMemo(() => {
    console.log("--- Recalcul du Dashboard ---");
    // 1. Sécuriser les données (s'assurer que ce sont bien des tableaux)
    const safeEcritures = Array.isArray(ecritures) ? ecritures : [];
    const safeTiers = Array.isArray(tiers) ? tiers : [];
    const safeArticles = Array.isArray(articles) ? articles : [];
    const safeEnvois = Array.isArray(envois) ? envois : [];
    const safeFactures = Array.isArray(factures) ? factures : [];
    const safeMouvements = Array.isArray(mouvements) ? mouvements : [];
    const safePlanComptable = Array.isArray(planComptable) ? planComptable : [];

    // Log pour vérifier que les données brutes sont bien là
    console.log("Données reçues:", { 
      nbEnvois: safeEnvois.length, 
      nbFactures: safeFactures.length 
    });
    // Affichez un exemple de chaque pour le débogage
    if (safeEnvois.length > 0) console.log("Exemple d'envoi:", safeEnvois[0]);
    if (safeFactures.length > 0) console.log("Exemple de facture:", safeFactures[0]);

    // 2. Calculer le résultat net
    const resultatData = genererDonneesResultat(safePlanComptable, safeEcritures);

    // 3. Préparer les dernières opérations uniques
    const dernieresOperationsMap = new Map();
    safeEcritures.forEach(op => {
      if (op.numero_piece && !dernieresOperationsMap.has(op.numero_piece)) {
        dernieresOperationsMap.set(op.numero_piece, op);
      }
    });
    const dernieresOperationsUniques = Array.from(dernieresOperationsMap.values()).slice(0, 5);
    
    // 4. Préparer les derniers mouvements de stock
    const derniersMouvements = safeMouvements.slice(0, 5);
    const stockWidgetData = derniersMouvements.map(mouvement => {
      const articleCorrespondant = safeArticles.find(art => art.designation === mouvement.designation);
      return {
        ...mouvement,
        stockActuel: articleCorrespondant ? articleCorrespondant.quantite : 'N/A'
      };
    });

    // 5. Préparer les envois récents enrichis (avec la logique de priorité à la facture définitive)
    const envoisRecentsEnrichis = safeEnvois.slice(0, 5).map(envoi => {
      console.log(`[Matching] Traitement de l'envoi ID: '${envoi.id}' (Nom: ${envoi.nom})`);
      // CORRECTION : On s'assure que les IDs existent avant de comparer
      const facturesAssociees = safeFactures.filter(f => 
        f.envoi_id && envoi.id && f.envoi_id === envoi.id
      );
      // Log du résultat du matching
      if (facturesAssociees.length > 0) {
        console.log(`   -> SUCCÈS: ${facturesAssociees.length} facture(s) trouvée(s) pour l'envoi '${envoi.id}'`);
      }
      const clientAssocie = safeTiers.find(t => t.code === envoi.client_code);

      return { 
        ...envoi, 
        factures: facturesAssociees, 
        client: clientAssocie,
      };
    });

    return {
      resultatNet: resultatData.beneficeOuPerte || 0,
      envoisActifs: safeEnvois.filter(e => e.statut === 'actif').length,
      nombreArticles: safeArticles.length,
      totalTiers: safeTiers.length,
      dernieresOperations: dernieresOperationsUniques,
      envoisRecents: envoisRecentsEnrichis,
      derniersMouvementsStock: stockWidgetData,
    };

  }, [planComptable, ecritures, tiers, articles, envois, mouvements, factures]);

  const formatCurrency = (val) => `${(val || 0).toLocaleString('fr-FR')} Ar`;
  const formatQuantity = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'N/A';
    return `${num.toLocaleString('fr-FR')} Kg`;
  };

  return (
    <div className="p-8">
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre activité financière." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Résultat Net (N)" 
          value={formatCurrency(dashboardData.resultatNet)} 
          icon="📈" 
          color="bg-gradient-to-br from-green-500 to-emerald-600 focus:ring-green-300"
          onClick={() => navigateToReport('resultat_std')}
        />
        <StatCard 
          title="Envois Actifs" 
          value={dashboardData.envoisActifs} 
          icon="✈️" 
          color="bg-gradient-to-br from-blue-500 to-indigo-600 focus:ring-blue-300"
          onClick={() => setPage('envoi')}
        />
        <StatCard 
          title="Articles Référencés" 
          value={dashboardData.nombreArticles} 
          icon="📦" 
          color="bg-gradient-to-br from-amber-500 to-orange-600 focus:ring-amber-300"
          onClick={() => setPage('articles_stocks')}
        />
        <StatCard 
          title="Total Tiers" 
          value={dashboardData.totalTiers} 
          icon="👥" 
          color="bg-gradient-to-br from-purple-500 to-violet-600 focus:ring-purple-300"
          onClick={() => setPage('tiers')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <WidgetCard title="Actions Rapides" headerClassName={widgetHeaderStyle}>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setPage('creation_client_envoi')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">🚀 Nouveau Client & Envoi</button>
            <button onClick={() => setPage('saisie')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">✍️ Saisir une Écriture</button>
            <button onClick={() => setPage('creation_facture')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">🧾 Créer Facture</button>
            <button onClick={() => setPage('liste_ventes')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">📝 Liste des Factures</button>
            <button onClick={() => setPage('reporting')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">📋 Voir les Rapports</button>
          </div>
        </WidgetCard>

        {/* --- AJOUT DU WIDGET DE TAUX DE CHANGE --- */}
        <TauxDeChangeWidget />

        <WidgetCard title="Dernières Opérations (par pièce)" headerClassName={widgetHeaderStyle}>
          <ul className="space-y-2 h-48 overflow-y-auto">
            {dashboardData.dernieresOperations.length > 0 ? (
              dashboardData.dernieresOperations.map(op => (
                <li key={op.id} className="text-sm p-2 bg-gray-50 rounded-md flex justify-between">
                  <span><span className="font-bold">{op.numero_piece}</span> - {op.libelle_operation}</span>
                  <span className="text-gray-500">{new Date(op.date).toLocaleDateString('fr-FR')}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400 text-center p-4">Aucune opération récente.</li>
            )}
          </ul>
        </WidgetCard>

        {/* --- MODIFICATION DU WIDGET "ENVOIS RÉCENTS" --- */}
        <WidgetCard title="Envois Récents" headerClassName={widgetHeaderStyle}>
          <div className="h-48 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {['Envoi', 'Article', 'Client', 'Facture'].map(h => 
                    <th key={h} className="py-2 px-2 text-left font-semibold text-gray-500">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.envoisRecents.length > 0 ? (
                  dashboardData.envoisRecents.map(envoi => (
                    <tr key={envoi.id}>
                      <td className="py-2 px-2">
                        <button onClick={() => setPage('envoi')} className="font-semibold text-blue-600 hover:underline text-left">
                          {envoi.nom}
                        </button>
                      </td>
                      <td className="py-2 px-2">{envoi.designation}</td>
                      <td className="py-2 px-2">
                        {envoi.client ? (
                          <button onClick={() => setPage('tiers')} className="hover:underline">
                            {envoi.client.nom}
                          </button>
                        ) : ( <span className="text-gray-400">Inconnu</span> )}
                      </td>
                      {/* --- MODIFICATION DE LA CELLULE FACTURE --- */}
                      <td className="py-2 px-2">
                        {envoi.factures && envoi.factures.length > 0 ? (
                          // On crée un conteneur flex pour aligner les badges
                          <div className="flex items-center gap-2">
                            {envoi.factures.map(facture => (
                              <button 
                                key={facture.id}
                                onClick={() => setPage('liste_ventes')}
                                // Style conditionnel en fonction du type de facture
                                className={`px-2 py-0.5 text-xs font-bold rounded-full transition-transform hover:scale-110 ${getStatusClasses(facture.type_facture)}`}
                              >
                                {facture.type_facture === 'Definitive' ? 'FD' : 'FP'}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Aucune</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-sm text-gray-400 text-center p-4">
                      Aucun envoi récent.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </WidgetCard>

<WidgetCard title="Derniers Mouvements de Stock" headerClassName={widgetHeaderStyle}>
          <div className="h-48 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="py-2 text-left font-semibold text-gray-500">Article</th>
                  <th className="py-2 text-right font-semibold text-gray-500">Mouvement</th>
                  <th className="py-2 text-right font-semibold text-gray-500">Stock Actuel</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.derniersMouvementsStock.length > 0 ? (
                  dashboardData.derniersMouvementsStock.map(mvt => (
                    <tr key={mvt.id} className="border-t">
                      <td className="py-2">
                        <div className="font-semibold">{mvt.designation}</div>
                        <div className="text-xs text-red-400 font-bold"><i>{new Date(mvt.date).toLocaleDateString('fr-FR')}</i></div>
                      </td>
                      {/* --- MODIFICATION ICI : Créer une structure div pour les deux lignes --- */}
                      <td className="py-2 text-right">
                        {/* Ligne 1 : Le mouvement (quantité) */}
                        <div className={`font-mono font-bold ${mvt.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}`}>
                            {mvt.type === 'Entrée' ? '+' : '-'} {formatQuantity(mvt.quantite)}
                        </div>
                        {/* Ligne 2 : Le statut (Entrée/Sortie) avec le style de la date */}
                        <div className="text-xs text-red-400 font-bold">
                        <i>{mvt.type}</i>
                        </div>
                      </td>
                      <td className="py-2 text-right font-mono">
                      {formatQuantity(mvt.quantite)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-sm text-gray-400 text-center p-4">Aucun mouvement de stock récent.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
};

export default Dashboard;
