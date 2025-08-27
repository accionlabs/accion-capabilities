import React from 'react';
import EntityPage from './EntityPage';
const TechnologiesPage: React.FC = () => {
  return (
    <EntityPage
      entityType="technology"
      title="Technologies"
      description="Core technologies and tools that power our solutions and capabilities"
    />
  );
};
export default TechnologiesPage;