import React from 'react';

const InvoicePreview = ({ facture }) => {
  // --- Vérification de sécurité ---
  if (!facture) {
    return <p>Chargement des données de la facture...</p>;
  }
  
  // Fonction pour formater les devises
  const formatCurrency = (val) =>
    typeof val === 'number'
      ? val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
      : '0,00';

  // Fonction pour calculer le total (utilise l'optional chaining `?.` pour plus de sécurité)
  const totalFOB = facture.lignes?.reduce(
    (sum, l) => sum + ((parseFloat(l.quantite) || 0) * (parseFloat(l.prix) || 0)),
    0
  ) || 0;

// Fonction pour formater les poids (ne pas afficher 0 ou les décimales)
const formatPoids = (val) => {
  const num = parseInt(val, 10);
  if (isNaN(num) || num === 0) return ''; // Retourne une chaîne vide si 0 ou invalide
  return num; // Retourne le nombre entier
};

  return (
    <div className="bg-white shadow-lg p-8 border border-gray-200 font-sans">
      {/* --- HEADER (déjà correct) --- */}
      <div className="text-center mb-4 pb-4 border-b border-gray-300">
        <img src="/logo.png" alt="VINA EXPORT SARLU Logo" className="h-20 w-auto mx-auto mb-2" />
        <p><strong>VINA EXPORT SARLU</strong></p>
        <p className="text-xs">SARLU au capital de 2.000.000 ariary - NIF : 4019364331 - STAT : 46625412025000948 - RCS MAHAJANGA : 2025B00036</p>
        <p className="text-xs">TEL : +261 37 58 370 49 - E-MAIL : heri.razafii@gmail.com</p>
      </div>

      <h2 className="text-center text-xl font-bold my-6 tracking-widest">FACTURE</h2>

      {/* --- INFORMATIONS FACTURE (déjà correct) --- */}
      <div className="grid grid-cols-2 gap-x-8 text-sm mb-6">
        <div className="space-y-1">
          <p><strong>DATE :</strong> {facture.date_facture ? new Date(facture.date_facture).toLocaleDateString('fr-FR') : ''}</p>
          <p><strong>FACTURE No. :</strong> {facture.numero_facture || 'Généré par le système'}</p>
          <p><strong>CLIENT :</strong> {facture.client_nom || 'Non renseigné'}</p>
          <p><strong>NATURE DU PRODUIT :</strong> {facture.nature_produit || ''}</p>
        </div>
        <div className="space-y-1">
          <p><strong>PAYS D'ORIGINE :</strong> {facture.pays_origine || ''}</p>
          <p><strong>COMPAGNIE MARITIME :</strong> {facture.compagnie_maritime || ''}</p>
          <p><strong>PORT D'EMBARQUEMENT :</strong> {facture.port_embarquement || ''}</p>
          <p><strong>NOMENCLATURE DOUANIÈRE :</strong> {facture.nomenclature_douaniere || ''}</p>
        </div>
      </div>

      {/* --- TABLE LIGNES DE PRODUITS (déjà correct) --- */}
      <table className="w-full text-sm mb-6 border-collapse border border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border border-gray-400 text-left">DÉSIGNATION</th>
            <th className="p-2 border border-gray-400 text-center">QUANTITÉ</th>
            <th className="p-2 border border-gray-400 text-right">PRIX UNIT USD – F.O.B</th>
            <th className="p-2 border border-gray-400 text-right">TOTAL F.O.B USD</th>
          </tr>
        </thead>
        <tbody>
          {facture.lignes && facture.lignes.length > 0 ? (
            facture.lignes.map((l, i) => {
              const quantite = parseFloat(l.quantite) || 0;
              const prix = parseFloat(l.prix) || 0;
              const total = quantite * prix;
              return (
                <tr key={i}>
                  <td className="p-2 border border-gray-400">{l.description || 'Produit non renseigné'}</td>
                  <td className="p-2 border border-gray-400 text-center">{quantite}</td>
                  <td className="p-2 border border-gray-400 text-right font-mono">{formatCurrency(prix)}</td>
                  <td className="p-2 border border-gray-400 text-right font-mono">{formatCurrency(total)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="p-2 border border-gray-400 text-center italic">Aucune ligne de produit.</td>
            </tr>
          )}
          <tr className="font-bold bg-gray-100">
            <td colSpan="3" className="p-2 border border-gray-400 text-right">TOTAL</td>
            <td className="p-2 border border-gray-400 text-right font-mono">{formatCurrency(totalFOB)}</td>
          </tr>
        </tbody>
      </table>

      {/* --- CORRECTION : Ancien bloc "POIDS" supprimé --- */}
      {/* <div className="mt-4 text-sm"> ... </div> */}

      {/* --- INFORMATIONS BANCAIRES ET POIDS (déjà correct) --- */}
      <div className="mt-8 text-sm space-y-4">
        <div>
            <p><strong>Coordonnées Bancaires:</strong> Bank of Africa (B.O.A)</p>
            <p className="pl-4"><strong>Compte :</strong> 00009 03000 25040520003 55</p>
            <p className="pl-4"><strong>IBAN :</strong> MG46 0000 9030 0025 0405 2000 355</p>
            <p className="pl-4"><strong>SWIFT :</strong> AFRIMGMGXXX</p>
        </div>
        <div>
            <p><strong>DOMICILIATION N° & DATE:</strong> {facture.domiciliation || ''}</p>
        </div>
        <div className="pt-4">
            <p><strong>Poids Brut:</strong> {formatPoids(facture.poids_brut)}</p>
            <p><strong>Tare:</strong> {formatPoids(facture.tare)}</p>
            <p><strong>Poids Net:</strong> {formatPoids(facture.poids_net)}</p>
        </div>
      </div>

      {/* --- FOOTER (déjà correct) --- */}
      <div className="text-center mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
        <p><strong>Siège social :</strong> Lot Secteur 01 Centre A - AMBOROVY - MAHAJANGA 401 - MADAGASCAR</p>
        <p>+261 37 58 370 49 | heri.razafii@gmail.com</p>
      </div>
    </div>
  );
};

export default InvoicePreview;