import React, { useContext, useEffect, useState } from 'react';
import { GraphContext } from '../App';
import { GraphNode } from '../types/graph';
import MarkdownRenderer from './MarkdownRenderer';
import RelationshipPanel from './RelationshipPanel';
import { getContentPath } from '../config/paths';

interface EntityDetailViewProps {
  entityId: string;
  showRelationships?: boolean;
}

const EntityDetailView: React.FC<EntityDetailViewProps> = ({ 
  entityId, 
  showRelationships = true 
}) => {
  const { graph } = useContext(GraphContext);
  const [node, setNode] = useState<GraphNode | undefined>(undefined);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRelationshipsCollapsed, setIsRelationshipsCollapsed] = useState(false);
  const [relationships, setRelationships] = useState<{
    forward: Record<string, GraphNode[]>;
    reverse: Record<string, GraphNode[]>;
  }>({ forward: {}, reverse: {} });

  // Load node when graph and id are available
  useEffect(() => {
    if (graph && entityId) {
      const foundNode = graph.getNode(entityId);
      setNode(foundNode);
    } else {
      setNode(undefined);
    }
  }, [graph, entityId]);

  const entity = node?.data;

  // Calculate relationships
  useEffect(() => {
    if (!entityId || !graph) {
      setRelationships({ forward: {}, reverse: {} });
      return;
    }
    
    const forwardEdges = graph.getEdges(entityId);
    const reverseEdges = graph.getReverseEdges(entityId);
    
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
    
    setRelationships({ forward: forwardByType, reverse: reverseByType });
  }, [entityId, graph]);

  // Reset markdown content when ID changes
  useEffect(() => {
    setMarkdownContent(null);
  }, [entityId]);

  // Load markdown content
  useEffect(() => {
    if (!entity?.content) {
      setMarkdownContent(null);
      return;
    }

    const loadMarkdownContent = async () => {
      if (entity.content?.type === 'file' && entity.content.source) {
        setLoading(true);
        setMarkdownContent(null);
        try {
          const path = entity.content.source.startsWith('/') ? entity.content.source : `/${entity.content.source}`;
          const response = await fetch(getContentPath(path));
          if (response.ok) {
            const text = await response.text();
            if (!text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
              setMarkdownContent(text);
            } else {
              setMarkdownContent(null);
            }
          } else {
            setMarkdownContent(null);
          }
        } catch (error) {
          console.error('Failed to load markdown content:', error);
          setMarkdownContent(null);
        }
        setLoading(false);
      } else if (entity.content?.type === 'inline' && entity.content.source) {
        setMarkdownContent(entity.content.source);
      } else {
        setMarkdownContent(null);
      }
    };

    loadMarkdownContent();
  }, [entity]);

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!entity || !node) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">Entity not found</p>
          <p className="text-sm">ID: {entityId}</p>
        </div>
      </div>
    );
  }

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

  const renderEntitySpecificContent = () => {
    switch (node.type) {
      case 'pillar':
        return (
          <div className="space-y-6">
            {entity.keyFocusAreas && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Focus Areas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {entity.keyFocusAreas.map((area: string, idx: number) => (
                    <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-blue-900">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'coe':
        return (
          <div className="space-y-6">
            {entity.keyCompetencies && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {entity.keyCompetencies.map((comp: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {entity.services && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Services</h3>
                <div className="space-y-4">
                  {entity.services.map((service: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-gray-600 mt-1">{service.description}</p>
                      {service.deliverables && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700">Deliverables:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {service.deliverables.map((del: string, dIdx: number) => (
                              <span key={dIdx} className="text-xs px-2 py-1 bg-white rounded border border-gray-300">
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'platform':
      case 'accelerator':
        return (
          <div className="space-y-6">
            {entity.keyFeatures && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <div className="space-y-3">
                  {entity.keyFeatures.map((feature: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold">{feature.name}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                      {feature.businessValue && (
                        <p className="text-sm text-green-700 mt-1">→ {feature.businessValue}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full print:block print:h-auto">
      {/* Main Content - Left Side */}
      <div className="flex-1 p-6 overflow-y-auto print:overflow-visible print:p-0 print:h-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{getEntityTypeDisplay(node.type)}</span>
            {entity.category && (
              <>
                <span>•</span>
                <span>{entity.category}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{entity.name}</h1>
          <p className="text-lg text-gray-600">{entity.description}</p>
        </div>

        {/* Entity-specific content */}
        {renderEntitySpecificContent()}
        
        {/* Markdown content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : markdownContent ? (
          <div className="prose max-w-none mt-8">
            <MarkdownRenderer content={markdownContent} />
          </div>
        ) : null}
        
        {/* Relationships for Print - shown at end of content */}
        {showRelationships && (
          <div className="hidden print:block print:mt-8 print:border-t print:border-gray-200 print:pt-6">
            <RelationshipPanel 
              relationships={relationships} 
              onCollapse={undefined}
            />
          </div>
        )}
      </div>

      {/* Relationships Panel - Right Side Column (hidden in print) */}
      {showRelationships && (
        <div 
          className="border-l border-gray-200 flex-shrink-0 transition-all duration-300 flex flex-col no-print" 
          style={{ width: isRelationshipsCollapsed ? '48px' : '250px' }}
        >
          {/* Panel Content */}
          {!isRelationshipsCollapsed && (
            <RelationshipPanel 
              relationships={relationships} 
              onCollapse={() => setIsRelationshipsCollapsed(true)}
            />
          )}
          {/* Collapsed State - Just show expand button */}
          {isRelationshipsCollapsed && (
            <div className="flex-1 flex items-start pt-4">
              <button
                onClick={() => setIsRelationshipsCollapsed(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 mx-auto"
                title="Expand relationships"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntityDetailView;