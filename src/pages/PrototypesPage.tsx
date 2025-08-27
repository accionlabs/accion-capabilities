import React from 'react';
import EntityPage from './EntityPage';
const PrototypesPage: React.FC = () => {
  return (
    <EntityPage
      entityType="prototype"
      title="Prototypes"
      description="Cutting-edge proof-of-concepts and experimental solutions exploring emerging technologies"
    />
  );
};
export default PrototypesPage;