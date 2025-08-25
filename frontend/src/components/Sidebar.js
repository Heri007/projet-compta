import React from 'react';

const Sidebar = ({ page, setPage, onEnvoiClick }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
    { id: 'entreprise', icon: '🏢', label: 'Entreprise' },
    { id: 'envoi', icon: '✈️', label: 'Envoi' },
    { id: 'clients_ventes', icon: '👨‍💼', label: 'Clients & Ventes' },
    { id: 'liste_ventes', icon: '🧾', label: 'Factures' }, // <-- Nouveau
    { id: 'fournisseurs_achats', icon: '🛒', label: 'Fournisseurs & Achats' },
    { id: 'articles_stocks', icon: '📦', label: 'Articles & Stocks' },
    { id: 'ecritures', icon: '✍️', label: 'Écritures' },
    { id: 'plan_comptable', icon: '🏦', label: 'Plan Comptable' },
    { id: 'tiers', icon: '👥', label: 'Gestion des tiers' },
    { id: 'reporting', icon: '📋', label: 'États & Reporting' },
    { id: 'import', icon: '📥', label: 'Import/Export' },
    { id: 'parametres', icon: '⚙️', label: 'Paramètres' },
  ];

  const handleClick = (item) => {
    if (item.id === 'envoi') {
      if (onEnvoiClick) onEnvoiClick();
    } else {
      setPage(item.id);
    }
  };

  return (
    <aside className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
      <nav>
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item)}
                className={`w-full flex items-center p-3 my-1 rounded-lg font-medium transition-all duration-300 transform ${
                  page === item.id
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md'
                    : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#667eea]/80 hover:to-[#764ba2]/80 hover:translate-x-1'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
