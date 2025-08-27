import React from 'react';
import { useViewMode } from '../contexts/ViewModeContext';
import { 
  Squares2X2Icon,
  ViewColumnsIcon 
} from '@heroicons/react/24/outline';

interface ViewToggleProps {
  entityType?: string; // Optional, for potential future use
}

const ViewToggle: React.FC<ViewToggleProps> = ({ entityType }) => {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <button
        onClick={() => setViewMode('grid')}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-colors ${
          viewMode === 'grid'
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        title="Grid View"
      >
        <Squares2X2Icon className="h-4 w-4" />
        <span className="text-sm font-medium">Grid</span>
      </button>
      
      <button
        onClick={() => setViewMode('split')}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-colors ${
          viewMode === 'split'
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        title="Split View"
      >
        <ViewColumnsIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Split</span>
      </button>
    </div>
  );
};

export default ViewToggle;