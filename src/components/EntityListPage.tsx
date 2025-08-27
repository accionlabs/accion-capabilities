import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraphContext } from '../App';
import { GraphNode } from '../types/graph';
import { usePillarFilter } from '../contexts/PillarFilterContext';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  TagIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

interface EntityListPageProps {
  entityType: string;
  title: string;
  description?: string;
  showFilters?: boolean;
}

const EntityListPage: React.FC<EntityListPageProps> = ({
  entityType,
  title,
  description,
  showFilters = true
}) => {
  const { graph } = useContext(GraphContext);
  const { selectedPillars: globalSelectedPillars, isAllPillarsSelected } = usePillarFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);

  // Get all entities of the specified type, filtered by global pillar selection
  const allEntities = useMemo(() => {
    if (!graph) return [];
    return graph.findByType(entityType as any);
  }, [graph, entityType]);

  // Apply global pillar filter
  const entities = useMemo(() => {
    if (!graph || isAllPillarsSelected) return allEntities;
    
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

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entities.forEach(entity => {
      if (entity.metadata?.tags) {
        entity.metadata.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [entities]);

  // Extract all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    entities.forEach(entity => {
      if (entity.data.category) {
        categories.add(entity.data.category);
      }
    });
    return Array.from(categories).sort();
  }, [entities]);

  // Get all pillars for filtering
  const allPillars = useMemo(() => {
    if (!graph) return [];
    const pillars = graph.findByType('pillar');
    return pillars.map(p => ({ id: p.id, name: p.data.name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [graph]);

  // Filter entities based on search and tags
  const filteredEntities = useMemo(() => {
    const filtered = entities.filter(entity => {
      const matchesSearch = searchTerm === '' || 
        entity.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.data.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => entity.metadata?.tags?.includes(tag));
      
      const matchesCategories = selectedCategories.length === 0 ||
        (entity.data.category && selectedCategories.includes(entity.data.category));
      
      // Check if entity belongs to selected pillars using derived associations
      let matchesPillars = selectedPillars.length === 0;
      if (!matchesPillars && graph) {
        const associatedPillars = graph.getPillarAssociation(entity.id);
        if (associatedPillars && associatedPillars.some(pillarId => selectedPillars.includes(pillarId))) {
          matchesPillars = true;
        }
      }
      
      return matchesSearch && matchesTags && matchesCategories && matchesPillars;
    });
    
    // Sort entities by order field (if present), then by name
    return filtered.sort((a, b) => {
      // First check if either has an explicit order field
      const orderA = a.data.order ?? Number.MAX_VALUE;
      const orderB = b.data.order ?? Number.MAX_VALUE;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If no order or same order, sort alphabetically by name
      return a.data.name.localeCompare(b.data.name);
    });
  }, [entities, searchTerm, selectedTags, selectedCategories, selectedPillars, graph]);

  // Get names of selected pillars for display
  const selectedPillarNames = useMemo(() => {
    if (!graph || isAllPillarsSelected) return [];
    return globalSelectedPillars.map(pillarId => {
      const pillar = graph.getNode(pillarId);
      return pillar?.data.name || pillarId;
    });
  }, [graph, globalSelectedPillars, isAllPillarsSelected]);

  // Get pillar color for group header
  const getPillarColor = (pillarId: string): string => {
    switch (pillarId) {
      case 'pillar_automation': return 'border-blue-500 bg-blue-50';
      case 'pillar_cloud': return 'border-purple-500 bg-purple-50';
      case 'pillar_data': return 'border-green-500 bg-green-50';
      case 'pillar_digital_products': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  // Group entities by pillar when all pillars are selected
  const groupedEntities = useMemo(() => {
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'pillar': return '🏛️';
      case 'coe': return '🎯';
      case 'platform': return '🚀';
      case 'accelerator': return '⚡';
      case 'component': return '🔧';
      case 'framework': return '📐';
      case 'prototype': return '🔬';
      case 'technology': return '💻';
      case 'industry': return '🏢';
      case 'casestudy': return '📊';
      default: return '📦';
    }
  };

  const getEntityRoute = (entity: GraphNode): string => {
    const typeRouteMap: Record<string, string> = {
      'pillar': '/pillars',
      'coe': '/coes',
      'platform': '/platforms',
      'accelerator': '/accelerators',
      'component': '/components',
      'framework': '/frameworks',
      'prototype': '/prototypes',
      'technology': '/technologies',
      'industry': '/industries',
      'casestudy': '/case-studies'
    };
    
    const baseRoute = typeRouteMap[entity.type] || `/${entity.type}s`;
    return `${baseRoute}/${entity.id}`;
  };

  const getEntityMetadata = (entity: GraphNode) => {
    const metadata = [];
    
    // Add relationship counts
    const outgoingCount = graph?.getEdges(entity.id).length || 0;
    const incomingCount = graph?.getReverseEdges(entity.id).length || 0;
    
    if (outgoingCount > 0 || incomingCount > 0) {
      metadata.push(`${outgoingCount + incomingCount} connections`);
    }
    
    // Add category if exists
    if (entity.data.category) {
      metadata.push(entity.data.category);
    }
    
    // Add tags count
    if (entity.metadata?.tags?.length) {
      metadata.push(`${entity.metadata.tags.length} tags`);
    }
    
    return metadata;
  };

  if (!graph) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-baseline space-x-3">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {!isAllPillarsSelected && selectedPillarNames.length === 1 && (
            <span className="text-xl text-purple-600 font-medium">
              for {selectedPillarNames[0]}
            </span>
          )}
        </div>
        {!isAllPillarsSelected && selectedPillarNames.length > 1 && (
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Filtered by pillars:</span>
            {selectedPillarNames.map(name => (
              <span key={name} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {name}
              </span>
            ))}
          </div>
        )}
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

          </div>

          {/* Pillar Filter - only show if not pillars and pillars exist */}
          {entityType !== 'pillar' && allPillars.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by pillar:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allPillars.map(pillar => (
                  <button
                    key={pillar.id}
                    onClick={() => setSelectedPillars(prev =>
                      prev.includes(pillar.id)
                        ? prev.filter(p => p !== pillar.id)
                        : [...prev, pillar.id]
                    )}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedPillars.includes(pillar.id)
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    🏛️ {pillar.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <TagIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 15).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {allTags.length > 15 && (
                  <span className="text-sm text-gray-500 py-1">
                    +{allTags.length - 15} more tags available
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredEntities.length} of {entities.length} {title.toLowerCase()}
        {!isAllPillarsSelected && allEntities.length > entities.length && (
          <span className="text-purple-600 ml-1">
            ({allEntities.length - entities.length} hidden by pillar filter)
          </span>
        )}
      </div>

      {/* Entity Grid/List */}
      {groupedEntities ? (
        // Grouped by pillar view
        <div className="space-y-8">
          {groupedEntities.map(({ pillar, entities: groupEntities }) => (
            <div key={pillar.id}>
              <div className={`rounded-t-lg p-3 mb-4 border-b-4 ${getPillarColor(pillar.id)}`}>
                <h3 className="text-xl font-bold text-gray-900">
                  {pillar.data.name}
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({groupEntities.length} {entityType === 'coe' ? 'centers' : entityType === 'casestudy' ? 'case studies' : entityType + 's'})
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupEntities.map(entity => (
                  <Link
                    key={entity.id}
                    to={getEntityRoute(entity)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">{getEntityIcon(entity.type)}</span>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                            {entity.data.name}
                          </h3>
                        </div>
                        
                        {entity.data.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {entity.data.description}
                          </p>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {getEntityMetadata(entity).map((meta, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                              {meta}
                            </span>
                          ))}
                        </div>
                        
                        {/* Tags */}
                        {entity.metadata?.tags && entity.metadata.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {entity.metadata.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {entity.metadata.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{entity.metadata.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 ml-2 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Regular ungrouped view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map(entity => (
            <Link
              key={entity.id}
              to={getEntityRoute(entity)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{getEntityIcon(entity.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {entity.data.name}
                    </h3>
                  </div>
                  
                  {entity.data.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {entity.data.description}
                    </p>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {getEntityMetadata(entity).map((meta, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                        {meta}
                      </span>
                    ))}
                  </div>
                  
                  {/* Tags */}
                  {entity.metadata?.tags && entity.metadata.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {entity.metadata.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {entity.metadata.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{entity.metadata.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 ml-2 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredEntities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No {title.toLowerCase()} found matching your criteria.</p>
          {(searchTerm || selectedTags.length > 0 || selectedCategories.length > 0 || selectedPillars.length > 0) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTags([]);
                setSelectedCategories([]);
                setSelectedPillars([]);
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EntityListPage;