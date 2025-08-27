import React from 'react';
import EntityPage from './EntityPage';

const AcceleratorsPage: React.FC = () => {
  return (
    <EntityPage
      entityType="accelerator"
      title="Accelerators"
      description="Pre-built solutions and frameworks that accelerate time-to-market and reduce development costs"
    />
  );
};

export default AcceleratorsPage;