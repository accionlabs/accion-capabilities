import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useViewMode } from '../contexts/ViewModeContext';
import { usePillarFilter } from '../contexts/PillarFilterContext';
import EntityListPage from '../components/EntityListPage';
import SplitPanelLayout from '../components/SplitPanelLayout';
import EntityDetailView from '../components/EntityDetailView';
import { useContext } from 'react';
import { GraphContext } from '../App';

interface EntityPageProps {
  entityType: string;
  title: string;
  description?: string;
}

const EntityPage: React.FC<EntityPageProps> = ({
  entityType,
  title,
  description
}) => {
  const { viewMode } = useViewMode();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { graph } = useContext(GraphContext);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(id || null);

  // Update selected entity when URL changes
  useEffect(() => {
    setSelectedEntityId(id || null);
  }, [id]);

  // Determine the base route for this entity type
  const getBaseRoute = () => {
    const routeMap: Record<string, string> = {
      'pillar': 'pillars',
      'coe': 'coes',
      'platform': 'platforms',
      'accelerator': 'accelerators',
      'component': 'components',
      'framework': 'frameworks',
      'prototype': 'prototypes',
      'technology': 'technologies',
      'industry': 'industries',
      'casestudy': 'case-studies'
    };
    return routeMap[entityType] || `${entityType}s`;
  };

  // Handle entity selection (for split view)
  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId);
    const baseRoute = getBaseRoute();
    navigate(`/${baseRoute}/${entityId}`);
  };

  // Handle back navigation
  const handleBack = () => {
    // Check if we can go back in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, go to home
      navigate('/');
    }
  };

  // Grid View Mode
  if (viewMode === 'grid') {
    // If we have an ID, we're on a detail page, show EntityDetailView
    if (id) {
      return <EntityDetailView entityId={id} showRelationships={true} />;
    }

    // Otherwise show the list
    return (
      <EntityListPage
        entityType={entityType}
        title={title}
        description={description}
        showFilters={true}
      />
    );
  }

  // Split View Mode
  const leftPanel = (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      
      <EntityListWithSelection
        entityType={entityType}
        selectedId={selectedEntityId}
        onSelect={handleEntitySelect}
      />
    </div>
  );

  const rightPanel = selectedEntityId ? (
    <EntityDetailView entityId={selectedEntityId} showRelationships={true} />
  ) : null;

  // Get the selected entity name for the right panel title
  const getSelectedEntityName = () => {
    if (!selectedEntityId || !graph) return "Details";
    const entity = graph.getNode(selectedEntityId);
    return entity?.data?.name || "Details";
  };

  return (
    <SplitPanelLayout
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      defaultLeftWidth={400}
      minLeftWidth={300}
      maxLeftWidth={600}
      leftTitle={title}
      rightTitle={getSelectedEntityName()}
      onBack={handleBack}
    />
  );
};

// List component with selection for split view
const EntityListWithSelection: React.FC<{
  entityType: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ entityType, selectedId, onSelect }) => {
  const { graph } = useContext(GraphContext);
  const { selectedPillars: globalSelectedPillars, isAllPillarsSelected } = usePillarFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get all entities of the type
  const allEntities = graph ? graph.findByType(entityType as any) : [];
  
  // Get names of selected pillars for display
  const selectedPillarNames = React.useMemo(() => {
    if (!graph || isAllPillarsSelected) return [];
    return globalSelectedPillars.map(pillarId => {
      const pillar = graph.getNode(pillarId);
      return pillar?.data.name || pillarId;
    });
  }, [graph, globalSelectedPillars, isAllPillarsSelected]);
  
  // Filter entities by global pillar selection
  const entities = useMemo(() => {
    if (!graph || isAllPillarsSelected) return allEntities;
    
    // Filter by pillar associations
    return allEntities.filter(entity => {
      // For CoEs, check direct BELONGS_TO relationship
      if (entityType === 'coe') {
        const edges = graph.getEdges(entity.id);
        const belongsTo = edges.find(e => e.type === 'BELONGS_TO');
        return belongsTo && globalSelectedPillars.includes(belongsTo.to);
      }
      
      // For other entities, check pillar associations
      const pillarAssociations = graph.getPillarAssociation(entity.id);
      return pillarAssociations && pillarAssociations.some(pillarId => globalSelectedPillars.includes(pillarId));
    });
  }, [allEntities, graph, globalSelectedPillars, isAllPillarsSelected, entityType]);

  // Get pillar color for group header
  const getPillarColor = (pillarId: string): string => {
    switch (pillarId) {
      case 'pillar_automation': return 'text-blue-600 bg-blue-50';
      case 'pillar_cloud': return 'text-purple-600 bg-purple-50';
      case 'pillar_data': return 'text-green-600 bg-green-50';
      case 'pillar_digital_products': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Extract unique tags
  const allTags = React.useMemo(() => {
    if (!graph) return [];
    const tags = new Set<string>();
    entities.forEach(entity => {
      if (entity.metadata?.tags) {
        entity.metadata.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort().slice(0, 10); // Limit to 10 for space
  }, [entities]);

  // Extract categories
  const allCategories = React.useMemo(() => {
    if (!graph) return [];
    const categories = new Set<string>();
    entities.forEach(entity => {
      if (entity.data.category) {
        categories.add(entity.data.category);
      }
    });
    return Array.from(categories).sort();
  }, [entities, graph]);

  // Get pillars in correct order (by order field)
  const allPillars = React.useMemo(() => {
    if (!graph) return [];
    const pillars = graph.findByType('pillar');
    return pillars
      .sort((a, b) => {
        const orderA = a.data.order || 999;
        const orderB = b.data.order || 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.data.name || '').localeCompare(b.data.name || '');
      })
      .map(p => ({ id: p.id, name: p.data.name }));
  }, [graph]);
  
  // Filter and sort entities
  const filteredEntities = React.useMemo(() => {
    if (!graph) return [];
    const filtered = entities.filter(entity => {
      if (!entity.data?.name) return false;
      
      const matchesSearch = searchTerm === '' || 
        entity.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.data.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => entity.metadata?.tags?.includes(tag));
      
      const matchesCategories = selectedCategories.length === 0 ||
        (entity.data.category && selectedCategories.includes(entity.data.category));
      
      // Check pillar filter using derived associations
      let matchesPillars = selectedPillars.length === 0;
      if (!matchesPillars) {
        const associatedPillars = graph.getPillarAssociation(entity.id);
        if (associatedPillars && associatedPillars.some(pillarId => selectedPillars.includes(pillarId))) {
          matchesPillars = true;
        }
      }
      
      return matchesSearch && matchesTags && matchesCategories && matchesPillars;
    });
    
    return filtered.sort((a, b) => {
      const orderA = a.data?.order ?? Number.MAX_VALUE;
      const orderB = b.data?.order ?? Number.MAX_VALUE;
      if (orderA !== orderB) return orderA - orderB;
      const nameA = a.data?.name || '';
      const nameB = b.data?.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [entities, searchTerm, selectedTags, selectedCategories, selectedPillars, graph]);

  // Group entities by pillar when all pillars are selected
  const groupedEntities = React.useMemo(() => {
    if (!graph || !isAllPillarsSelected || entityType === 'pillar') {
      return null; // Don't group if filtering or if showing pillars themselves
    }

    const groups: Record<string, typeof filteredEntities> = {};
    const pillarOrder: Record<string, number> = {};
    
    // Get pillars in order
    const pillars = graph.findByType('pillar' as any);
    const sortedPillars = pillars.sort((a, b) => {
      const orderA = a.data.order || 999;
      const orderB = b.data.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.data.name || '').localeCompare(b.data.name || '');
    });
    
    // Build pillar order map
    sortedPillars.forEach((pillar, index) => {
      pillarOrder[pillar.id] = index;
      groups[pillar.id] = [];
    });
    
    // Add "Other" group for entities without pillar association
    groups['other'] = [];
    pillarOrder['other'] = sortedPillars.length;
    
    // Group entities by their pillar association
    filteredEntities.forEach(entity => {
      if (entityType === 'coe') {
        // For CoEs, check direct BELONGS_TO relationship
        const edges = graph.getEdges(entity.id);
        const belongsTo = edges.find(e => e.type === 'BELONGS_TO');
        if (belongsTo && groups[belongsTo.to]) {
          groups[belongsTo.to].push(entity);
        } else {
          groups['other'].push(entity);
        }
      } else {
        // For other entities, use pillar associations
        const pillarAssociations = graph.getPillarAssociation(entity.id);
        if (pillarAssociations && pillarAssociations.length > 0) {
          // If entity belongs to multiple pillars, add it to each one
          pillarAssociations.forEach(pillarId => {
            if (groups[pillarId]) {
              groups[pillarId].push(entity);
            }
          });
        } else {
          groups['other'].push(entity);
        }
      }
    });
    
    // Return sorted groups with pillar names
    const result: Array<{ pillar: any, entities: typeof filteredEntities }> = [];
    
    Object.keys(groups)
      .sort((a, b) => pillarOrder[a] - pillarOrder[b])
      .forEach(pillarId => {
        if (groups[pillarId].length > 0) {
          const pillar = pillarId === 'other' 
            ? { id: 'other', data: { name: 'Other' } }
            : graph.getNode(pillarId);
          
          if (pillar) {
            result.push({
              pillar,
              entities: groups[pillarId]
            });
          }
        }
      });
    
    return result;
  }, [graph, isAllPillarsSelected, filteredEntities, entityType]);

  if (!graph) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Active Pillar Filter Display */}
      {!isAllPillarsSelected && selectedPillarNames.length > 0 && (
        <div className="flex items-center space-x-2 px-1">
          <span className="text-xs text-gray-600 font-medium">Showing for:</span>
          {selectedPillarNames.map(name => (
            <span key={name} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {name}
            </span>
          ))}
        </div>
      )}
      
      {/* Search and Filter Toggle */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
            showFilters || selectedTags.length > 0 || selectedCategories.length > 0 || selectedPillars.length > 0
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Filters ({selectedTags.length + selectedCategories.length + selectedPillars.length})
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          {/* Pillar Filter */}
          {entityType !== 'pillar' && allPillars.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Pillars:</div>
              <div className="flex flex-wrap gap-1">
                {allPillars.map(pillar => (
                  <button
                    key={pillar.id}
                    onClick={() => setSelectedPillars(prev =>
                      prev.includes(pillar.id)
                        ? prev.filter(p => p !== pillar.id)
                        : [...prev, pillar.id]
                    )}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      selectedPillars.includes(pillar.id)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pillar.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Categories:</div>
              <div className="flex flex-wrap gap-1">
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Tags:</div>
              <div className="flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(selectedTags.length > 0 || selectedCategories.length > 0 || selectedPillars.length > 0) && (
            <button
              onClick={() => {
                setSelectedTags([]);
                setSelectedCategories([]);
                setSelectedPillars([]);
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-xs text-gray-600">
        Showing {filteredEntities.length} of {entities.length} items
        {!isAllPillarsSelected && allEntities.length > entities.length && (
          <span className="text-purple-600">
            {' '}({allEntities.length - entities.length} filtered by pillar)
          </span>
        )}
      </div>

      {/* Entity List */}
      {groupedEntities ? (
        // Grouped by pillar view
        <div className="space-y-4">
          {groupedEntities.map(({ pillar, entities: groupEntities }) => (
            <div key={pillar.id}>
              <div className={`text-xs font-bold px-2 py-1 rounded-t ${getPillarColor(pillar.id)}`}>
                {pillar.data.name} ({groupEntities.length})
              </div>
              <div className="space-y-1 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b p-1">
                {groupEntities.map(entity => (
                  <button
                    key={entity.id}
                    onClick={() => onSelect(entity.id)}
                    className={`w-full text-left p-2 rounded-lg border transition-all ${
                      selectedId === entity.id
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {entity.data.name}
                    </div>
                    {entity.data.description && (
                      <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                        {entity.data.description}
                      </div>
                    )}
                    {entity.metadata?.tags && entity.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entity.metadata.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {entity.metadata.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{entity.metadata.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Regular ungrouped view
        <div className="space-y-1">
          {filteredEntities.map(entity => (
            <button
              key={entity.id}
              onClick={() => onSelect(entity.id)}
              className={`w-full text-left p-2 rounded-lg border transition-all ${
                selectedId === entity.id
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="font-medium text-sm text-gray-900">
                {entity.data.name}
              </div>
              {entity.data.description && (
                <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                  {entity.data.description}
                </div>
              )}
              {entity.metadata?.tags && entity.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entity.metadata.tags.slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                  {entity.metadata.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{entity.metadata.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {filteredEntities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items found
        </div>
      )}
    </div>
  );
};

export default EntityPage;