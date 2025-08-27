import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GraphContext } from '../App';
import SplitPanelLayout from '../components/SplitPanelLayout';
import EntityListPage from '../components/EntityListPage';
import EntityDetailView from '../components/EntityDetailView';

interface SplitViewPageProps {
  entityType: string;
  title: string;
  description?: string;
  groupBy?: 'none' | 'category' | 'parent';
}

const SplitViewPage: React.FC<SplitViewPageProps> = ({
  entityType,
  title,
  description,
  groupBy = 'none'
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { graph } = useContext(GraphContext);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(id || null);

  // Update selected entity when URL changes
  useEffect(() => {
    setSelectedEntityId(id || null);
  }, [id]);

  // Determine the base route from entity type
  const getBaseRoute = (type: string) => {
    const routeMap: Record<string, string> = {
      'pillar': 'pillars-split',
      'coe': 'coes-split',
      'platform': 'platforms-split',
      'accelerator': 'accelerators-split',
      'component': 'components-split',
      'framework': 'frameworks-split',
      'prototype': 'prototypes-split',
      'technology': 'technologies-split',
      'industry': 'industries-split',
      'casestudy': 'case-studies-split'
    };
    return routeMap[type] || `${type}s-split`;
  };

  // Handle entity selection
  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId);
    // Update URL to maintain state - use replace to avoid building up history
    const baseRoute = getBaseRoute(entityType);
    navigate(`/${baseRoute}/${entityId}`, { replace: true });
  };

  // Create a modified EntityListPage that handles selection
  const leftPanel = (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      
      {/* We'll create a custom list component that handles selection */}
      <EntityListWithSelection
        entityType={entityType}
        selectedId={selectedEntityId}
        onSelect={handleEntitySelect}
        groupBy={groupBy}
      />
    </div>
  );

  // Right panel shows entity details
  const rightPanel = selectedEntityId ? (
    <EntityDetailView entityId={selectedEntityId} />
  ) : null;

  return (
    <SplitPanelLayout
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      defaultLeftWidth={35}
      minLeftWidth={25}
      maxLeftWidth={50}
    />
  );
};

// Custom component for entity list with selection handling
const EntityListWithSelection: React.FC<{
  entityType: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  groupBy?: 'none' | 'category' | 'parent';
}> = ({ entityType, selectedId, onSelect, groupBy = 'none' }) => {
  const { graph } = useContext(GraphContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!graph) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const entities = graph.findByType(entityType as any);
  
  // Filter entities
  const filteredEntities = entities.filter(entity => {
    return searchTerm === '' || 
      entity.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.data.description?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_VALUE;
    const orderB = b.data.order ?? Number.MAX_VALUE;
    if (orderA !== orderB) return orderA - orderB;
    return a.data.name.localeCompare(b.data.name);
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {/* Entity List */}
      <div className="space-y-2">
        {filteredEntities.map(entity => (
          <button
            key={entity.id}
            onClick={() => onSelect(entity.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedId === entity.id
                ? 'bg-blue-50 border-blue-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="font-medium text-gray-900">
              {entity.data.name}
            </div>
            {entity.data.description && (
              <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                {entity.data.description}
              </div>
            )}
            {entity.metadata?.tags && entity.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entity.metadata.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items found
        </div>
      )}
    </div>
  );
};

export default SplitViewPage;