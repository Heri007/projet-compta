import React from 'react';

const PrintPreviewModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    // Déclenche la boîte de dialogue d'impression du navigateur
    window.print();
  };

  return (
    // Le fond de la modale
    <div className="fixed inset-0 bg-gray-800/75 flex justify-center items-start z-50 overflow-y-auto p-8">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl animate-fade-in-up">
        
        {/* Barre d'outils - ne sera pas imprimée grâce à la classe "no-print" */}
        <div className="no-print bg-gray-100 p-3 flex justify-between items-center border-b sticky top-0">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              🖨️ Imprimer
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
        
        {/* Zone de contenu qui sera imprimée */}
        <div id="print-area" className="p-8">
            {/* Le contenu du rapport est injecté ici */}
            {children}
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;