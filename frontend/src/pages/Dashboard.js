import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';
import { genererDonneesResultat } from '../utils/compteDeResultatHelper';

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

const Dashboard = ({ planComptable, ecritures = [], tiers = [], articles = [], envois = [], mouvements = [], setPage, navigateToReport }) => {    
  const dashboardData = useMemo(() => {
    const safeEcritures = Array.isArray(ecritures) ? ecritures : [];
    const safeTiers = Array.isArray(tiers) ? tiers : [];
    const safeArticles = Array.isArray(articles) ? articles : [];
    const safeEnvois = Array.isArray(envois) ? envois : [];
    const safeMouvements = Array.isArray(mouvements) ? mouvements : [];
    const safePlanComptable = Array.isArray(planComptable) ? planComptable : [];

    const resultatData = genererDonneesResultat(safePlanComptable, safeEcritures);

    const dernieresOperationsMap = new Map();
    safeEcritures.forEach(op => {
      if (op.numero_piece && !dernieresOperationsMap.has(op.numero_piece)) {
        dernieresOperationsMap.set(op.numero_piece, op);
      }
    });
    const dernieresOperationsUniques = Array.from(dernieresOperationsMap.values()).slice(0, 5);

    const derniersMouvements = safeMouvements.slice(0, 5);
    const stockWidgetData = derniersMouvements.map(mouvement => {
      const articleCorrespondant = safeArticles.find(art => art.designation === mouvement.designation);
      return {
        ...mouvement,
        stockActuel: articleCorrespondant ? articleCorrespondant.quantite : 'N/A'
      };
    });

    return {
      resultatNet: resultatData.beneficeOuPerte || 0,
      envoisActifs: safeEnvois.filter(e => e.statut === 'actif').length,
      nombreArticles: safeArticles.length,
      totalTiers: safeTiers.length,
      dernieresOperations: dernieresOperationsUniques,
      envoisRecents: safeEnvois.slice(0, 5),
      derniersMouvementsStock: stockWidgetData,
    };
  }, [planComptable, ecritures, tiers, articles, envois, mouvements]);

  const formatCurrency = (val) => `${(val || 0).toLocaleString('fr-FR')} Ar`;

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
        <WidgetCard title="Actions Rapides">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setPage('creation_client_envoi')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">🚀 Nouveau Client & Envoi</button>
            <button onClick={() => setPage('saisie')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">✍️ Saisir une Écriture</button>
            <button onClick={() => setPage('creation_facture')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">🧾 Créer Facture</button>
            <button onClick={() => setPage('liste_ventes')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">📝 Liste des Factures</button>
            <button onClick={() => setPage('reporting')} className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 text-center font-semibold">📋 Voir les Rapports</button>
          </div>
        </WidgetCard>

        <WidgetCard title="Dernières Opérations (par pièce)">
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

        <WidgetCard title="Envois Récents">
          <ul className="space-y-2 h-48 overflow-y-auto">
            {dashboardData.envoisRecents.length > 0 ? (
              dashboardData.envoisRecents.map(p => (
                <li key={p.id} className="text-sm p-2 bg-gray-50 rounded-md">
                  <span className="font-semibold text-blue-600">{p.nom}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400 text-center p-4">Aucun envoi actif.</li>
            )}
          </ul>
        </WidgetCard>

        <WidgetCard title="Derniers Mouvements de Stock">
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
                        <div className="text-xs text-gray-400">{new Date(mvt.date).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className={`py-2 text-right font-mono font-bold ${mvt.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}`}>
                        {mvt.type === 'Entrée' ? '+' : '-'} {formatCurrency(mvt.quantite)}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {formatCurrency(mvt.stockActuel)}
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
