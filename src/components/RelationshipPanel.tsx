import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraphNode } from '../types/graph';

interface RelationshipPanelProps {
  relationships: {
    forward: Record<string, GraphNode[]>;
    reverse: Record<string, GraphNode[]>;
  };
  onCollapse?: () => void;
}

const RelationshipPanel: React.FC<RelationshipPanelProps> = ({ relationships, onCollapse }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getEntityRoute = (type: string, id: string) => {
    const routeMap: Record<string, string> = {
      'pillar': `/pillars/${id}`,
      'coe': `/coes/${id}`,
      'platform': `/platforms/${id}`,
      'accelerator': `/accelerators/${id}`,
      'component': `/components/${id}`,
      'framework': `/frameworks/${id}`,
      'prototype': `/prototypes/${id}`,
      'technology': `/technologies/${id}`,
      'industry': `/industries/${id}`,
      'casestudy': `/case-studies/${id}`
    };
    return routeMap[type] || `/${type}s/${id}`;
  };

  const getEntityIcon = (type: string) => {
    const icons: Record<string, string> = {
      'pillar': '🏛️',
      'coe': '🎯',
      'platform': '⚙️',
      'accelerator': '🚀',
      'component': '🧩',
      'framework': '📋',
      'prototype': '💡',
      'technology': '🔧',
      'industry': '🏢',
      'casestudy': '📊'
    };
    return icons[type] || '📦';
  };

  const getEntityColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      'pillar': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
      'coe': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
      'platform': { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
      'accelerator': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
      'component': { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700' },
      'framework': { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
      'prototype': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
      'technology': { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700' },
      'industry': { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
      'casestudy': { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' }
    };
    return colors[type] || { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700' };
  };

  const getRelationshipIcon = (relType: string) => {
    const icons: Record<string, string> = {
      'BELONGS_TO': '↗️',
      'USES': '🔗',
      'IMPLEMENTS': '⚡',
      'TARGETS': '🎯',
      'LEVERAGES': '💪',
      'DELIVERS': '📦',
      'DELIVERED_BY': '📥',
      'DEPENDS_ON': '🔄',
      'RELATED_TO': '↔️',
      'SERVES': '🤝',
      'ORCHESTRATES': '🎼',
      'HOSTS': '🏠',
      'EXTENDS': '🔌',
      'ENABLES': '✨'
    };
    return icons[relType] || '→';
  };

  const getRelationshipLabel = (relType: string, direction: 'forward' | 'reverse') => {
    const labels: Record<string, { forward: string; reverse: string }> = {
      'BELONGS_TO': { forward: 'Belongs To', reverse: 'Contains' },
      'USES': { forward: 'Uses', reverse: 'Used By' },
      'IMPLEMENTS': { forward: 'Implements', reverse: 'Implemented By' },
      'TARGETS': { forward: 'Targets', reverse: 'Targeted By' },
      'LEVERAGES': { forward: 'Leverages', reverse: 'Leveraged By' },
      'DELIVERS': { forward: 'Delivers', reverse: 'Delivered By' },
      'DELIVERED_BY': { forward: 'Delivered By', reverse: 'Delivers' },
      'DEPENDS_ON': { forward: 'Depends On', reverse: 'Required By' },
      'RELATED_TO': { forward: 'Related To', reverse: 'Related To' },
      'SERVES': { forward: 'Serves', reverse: 'Served By' },
      'ORCHESTRATES': { forward: 'Orchestrates', reverse: 'Orchestrated By' },
      'HOSTS': { forward: 'Hosts', reverse: 'Hosted By' },
      'EXTENDS': { forward: 'Extends', reverse: 'Extended By' },
      'ENABLES': { forward: 'Enables', reverse: 'Enabled By' }
    };
    return labels[relType]?.[direction] || relType;
  };

  const renderRelationshipSection = (
    relType: string,
    nodes: GraphNode[],
    direction: 'forward' | 'reverse'
  ) => {
    const sectionId = `${direction}-${relType}`;
    const isExpanded = expandedSections.has(sectionId) || nodes.length <= 3;
    
    // Sort nodes to prioritize case studies for technology "Used By" relationships
    const sortedNodes = [...nodes].sort((a, b) => {
      // Case studies come first
      if (a.type === 'casestudy' && b.type !== 'casestudy') return -1;
      if (a.type !== 'casestudy' && b.type === 'casestudy') return 1;
      // Then sort alphabetically by name
      return (a.data?.name || '').localeCompare(b.data?.name || '');
    });
    
    const displayNodes = isExpanded ? sortedNodes : sortedNodes.slice(0, 3);

    return (
      <div key={relType} className="mb-4">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full text-left mb-2 flex items-center justify-between hover:bg-gray-50 p-1 rounded-lg transition"
        >
          <div className="flex items-center gap-1">
            <span className="text-sm">{getRelationshipIcon(relType)}</span>
            <span className="font-semibold text-sm text-gray-700">
              {getRelationshipLabel(relType, direction)}
            </span>
            <span className="text-xs text-gray-500">({nodes.length})</span>
          </div>
          {nodes.length > 3 && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        <div className="space-y-2">
          {displayNodes.map((node) => {
            const colors = getEntityColor(node.type);
            return (
              <Link
                key={node.id}
                to={getEntityRoute(node.type, node.id)}
                className={`block p-2 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-1">
                  <span className="text-sm flex-shrink-0">{getEntityIcon(node.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                        {node.type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {node.data.name}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                      {node.data.description}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
          
          {!isExpanded && nodes.length > 3 && (
            <button
              onClick={() => toggleSection(sectionId)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Show {nodes.length - 3} more...
            </button>
          )}
        </div>
      </div>
    );
  };

  const hasRelationships = Object.keys(relationships.forward).length > 0 || 
                          Object.keys(relationships.reverse).length > 0;

  if (!hasRelationships) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Relationships
          </h2>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
              title="Collapse panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm">No relationships found for this entity.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header - Fixed */}
      <div className="border-b border-gray-200 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Relationships
          </h2>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
              title="Collapse panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Connected entities in the knowledge graph
        </p>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Outgoing Relationships */}
        {Object.keys(relationships.forward).length > 0 && (
          <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Outgoing Connections</h3>
          </div>
          
          {Object.entries(relationships.forward).map(([relType, nodes]) =>
            renderRelationshipSection(relType, nodes, 'forward')
          )}
        </div>
      )}

      {/* Incoming Relationships */}
      {Object.keys(relationships.reverse).length > 0 && (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Incoming Connections</h3>
          </div>
          
          {Object.entries(relationships.reverse).map(([relType, nodes]) =>
            renderRelationshipSection(relType, nodes, 'reverse')
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default RelationshipPanel;