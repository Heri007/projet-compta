// src/components/WorkflowStep.js

import React from 'react';

const WorkflowStep = ({ icon, title, isLastStep = false }) => {
  return (
    <div className="flex flex-col items-center">
      {/* L'icône et le titre de l'étape */}
      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full shadow-md">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-700">{title}</p>

      {/* La flèche vers le bas, sauf pour la dernière étape */}
      {!isLastStep && (
        <div className="mt-2 text-2xl text-gray-300">
          ↓
        </div>
      )}
    </div>
  );
};

export default WorkflowStep;