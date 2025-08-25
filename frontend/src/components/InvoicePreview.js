import React from 'react';

const InvoicePreview = ({ data }) => {
  const formatCurrency = val =>
    typeof val === 'number'
      ? val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
      : '0,00';

  const totalFOB = data.lignes.reduce((sum, l) => sum + (l.quantite * l.prix || 0), 0);
  const poidsNet = (parseFloat(data.poidsBrut || 0) - parseFloat(data.tare || 0));

  return (
    <div className="bg-white shadow-lg p-10 border border-gray-200 font-sans">
      <div className="flex justify-center items-center gap-4">
        <div>
          <img src="/logo.png" alt="VINA EXPORT SARLU Logo" className="h-20 w-auto" />
        </div>
        <div className="text-left">
          <h2 className="text-2xl font-bold" style={{ color: '#06026a' }}>VINA EXPORT SARLU</h2>
          <p className="text-xs">
            SARLU au capital de 2.000.000 ariary - NIF : 4019364331 - STAT : 46625412025000948 - RCS MAHAJANGA : 2025B00036
          </p>
          <p className="text-xs">TEL : +261 37 58 370 49 - E-MAIL : heri.razafii@gmail.com</p>
        </div>
      </div>

      <div className="w-full h-1 bg-gray-800 my-4"></div>

      <h3 className="text-center text-xl font-bold my-6 tracking-widest">FACTURE</h3>

      <div className="grid grid-cols-2 gap-x-8 text-sm mb-6">
        <div className="space-y-1">
          <p><strong>DATE :</strong> {data.dateFacture ? new Date(data.dateFacture).toLocaleDateString('fr-FR') : ''}</p>
          <p><strong>FACTURE No. :</strong> {data.numeroFacture}</p>
          <p><strong>CLIENT :</strong> {data.client?.nom}</p>
          <p><strong>NATURE DU PRODUIT :</strong> {data.natureProduit}</p>
        </div>
        <div className="space-y-1">
          <p><strong>PAYS D’ORIGINE :</strong> {data.paysOrigine}</p>
          <p><strong>COMPAGNIE MARITIME :</strong> {data.compagnieMaritime}</p>
          <p><strong>PORT D’EMBARQUEMENT :</strong> {data.portEmbarquement}</p>
          <p><strong>NOMENCLATURE DOUANIÈRE :</strong> {data.nomenclatureDouaniere}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-6 border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border border-gray-400 text-left">DÉSIGNATION</th>
            <th className="p-2 border border-gray-400 text-center">QUANTITÉ</th>
            <th className="p-2 border border-gray-400 text-right">PRIX UNIT USD – F.O.B</th>
            <th className="p-2 border border-gray-400 text-right">TOTAL F.O.B USD</th>
          </tr>
        </thead>
        <tbody>
          {data.lignes.map(l => (
            <tr key={l.id}>
              <td className="p-2 border border-gray-400">{l.description}</td>
              <td className="p-2 border border-gray-400 text-center">{l.quantite}</td>
              <td className="p-2 border border-gray-400 text-right font-mono">{formatCurrency(l.prix)}</td>
              <td className="p-2 border border-gray-400 text-right font-mono">{formatCurrency(l.quantite * l.prix)}</td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-100">
            <td colSpan="3" className="p-2 border border-gray-400 text-right">TOTAL</td>
            <td className="p-2 border border-gray-400 text-right font-mono">{formatCurrency(totalFOB)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-8 text-sm">
        <p><strong>Poids Brut :</strong> {data.poidsBrut} Kg</p>
        <p><strong>Tare :</strong> {data.tare} Kg</p>
        <p><strong>Poids Net :</strong> {poidsNet} Kg</p>
      </div>

      <div className="text-center mt-10 pt-4 border-t border-gray-300 text-xs text-gray-500">
        <p><strong>Siège social :</strong> Lot Secteur 01 Centre A - AMBOROVY - MAHAJANGA 401 - MADAGASCAR</p>
        <p>+261 37 58 370 49 | heri.razafii@gmail.com</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
