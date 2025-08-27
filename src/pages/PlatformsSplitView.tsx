import React from 'react';
import SplitViewPage from './SplitViewPage';

const PlatformsSplitView: React.FC = () => {
  return (
    <SplitViewPage
      entityType="platform"
      title="Platform Portfolio"
      description="Enterprise-grade platforms that accelerate digital transformation"
      groupBy="none"
    />
  );
};

export default PlatformsSplitView;