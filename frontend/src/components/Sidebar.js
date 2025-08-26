// Fichier : frontend/src/components/Sidebar.js

import React from 'react';

// --- On définit d'abord le composant NavItem réutilisable ---
const NavItem = ({ icon, label, pageName, currentPage, setPage }) => (
    <li>
        <button
            onClick={() => setPage(pageName)}
            className={`w-full flex items-center p-3 my-1 rounded-lg font-medium transition-all duration-300 transform ${
                currentPage === pageName
                ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md'
                // Classes pour le survol
                : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#667eea]/80 hover:to-[#764ba2]/80 hover:translate-x-1'
            }`}
        >
            <span className="mr-3 text-xl">{icon}</span>
            {label}
        </button>
    </li>
);


const Sidebar = ({ page, setPage }) => {
  // La liste des menus est maintenant la seule source de vérité
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
    { id: 'entreprise', icon: '🏢', label: 'Entreprise' },
    { id: 'envoi', icon: '✈️', label: 'Envoi' },
    { id: 'clients_ventes', icon: '👨‍💼', label: 'Clients & Ventes' },
    { id: 'liste_ventes', icon: '🧾', label: 'Factures' },
    { id: 'fournisseurs_achats', icon: '🛒', label: 'Fournisseurs & Achats' },
    { id: 'articles_stocks', icon: '📦', label: 'Articles & Stocks' },
    // --- NOUVEL AJOUT ---
    { id: 'immobilisations', icon: '🏛️', label: 'Immobilisations' },
    { id: 'ecritures', icon: '✍️', label: 'Écritures' },
    { id: 'plan_comptable', icon: '🏦', label: 'Plan Comptable' },
    { id: 'tiers', icon: '👥', label: 'Gestion des tiers' },
    { id: 'reporting', icon: '📋', label: 'États & Reporting' },
    { id: 'import', icon: '📥', label: 'Import/Export' },
    { id: 'parametres', icon: '⚙️', label: 'Paramètres' },
  ];

  return (
    <aside className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
      <nav>
        <ul>
          {/* --- CORRECTION MAJEURE : On boucle sur `menuItems` --- */}
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