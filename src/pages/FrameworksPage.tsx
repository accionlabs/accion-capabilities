import React from 'react';
import EntityPage from './EntityPage';
const FrameworksPage: React.FC = () => {
  return (
    <EntityPage
      entityType="framework"
      title="Frameworks"
      description="Methodologies and best practices that ensure consistent, high-quality delivery across all projects"
    />
  );
};
export default FrameworksPage;