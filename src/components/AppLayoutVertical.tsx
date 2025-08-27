import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ViewToggle from './ViewToggle';
import { useViewMode } from '../contexts/ViewModeContext';
import PillarFilter from './PillarFilter';
import { 
  HomeIcon, 
  CubeIcon,
  AcademicCapIcon, 
  RocketLaunchIcon, 
  CpuChipIcon, 
  DocumentTextIcon,
  BeakerIcon,
  MicrophoneIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AppLayoutVertical: React.FC = () => {
  const location = useLocation();
  const { viewMode } = useViewMode();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = React.useState(false);

  const navGroups = [
    {
      title: 'Analytics & Insights',
      items: [
        { path: '/', label: 'Pillar Analysis', icon: HomeIcon },
        { path: '/industry-intelligence', label: 'Industry Intelligence', icon: ChartBarIcon }
      ]
    },
    {
      title: 'Capability Catalog',
      items: [
        { path: '/pillars', label: 'Strategic Pillars', icon: CubeIcon },
        { path: '/coes', label: 'Centers of Excellence', icon: AcademicCapIcon },
        { path: '/platforms', label: 'Platforms', icon: RocketLaunchIcon },
        { path: '/accelerators', label: 'Accelerators', icon: CpuChipIcon },
        { path: '/components', label: 'Components', icon: DocumentTextIcon },
        { path: '/frameworks', label: 'Frameworks', icon: BookOpenIcon },
        { path: '/prototypes', label: 'Prototypes', icon: BeakerIcon },
        { path: '/technologies', label: 'Technologies', icon: MicrophoneIcon },
        { path: '/industries', label: 'Industries', icon: BuildingOfficeIcon },
        { path: '/case-studies', label: 'Case Studies', icon: DocumentTextIcon }
      ]
    }
  ];

  return (
    <div className={`${viewMode === 'split' ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50 flex print:h-auto print:overflow-visible print:block`}>
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 no-print">
        <div className="flex flex-col transition-all duration-300" style={{ width: isNavCollapsed ? '64px' : '250px' }}>
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4 mb-2">
              {!isNavCollapsed && (
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Accion Capabilities Graph
                </h1>
              )}
              <button
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
              >
                {isNavCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* View Mode Toggle */}
            {!isNavCollapsed && (
              <div className="px-4 mt-6 mb-4">
                <ViewToggle />
              </div>
            )}
            
            <div className="mt-4 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-6">
                {navGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {!isNavCollapsed && (
                      <div className="px-2 mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {group.title}
                        </h3>
                      </div>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                            title={isNavCollapsed ? item.label : undefined}
                          >
                            <Icon 
                              className={`${isNavCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                              }`} 
                            />
                            {!isNavCollapsed && item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
              
              {/* Pillar Filter */}
              <PillarFilter isCollapsed={isNavCollapsed} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-gray-600 ${sidebarOpen ? 'opacity-75' : 'opacity-0'} transition-opacity`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Accion Capabilities
              </h1>
            </div>
            
            {/* View Mode Toggle for Mobile */}
            <div className="px-4 mt-6 mb-4">
              <ViewToggle />
            </div>
            
            <nav className="mt-4 px-2 space-y-6">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="px-2 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <Icon 
                            className={`mr-3 h-6 w-6 flex-shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                            }`} 
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            
            {/* Pillar Filter for Mobile */}
            <PillarFilter isCollapsed={false} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 ${viewMode === 'split' ? 'overflow-hidden' : ''} print:overflow-visible print:h-auto`}>
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-10 bg-white shadow no-print">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Accion Capabilities
              </h1>
              <div className="w-14" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className={`flex-1 flex flex-col ${viewMode === 'split' ? 'overflow-hidden' : ''} print:overflow-visible print:h-auto`}>
          {viewMode === 'split' ? (
            // Split view - use full width and height
            <div className="flex-1 overflow-hidden print:overflow-visible print:h-auto">
              <Outlet />
            </div>
          ) : (
            // Grid view - constrain width for better readability
            <div className="py-6 print:py-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
                <Outlet />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        {viewMode !== 'split' && (
          <footer className="bg-gray-800 text-white no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="text-center">
                <p className="text-xs">© 2024 Accion Labs. Transforming businesses through innovation.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default AppLayoutVertical;