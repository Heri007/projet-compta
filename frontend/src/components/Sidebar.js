// Fichier : frontend/src/components/Sidebar.js

import React from 'react';

// Le composant NavItem est parfait, on n'y touche pas.
const NavItem = ({ icon, label, pageName, currentPage, setPage }) => (
    <li>
        <button
            onClick={() => setPage(pageName)}
            className={`w-full flex items-center p-3 my-1 rounded-lg font-medium transition-all duration-300 transform ${
                currentPage === pageName
                ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md'
                : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#667eea]/80 hover:to-[#764ba2]/80 hover:translate-x-1'
            }`}
        >
            <span className="mr-3 text-xl">{icon}</span>
            {label}
        </button>
    </li>
);


const Sidebar = ({ page, setPage }) => {
  // --- LISTE DES MENUS RÉORGANISÉE POUR PLUS DE CLARTÉ ---
  const menuItems = [
    // Section Principale
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
    { id: 'entreprise', icon: '🏢', label: 'Entreprise' },
    { id: 'clients_ventes', icon: '👨‍💼', label: 'Clients & Ventes' },
    { id: 'ecritures', icon: '✍️', label: 'Écritures Comptables' },
    
    // Section Opérationnelle
    { id: 'envoi', icon: '✈️', label: 'Envois' },
    { id: 'liste_ventes', icon: '🧾', label: 'Factures de Vente' },
    
    // Section Tiers & Articles
    { id: 'tiers', icon: '👥', label: 'Gestion des Tiers' },
    { id: 'articles_stocks', icon: '📦', label: 'Articles & Stocks' },
    { id: 'immobilisations', icon: '🏛️', label: 'Immobilisations' },
    
    // Section Comptabilité Pure
    { id: 'reporting', icon: '📋', label: 'États & Reporting' },
    { id: 'plan_comptable', icon: '🏦', label: 'Plan Comptable' },
    // Section Utilitaires
    //{ id: 'import', icon: '📥', label: 'Import/Export' },
    { id: 'parametres', icon: '⚙️', label: 'Paramètres' },
    { id: 'documentation', icon: '📁', label: 'Documentation' }, // <-- Placé ici logiquement
  ];

  return (
    <aside className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
      <nav>
        <ul>
          {/* La boucle est déjà correcte, on n'y touche pas */}
          {menuItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              pageName={item.id}
              currentPage={page}
              setPage={setPage}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;