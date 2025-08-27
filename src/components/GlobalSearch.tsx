import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraphContext } from '../App';
import { GraphNode } from '../types/graph';

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GraphNode[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { graph } = useContext(GraphContext);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!graph || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = graph.search(query);
    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsOpen(searchResults.length > 0);
  }, [query, graph]);

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

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'pillar': 'Pillar',
      'coe': 'CoE',
      'platform': 'Platform',
      'accelerator': 'Accelerator',
      'component': 'Component',
      'framework': 'Framework',
      'prototype': 'Prototype',
      'technology': 'Technology',
      'industry': 'Industry',
      'casestudy': 'Case Study'
    };
    return labels[type] || type;
  };

  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      'pillar': 'bg-purple-100 text-purple-700',
      'coe': 'bg-blue-100 text-blue-700',
      'platform': 'bg-cyan-100 text-cyan-700',
      'accelerator': 'bg-green-100 text-green-700',
      'component': 'bg-pink-100 text-pink-700',
      'framework': 'bg-yellow-100 text-yellow-700',
      'prototype': 'bg-red-100 text-red-700',
      'technology': 'bg-gray-100 text-gray-700',
      'industry': 'bg-indigo-100 text-indigo-700',
      'casestudy': 'bg-emerald-100 text-emerald-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const handleSelect = (node: GraphNode) => {
    navigate(getEntityRoute(node.type, node.id));
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto" style={{ zIndex: 999 }}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search capabilities, technologies, case studies..."
          className="w-full px-4 py-3 pr-10 text-gray-700 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition"
        />
        <svg
          className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => handleSelect(node)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getEntityColor(node.type)}`}>
                      {getEntityTypeLabel(node.type)}
                    </span>
                    <h3 className="font-semibold text-gray-900">{node.data.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{node.data.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;