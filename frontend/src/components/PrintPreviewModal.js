// Fichier : frontend/src/components/PrintPreviewModal.js
import React from 'react';

const PrintPreviewModal = ({ isOpen, onClose, title, children, type = 'rapport' }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printArea = document.getElementById('print-area-content');
    if (!printArea) return;

    const printWindow = window.open('', '_blank');

    let headContent = '';

    if (type === 'rapport') {
      // CSS externe pour les rapports
      headContent = `<link rel="stylesheet" href="/document-styles.css" />`;
    } else if (type === 'facture') {
      // CSS interne pour les factures
      headContent = `
        <style>
          body { font-family: "Times New Roman", serif; margin:0; padding:0; color:#000; }
          .company-info-unified { font-size:11px; line-height:1.2; color:#010e5e; text-align:center; margin:0; padding:2px 0 0 0; }
          .company-header { text-align:center; margin:0; padding:0; }
          .company-logo { height:60px; width:auto; vertical-align:baseline; position:relative; top:0.5em; }
          .company-name { font-size:35px; font-weight:bold; color:#010e5e; display:inline-block; vertical-align:baseline; margin-left:10px; }
          .content { margin:40px; }
          .facture-title { font-size:20px; font-weight:bold; margin:0 0 10px 0; text-align:center; text-decoration:underline; }
          .details { font-size:14px; margin-bottom:15px; }
          .details p { margin:3px 0; }
          table { width:100%; border-collapse:collapse; margin-top:10px; margin-bottom:20px; font-size:14px; }
          table th, table td { border:1px solid #000; padding:6px; text-align:center; }
          table th { background:#eaeaea; }
          th.denomination, td.denomination { width:40%; text-align:left; padding-left:6px; }
          th.quantite, td.quantite { width:10%; }
          th.prix, td.prix { width:20%; }
          th.total, td.total { width:17.5%; }
          .bank { font-size:13px; margin-top:20px; line-height:1.3; }
          .bank p { margin:0; padding:0; }
          .weights { font-size:13px; line-height:1.3; margin-top:10px; }
          .weights p { margin:0; padding:0; line-height:1.3; text-align:left; }
          .footer.print-only { display:block; position:fixed; bottom:0; left:0; right:0; padding:10px 40px; background-color:#8c9cff; color:#000; border-top:none; text-align:center; }
          @media print {
            body { margin:0; }
            .header.print-only { display:block; position:fixed; top:5px; left:0; right:0; text-align:center; padding:10px 40px 2px 40px; background:#fff; border-bottom:1px solid #010e5e; }
            .content { margin:140px 40px 160px 40px; }
            .weights.print-only { display:block; position:fixed; bottom:70px; left:40px; right:40px; background:#fff; padding-bottom:10px; }
            .weights.print-only p { margin:0; padding:0; line-height:1.3; text-align:left; }
            .footer.print-only { display:block; position:fixed; bottom:0; left:0; right:0; padding:10px 40px; background-color:#8c9cff; color:#000; border-top:none; text-align:center; }
          }
        </style>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          ${headContent}
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-gray-800/75 flex justify-center items-start z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl animate-fade-in-up">
        <div className="no-print bg-gray-100 p-3 flex justify-between items-center border-b sticky top-0">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">🖨️ Lancer l'impression</button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Fermer</button>
          </div>
        </div>
        <div id="print-area-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
