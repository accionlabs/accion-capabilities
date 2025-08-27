import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  defaultLeftWidth?: number; // pixels
  minLeftWidth?: number; // pixels
  maxLeftWidth?: number; // pixels
  leftTitle?: string;
  rightTitle?: string;
  onBack?: () => void;
}

const SplitPanelLayout: React.FC<SplitPanelLayoutProps> = ({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 400,
  minLeftWidth = 300,
  maxLeftWidth = 600,
  leftTitle = "Browse",
  rightTitle = "Details",
  onBack
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle resizing for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get the container element (parent of the split panels)
      const container = document.querySelector('.split-panel-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      
      if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  // Toggle collapse for desktop
  const toggleLeftPanel = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
  };

  // Reset to default width
  const resetWidth = () => {
    setLeftWidth(defaultLeftWidth);
    setIsLeftCollapsed(false);
  };

  // Mobile: Switch between views when detail content is available
  useEffect(() => {
    if (isMobile && rightPanel) {
      setMobileView('detail');
    }
  }, [isMobile, rightPanel]);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center text-gray-500 hover:text-gray-700"
                title="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center space-x-2 ${mobileView === 'list' ? 'text-blue-600' : 'text-gray-600'}`}
            >
              <Bars3Icon className="h-5 w-5" />
              <span className="font-medium">List</span>
            </button>
          </div>
          
          {rightPanel && (
            <button
              onClick={() => setMobileView('detail')}
              className={`flex items-center space-x-2 ${mobileView === 'detail' ? 'text-blue-600' : 'text-gray-600'}`}
            >
              <span className="font-medium">Detail</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full transition-transform duration-300" 
               style={{ transform: `translateX(${mobileView === 'list' ? '0' : '-100%'})` }}>
            {/* List Panel */}
            <div className="w-full flex-shrink-0 overflow-y-auto">
              {leftPanel}
            </div>
            
            {/* Detail Panel */}
            <div className="w-full flex-shrink-0 overflow-y-auto">
              {rightPanel || (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Select an item to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Dots */}
        {rightPanel && (
          <div className="bg-white border-t border-gray-200 py-2 flex justify-center space-x-2">
            <button
              onClick={() => setMobileView('list')}
              className={`w-2 h-2 rounded-full ${mobileView === 'list' ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
            <button
              onClick={() => setMobileView('detail')}
              className={`w-2 h-2 rounded-full ${mobileView === 'detail' ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  const actualLeftWidth = isLeftCollapsed ? 50 : leftWidth;
  
  return (
    <div className="flex h-full split-panel-container print:block print:h-auto print:overflow-visible">
      {/* Left Panel */}
      <div 
        className="bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 no-print"
        style={{ width: `${actualLeftWidth}px` }}
      >
        {/* Left Panel Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {!isLeftCollapsed && (
            <h2 className="font-semibold text-gray-900">{leftTitle}</h2>
          )}
          <div className="flex items-center space-x-1">
            {!isLeftCollapsed && (
              <button
                onClick={resetWidth}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                title="Reset width"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={toggleLeftPanel}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              title={isLeftCollapsed ? "Expand" : "Collapse"}
            >
              {isLeftCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Left Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {!isLeftCollapsed ? (
            leftPanel
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      {!isLeftCollapsed && (
        <div
          className={`w-1 hover:w-2 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-all no-print ${
            isDragging ? 'bg-blue-500 w-2' : ''
          }`}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden print:w-full print:overflow-visible print:h-auto">
        {/* Right Panel Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between print:border-0 no-print">
          <h2 className="font-semibold text-gray-900">{rightTitle}</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors no-print"
              title="Go back"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
        </div>

        {/* Right Panel Content */}
        <div className="flex-1 overflow-y-auto bg-white print:overflow-visible print:p-8">
          {rightPanel || (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No item selected</p>
                <p className="text-sm">Select an item from the list to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitPanelLayout;