// Fichier : frontend/src/components/PrintPreviewModal.js

import React from 'react';

const PrintPreviewModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    // La nouvelle logique est que le contenu est déjà du HTML complet
    const printArea = document.getElementById('print-area-content');
    if (!printArea) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printArea.innerHTML); // On écrit directement le HTML reçu
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
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