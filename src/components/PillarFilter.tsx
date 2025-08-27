import React, { useContext, useMemo } from 'react';
import { GraphContext } from '../App';
import { usePillarFilter } from '../contexts/PillarFilterContext';
import { FunnelIcon } from '@heroicons/react/24/solid';

interface PillarFilterProps {
  isCollapsed?: boolean;
}

const PillarFilter: React.FC<PillarFilterProps> = ({ isCollapsed = false }) => {
  const { graph } = useContext(GraphContext);
  const { selectedPillars, togglePillar, isAllPillarsSelected } = usePillarFilter();

  // Get pillars in correct order (sorted by order field)
  const pillars = useMemo(() => {
    if (!graph) return [];
    const pillarNodes = graph.findByType('pillar' as any);
    // Sort by order field, then by name as fallback
    return pillarNodes.sort((a, b) => {
      const orderA = a.data.order || 999;
      const orderB = b.data.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.data.name || '').localeCompare(b.data.name || '');
    });
  }, [graph]);

  const getPillarColor = (pillarId: string): string => {
    switch (pillarId) {
      case 'pillar_automation': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pillar_cloud': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'pillar_data': return 'text-green-600 bg-green-50 border-green-200';
      case 'pillar_digital_products': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRadioColor = (pillarId: string, isSelected: boolean): { border: string; dot: string } => {
    if (!isSelected) {
      return { border: 'border-gray-300', dot: '' };
    }
    switch (pillarId) {
      case 'pillar_automation': return { border: 'border-blue-600', dot: 'bg-blue-600' };
      case 'pillar_cloud': return { border: 'border-purple-600', dot: 'bg-purple-600' };
      case 'pillar_data': return { border: 'border-green-600', dot: 'bg-green-600' };
      case 'pillar_digital_products': return { border: 'border-orange-600', dot: 'bg-orange-600' };
      default: return { border: 'border-gray-600', dot: 'bg-gray-600' };
    }
  };

  if (isCollapsed) {
    // Collapsed view - show icon with indicator
    const activeCount = isAllPillarsSelected ? 0 : selectedPillars.length;
    return (
      <div className="px-2 py-2">
        <div className="relative">
          <FunnelIcon className={`w-5 h-5 ${activeCount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Pillar</h3>
      </div>
      
      <div className="space-y-1">
        {/* All Pillars option */}
        <label className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${
          isAllPillarsSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
        }`}>
          <div className="flex items-center justify-center w-4 h-4">
            <input
              type="radio"
              name="pillar-filter"
              checked={isAllPillarsSelected}
              onChange={() => togglePillar('all')}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              isAllPillarsSelected ? 'border-indigo-600' : 'border-gray-300'
            }`}>
              {isAllPillarsSelected && (
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">All Pillars</span>
        </label>

        {/* Individual pillars */}
        {pillars.map(pillar => {
          const isSelected = selectedPillars.length === 1 && selectedPillars[0] === pillar.id;
          const radioColors = getRadioColor(pillar.id, isSelected);
          
          return (
            <label
              key={pillar.id}
              className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${
                isSelected ? getPillarColor(pillar.id) : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center w-4 h-4">
                <input
                  type="radio"
                  name="pillar-filter"
                  checked={isSelected}
                  onChange={() => togglePillar(pillar.id)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${radioColors.border}`}>
                  {isSelected && (
                    <div className={`w-2 h-2 rounded-full ${radioColors.dot}`} />
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {pillar.data.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PillarFilter;