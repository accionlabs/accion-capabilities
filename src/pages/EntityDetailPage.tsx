import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { GraphContext } from '../App';
import MarkdownRenderer from '../components/MarkdownRenderer';
import RelationshipPanel from '../components/RelationshipPanel';
import { GraphNode } from '../types/graph';
import { useViewMode } from '../contexts/ViewModeContext';
import SplitPanelLayout from '../components/SplitPanelLayout';
import EntityDetailView from '../components/EntityDetailView';

const EntityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { graph } = useContext(GraphContext);
  const { viewMode } = useViewMode();
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState<GraphNode | undefined>(undefined);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(id || null);

  // Extract entity type from the URL path
  const pathSegments = location.pathname.split('/');
  const entityTypeRoute = pathSegments[1]; // Get the first segment after root
  
  // Map route to entity type
  const getEntityTypeFromRoute = (route: string): string => {
    const typeMap: Record<string, string> = {
      'pillars': 'pillar',
      'coes': 'coe',
      'platforms': 'platform',
      'accelerators': 'accelerator',
      'components': 'component',
      'frameworks': 'framework',
      'prototypes': 'prototype',
      'technologies': 'technology',
      'industries': 'industry',
      'case-studies': 'casestudy'
    };
    return typeMap[route] || route;
  };
  
  const entityType = getEntityTypeFromRoute(entityTypeRoute);

  // Update selected entity when URL changes
  useEffect(() => {
    setSelectedEntityId(id || null);
  }, [id]);

  // Load node when graph and id are available
  useEffect(() => {
    if (graph && id) {
      const foundNode = graph.getNode(id);
      setNode(foundNode);
    } else {
      setNode(undefined);
    }
  }, [graph, id]);

  const entity = node?.data;
  
  
  // State for relationships
  const [relationships, setRelationships] = useState<{
    forward: Record<string, GraphNode[]>;
    reverse: Record<string, GraphNode[]>;
  }>({ forward: {}, reverse: {} });

  // Calculate relationships when graph or id changes
  useEffect(() => {
    if (!id || !graph) {
      console.log('No id or graph available');
      setRelationships({ forward: {}, reverse: {} });
      return;
    }
    
    const forwardEdges = graph.getEdges(id);
    const reverseEdges = graph.getReverseEdges(id);
    
    console.log(`Entity ${id} has ${forwardEdges.length} outgoing and ${reverseEdges.length} incoming edges`);
    
    // Group forward relationships by type
    const forwardByType: Record<string, GraphNode[]> = {};
    forwardEdges.forEach(edge => {
      const targetNode = graph.getNode(edge.to);
      if (targetNode) {
        const relType = edge.type || 'RELATED_TO';
        if (!forwardByType[relType]) {
          forwardByType[relType] = [];
        }
        forwardByType[relType].push(targetNode);
      }
    });
    
    // Group reverse relationships by type
    const reverseByType: Record<string, GraphNode[]> = {};
    reverseEdges.forEach(edge => {
      const sourceNode = graph.getNode(edge.from);
      if (sourceNode) {
        const relType = edge.type || 'RELATED_TO';
        if (!reverseByType[relType]) {
          reverseByType[relType] = [];
        }
        reverseByType[relType].push(sourceNode);
      }
    });
    
    console.log('Forward relationships:', Object.keys(forwardByType));
    console.log('Reverse relationships:', Object.keys(reverseByType));
    
    setRelationships({ forward: forwardByType, reverse: reverseByType });
  }, [id, graph]);

  // Reset markdown content when ID changes
  useEffect(() => {
    setMarkdownContent(null);
  }, [id]);

  // Load markdown content for the current entity
  useEffect(() => {
    // Clear markdown content when entity changes or when there's no content
    if (!entity?.content) {
      setMarkdownContent(null);
      return;
    }

    const loadMarkdownContent = async () => {
      if (entity.content?.type === 'file' && entity.content.source) {
        setLoading(true);
        setMarkdownContent(null); // Clear previous content while loading
        try {
          const path = entity.content.source.startsWith('/') ? entity.content.source : `/${entity.content.source}`;
          const response = await fetch(path);
          if (response.ok) {
            const text = await response.text();
            if (!text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
              setMarkdownContent(text);
            } else {
              setMarkdownContent(null); // Clear if HTML is returned
            }
          } else {
            setMarkdownContent(null); // Clear on failed fetch
          }
        } catch (error) {
          console.error('Failed to load markdown content:', error);
          setMarkdownContent(null); // Clear on error
        }
        setLoading(false);
      } else if (entity.content?.type === 'inline' && entity.content.source) {
        setMarkdownContent(entity.content.source);
      } else {
        setMarkdownContent(null); // Clear if no valid content
      }
    };

    loadMarkdownContent();
  }, [entity]);

  if (!graph) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    );
  }

  if (!entity || !node) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Entity not found</p>
        <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mt-4">
          Go Back
        </button>
      </div>
    );
  }

  // Helper to get entity route
  const getEntityRoute = (entityType: string, entityId: string) => {
    const routeMap: Record<string, string> = {
      'pillar': `/pillars/${entityId}`,
      'coe': `/coes/${entityId}`,
      'platform': `/platforms/${entityId}`,
      'accelerator': `/accelerators/${entityId}`,
      'component': `/components/${entityId}`,
      'framework': `/frameworks/${entityId}`,
      'prototype': `/prototypes/${entityId}`,
      'technology': `/technologies/${entityId}`,
      'industry': `/industries/${entityId}`,
      'casestudy': `/case-studies/${entityId}`
    };
    return routeMap[entityType] || `/${entityType}s/${entityId}`;
  };

  // Helper to get entity type display name
  const getEntityTypeDisplay = (entityType: string) => {
    const displayMap: Record<string, string> = {
      'pillar': 'Pillar',
      'coe': 'Center of Excellence',
      'platform': 'Platform',
      'accelerator': 'Accelerator',
      'component': 'Component',
      'framework': 'Framework',
      'prototype': 'Prototype',
      'technology': 'Technology',
      'industry': 'Industry',
      'casestudy': 'Case Study'
    };
    return displayMap[entityType] || entityType;
  };

  // Helper to get gradient color for header
  const getHeaderGradient = (entityType: string) => {
    const colorMap: Record<string, string> = {
      'pillar': 'from-purple-600 to-indigo-600',
      'coe': 'from-blue-600 to-purple-600',
      'platform': 'from-blue-600 to-cyan-600',
      'accelerator': 'from-green-600 to-teal-600',
      'component': 'from-purple-600 to-pink-600',
      'framework': 'from-yellow-600 to-orange-600',
      'prototype': 'from-pink-600 to-red-600',
      'technology': 'from-gray-600 to-gray-800',
      'industry': 'from-indigo-600 to-blue-600',
      'casestudy': 'from-green-600 to-emerald-600'
    };
    return colorMap[entityType] || 'from-gray-600 to-gray-800';
  };

  const renderEntitySpecificContent = () => {
    switch (node.type) {
      case 'pillar':
        return (
          <>
            {entity.keyFocusAreas && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Key Focus Areas</h2>
                <div className="flex flex-wrap gap-3">
                  {entity.keyFocusAreas.map((area: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'coe':
        return (
          <>
            {entity.keyCompetencies && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Key Competencies</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {entity.keyCompetencies.map((comp: string, idx: number) => (
                    <div key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-center">
                      {comp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.services && entity.services.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {entity.services.map((service: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      {service.deliverables && (
                        <ul className="text-sm space-y-1">
                          {service.deliverables.map((deliverable: string, dIdx: number) => (
                            <li key={dIdx} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'platform':
      case 'accelerator':
        return (
          <>
            {entity.keyFeatures && entity.keyFeatures.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {entity.keyFeatures.map((feature: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-lg mb-1">{feature.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                      {feature.businessValue && (
                        <p className="text-sm text-green-600 font-medium">{feature.businessValue}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.clientValue && entity.clientValue.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Client Value</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entity.clientValue.map((value: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.successStories && entity.successStories.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Success Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {entity.successStories.map((story: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-emerald-500 pl-4">
                      <h3 className="font-semibold text-lg mb-2">{story.client}</h3>
                      <p className="text-gray-600 mb-3">{story.outcome}</p>
                      {story.metrics && story.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {story.metrics.map((metric: any, mIdx: number) => (
                            <div key={mIdx} className="bg-emerald-50 rounded px-3 py-2">
                              <span className="text-2xl font-bold text-emerald-700">
                                {metric.value}{metric.unit}
                              </span>
                              <span className="text-sm text-emerald-600 ml-2">
                                {metric.improvement}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">{metric.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'technology':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                <p className="text-lg font-semibold capitalize">{entity.category}</p>
              </div>
              {entity.vendor && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Vendor</h3>
                  <p className="text-lg font-semibold">{entity.vendor}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Open Source</h3>
                <p className="text-lg font-semibold">{entity.isOpenSource ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Partnership</h3>
                <p className="text-lg font-semibold">{entity.isPartnership ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        );

      case 'casestudy':
        return (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Case Study Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Client</h3>
                  <p className="text-lg">{entity.clientName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Challenge</h3>
                  <p className="text-gray-600">{entity.challenge}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Solution</h3>
                  <p className="text-gray-600">{entity.solution}</p>
                </div>
              </div>
            </div>

            {entity.outcomes && entity.outcomes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Outcomes</h2>
                <div className="space-y-4">
                  {entity.outcomes.map((outcome: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold mb-1">{outcome.description}</h3>
                      <p className="text-gray-600 text-sm">{outcome.impact}</p>
                      {outcome.measuredValue && (
                        <p className="text-green-600 font-medium mt-1">{outcome.measuredValue}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  // Handle entity selection (for split view)
  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId);
    navigate(`/${entityTypeRoute}/${entityId}`);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go to previous route in history
  };

  // Get page title and description based on entity type
  const getPageInfo = () => {
    const infoMap: Record<string, { title: string; description: string }> = {
      'pillar': { title: 'Pillars', description: 'Our foundational pillars that drive innovation and transformation across the organization' },
      'coe': { title: 'Centers of Excellence', description: 'Specialized teams with deep expertise delivering innovative solutions across technology domains' },
      'platform': { title: 'Platforms', description: 'Enterprise-grade platforms that accelerate digital transformation and enable innovation at scale' },
      'accelerator': { title: 'Accelerators', description: 'Pre-built solutions and frameworks that accelerate time-to-market and reduce development costs' },
      'component': { title: 'Components', description: 'Building blocks and microservices that enable rapid application development and ensure consistency across projects' },
      'framework': { title: 'Frameworks', description: 'Methodologies and best practices that ensure consistent, high-quality delivery across all projects' },
      'prototype': { title: 'Prototypes', description: 'Cutting-edge proof-of-concepts and experimental solutions exploring emerging technologies' },
      'technology': { title: 'Technologies', description: 'Core technologies and tools that power our solutions and capabilities' },
      'industry': { title: 'Industries', description: 'Specialized solutions and expertise across key industry segments' },
      'casestudy': { title: 'Case Studies', description: 'Success stories demonstrating real-world impact' }
    };
    return infoMap[entityType] || { title: 'Entities', description: '' };
  };

  const { title, description } = getPageInfo();

  // If in split view mode, show the split panel layout
  if (viewMode === 'split') {
    // Create the left panel with entity list
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

    // Create the right panel with entity detail
    const rightPanel = selectedEntityId ? (
      <EntityDetailView entityId={selectedEntityId} showRelationships={true} />
    ) : null;

    // Get the selected entity name for the right panel title
    const getSelectedEntityName = () => {
      if (!selectedEntityId || !graph) return "Details";
      const selectedNode = graph.getNode(selectedEntityId);
      return selectedNode?.data?.name || "Details";
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
  }

  // Grid view mode - show standard detail page
  return (
    <div className="print:block print:p-8">
      {/* Header - Hidden for print */}
      <div className={`bg-gradient-to-r ${getHeaderGradient(node.type)} rounded-lg p-8 text-white mb-8 no-print`}>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {getEntityTypeDisplay(node.type)}
          </span>
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-200 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>
        <h1 className="text-4xl font-bold mb-4">{entity.name}</h1>
        <p className="text-xl">{entity.description}</p>
        {entity.strategicValue && (
          <p className="mt-4 text-lg italic">{entity.strategicValue}</p>
        )}
      </div>

      {/* Print-only header */}
      <div className="hidden print:block print:mb-8">
        <div className="text-sm text-gray-600 mb-2">{getEntityTypeDisplay(node.type)}</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{entity.name}</h1>
        <p className="text-lg text-gray-700">{entity.description}</p>
        {entity.strategicValue && (
          <p className="mt-4 text-base italic text-gray-600">{entity.strategicValue}</p>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8 print:w-full">
          {/* Entity-specific content */}
          {renderEntitySpecificContent()}

          {/* Markdown Content */}
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          )}

          {markdownContent && !loading && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <MarkdownRenderer content={markdownContent} />
            </div>
          )}
        </div>

        {/* Relationships Panel - Right Column (hidden in print) */}
        <div className="lg:col-span-1 no-print">
          <RelationshipPanel relationships={relationships} />
        </div>
        
        {/* Relationships for Print - shown at end of content */}
        <div className="hidden print:block print:mt-8 print:border-t print:border-gray-200 print:pt-6">
          <RelationshipPanel relationships={relationships} onCollapse={undefined} />
        </div>
      </div>
    </div>
  );
};

// List component with selection for split view
const EntityListWithSelection: React.FC<{
  entityType: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ entityType, selectedId, onSelect }) => {
  const { graph } = useContext(GraphContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!graph) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const entities = graph.findByType(entityType as any);
  
  // Filter and sort entities
  const filteredEntities = entities.filter(entity => {
    if (!entity.data?.name) return false;
    return searchTerm === '' || 
      entity.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.data.description?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    const orderA = a.data?.order ?? Number.MAX_VALUE;
    const orderB = b.data?.order ?? Number.MAX_VALUE;
    if (orderA !== orderB) return orderA - orderB;
    const nameA = a.data?.name || '';
    const nameB = b.data?.name || '';
    return nameA.localeCompare(nameB);
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

export default EntityDetailPage;