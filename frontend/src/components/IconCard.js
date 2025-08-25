import React from 'react';

const IconCard = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-100 transition-colors w-full">
    <span className="text-4xl">{icon}</span>
    <span className="text-sm font-semibold text-gray-600 mt-1">{label}</span>
  </button>
);

export default IconCard;