import React from 'react';
import PageHeader from '../components/PageHeader';
import WidgetCard from '../components/WidgetCard';

// Petit composant réutilisable pour les lignes d'information détaillées
const InfoDetail = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-mono text-gray-800">{value}</p>
    </div>
);

const EntreprisePage = () => {
    const headerGradientClass = "px-4 py-3 font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2]";

  return (
    <div className="p-8">
      <PageHeader 
        title="Profil de l'Entreprise" 
        subtitle="Détails légaux, fiscaux et bancaires de votre société." 
      />

      {/* --- CARTE D'EN-TÊTE PRINCIPALE (MISE À JOUR) --- */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border-l-4 border-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
            
            {/* Colonne de gauche : Nom de l'entreprise et du gérant */}
            <div>
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight" style={{ color: '#06026a' }}>
                    VINA EXPORT SARLU
                </h2>
                <div className="mt-2">
                    <p className="text-lg font-bold text-gray-700">
                        RAZAFINDRALAMBO Heriniaina
                    </p>
                    <p className="text-sm italic text-gray-500">
                        Associé unique & Gérant
                    </p>
                </div>
            </div>

            {/* Colonne de droite : Contacts */}
            <div className="mt-4 md:mt-0 text-left md:text-right space-y-1 text-gray-700">
                <p className="flex items-center justify-start md:justify-end">
                    <span className="text-lg mr-2" role="img" aria-label="Email">📧</span>
                    <a href="mailto:heri.razafii@gmail.com" className="hover:underline">heri.razafii@gmail.com</a>
                </p>
                <p className="flex items-center justify-start md:justify-end">
                    <span className="text-lg mr-2" role="img" aria-label="Contact">📞</span>
                    <a href="tel:+261375837049" className="hover:underline">+261 37 58 370 49</a>
                </p>
            </div>
        </div>
        <div className="border-t mt-4 pt-4 text-gray-600">
            <p className="font-semibold">Siège Social :</p>
            <p>Secteur 01 Centra A - AMBOROVY, MAHAJANGA 401, MADAGASCAR</p>
        </div>
      </div>


      {/* --- GRILLE D'INFORMATIONS DÉTAILLÉES (INCHANGÉE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <WidgetCard title="Immatriculation" headerClassName={headerGradientClass}>
            <div className="space-y-4">
                <InfoDetail label="NIF" value="4019364331" />
                <InfoDetail label="STAT" value="46625412025000948" />
                <InfoDetail label="RCS MAHAJANGA" value="2025B00036" />
            </div>
        </WidgetCard>

        <WidgetCard title="Coordonnées Bancaires" headerClassName={headerGradientClass}>
            <div className="space-y-3 text-gray-700">
                <h4 className="font-semibold text-lg">Bank of Africa (B.O.A)</h4>
                <ul className="space-y-2 text-sm">
                    <li><strong>Compte :</strong><br/><span className="font-mono">00009 03000 25040520003 55</span></li>
                    <li><strong>IBAN :</strong><br/><span className="font-mono">MG46 0000 9030 0025 0405 2000 355</span></li>
                    <li><strong>SWIFT :</strong><br/><span className="font-mono">AFRIMGMGXXX</span></li>
                </ul>
            </div>
        </WidgetCard>

        <WidgetCard title="Objet Social" headerClassName={headerGradientClass}>
            <div className="space-y-3 text-sm text-gray-700">
                <p>✓ Achat-vente locale et exportation de pierres industrielles brutes, taillées et fines.</p>
                <p>✓ Achat-vente locale et exportation de produits locaux (Grains secs).</p>
            </div>
        </WidgetCard>

      </div>
    </div>
  );
};

export default EntreprisePage;