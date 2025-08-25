import React from 'react';
import PageHeader from './PageHeader';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="p-8">
      <PageHeader title={title} subtitle="Cette fonctionnalité est en cours de développement." />
    </div>
  );
};

export default PlaceholderPage;