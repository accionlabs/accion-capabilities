import React from 'react';
import EntityPage from './EntityPage';
const ComponentsPage: React.FC = () => {
  return (
    <EntityPage
      entityType="component"
      title="Components"
      description="Building blocks and microservices that enable rapid application development and ensure consistency across projects"
    />
  );
};
export default ComponentsPage;