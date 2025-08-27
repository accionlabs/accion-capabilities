import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraphNode } from '../types/graph';
import { usePillarFilter } from '../contexts/PillarFilterContext';
import {
  ChartBarIcon,
  CubeIcon,
  BeakerIcon,
  CogIcon,
  LightBulbIcon,
  ServerIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface PillarSummaryProps {
  pillar: GraphNode;
  counts: Record<string, number>;
  total: number;
}

const PillarSummary: React.FC<PillarSummaryProps> = ({ pillar, counts, total }) => {
  const navigate = useNavigate();
  const { setSelectedPillars } = usePillarFilter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'coe': return <BeakerIcon className="w-4 h-4" />;
      case 'platform': return <ServerIcon className="w-4 h-4" />;
      case 'accelerator': return <LightBulbIcon className="w-4 h-4" />;
      case 'component': return <CubeIcon className="w-4 h-4" />;
      case 'framework': return <CogIcon className="w-4 h-4" />;
      case 'prototype': return <BeakerIcon className="w-4 h-4" />;
      case 'technology': return <CpuChipIcon className="w-4 h-4" />;
      case 'industry': return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'casestudy': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <BriefcaseIcon className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'coe': return 'Centers of Excellence';
      case 'platform': return 'Platforms';
      case 'accelerator': return 'Accelerators';
      case 'component': return 'Components';
      case 'framework': return 'Frameworks';
      case 'prototype': return 'Prototypes';
      case 'technology': return 'Technologies';
      case 'industry': return 'Industries';
      case 'casestudy': return 'Case Studies';
      default: return type.charAt(0).toUpperCase() + type.slice(1) + 's';
    }
  };

  const getPillarColor = (pillarId: string): string => {
    switch (pillarId) {
      case 'pillar_automation': return 'bg-blue-500';
      case 'pillar_cloud': return 'bg-purple-500';
      case 'pillar_data': return 'bg-green-500';
      case 'pillar_digital_products': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPillarBgColor = (pillarId: string): string => {
    switch (pillarId) {
      case 'pillar_automation': return 'bg-blue-50 border-blue-200';
      case 'pillar_cloud': return 'bg-purple-50 border-purple-200';
      case 'pillar_data': return 'bg-green-50 border-green-200';
      case 'pillar_digital_products': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getEntityPath = (type: string): string => {
    switch (type) {
      case 'coe': return '/coes';
      case 'platform': return '/platforms';
      case 'accelerator': return '/accelerators';
      case 'component': return '/components';
      case 'framework': return '/frameworks';
      case 'prototype': return '/prototypes';
      case 'technology': return '/technologies';
      case 'industry': return '/industries';
      case 'casestudy': return '/case-studies';
      default: return `/${type}s`;
    }
  };

  const handleEntityClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Set the pillar filter to only show this pillar
    setSelectedPillars([pillar.id]);
    // Navigate to the entity list page
    navigate(getEntityPath(type));
  };

  // Display entity types in navigation order
  const entityOrder = ['coe', 'platform', 'accelerator', 'component', 'framework', 'prototype', 'technology', 'industry', 'casestudy'];
  const sortedCounts: [string, number][] = entityOrder
    .filter(type => counts[type] && counts[type] > 0)
    .map(type => [type, counts[type]]);

  return (
    <div className={`rounded-lg p-6 border-2 ${getPillarBgColor(pillar.id)} hover:shadow-lg transition-shadow print:break-inside-avoid`}>
      <Link to={`/pillars/${pillar.id}`} className="block mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">{pillar.data.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{pillar.data.description?.substring(0, 100)}...</p>
          </div>
          <div className={`${getPillarColor(pillar.id)} text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold`}>
            {total}
          </div>
        </div>
      </Link>

      <div className="space-y-2">
        {sortedCounts.map(([type, count]) => (
          <button
            key={type}
            onClick={(e) => handleEntityClick(e, type)}
            className="w-full flex items-center justify-between bg-white bg-opacity-60 rounded px-3 py-2 hover:bg-opacity-80 transition-colors"
          >
            <div className="flex items-center space-x-2 text-gray-700">
              {getIcon(type)}
              <span className="text-sm font-medium">{getTypeLabel(type)}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{count}</span>
          </button>
        ))}
      </div>

      {sortedCounts.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No associated entities yet
        </div>
      )}

      {pillar.data.keyFocusAreas && pillar.data.keyFocusAreas.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Key Focus Areas:</div>
          <div className="flex flex-wrap gap-1">
            {pillar.data.keyFocusAreas.map((area: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-70"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PillarSummary;