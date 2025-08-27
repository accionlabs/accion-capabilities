import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getBasePath } from './config/paths';
import { CapabilityGraph } from './services/CapabilityGraph';
import { CapabilityQueryBuilder } from './services/CapabilityQueryBuilder';
import { DataLoaderV2 } from './services/DataLoaderV2';
import HomePage from './pages/HomePage';
import PillarsPage from './pages/PillarsPage';
import CoEsPage from './pages/CoEsPage';
import PlatformsPage from './pages/PlatformsPage';
import AcceleratorsPage from './pages/AcceleratorsPage';
import ComponentsPage from './pages/ComponentsPage';
import FrameworksPage from './pages/FrameworksPage';
import PrototypesPage from './pages/PrototypesPage';
import EntityDetailPage from './pages/EntityDetailPage';
import TechnologiesPage from './pages/TechnologiesPage';
import IndustriesPage from './pages/IndustriesPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import IndustryIntelligencePage from './pages/IndustryIntelligencePage';
import TestPage from './pages/TestPage';
import TestGraphPage from './pages/TestGraphPage';
import AppLayoutVertical from './components/AppLayoutVertical';
import PlatformsSplitView from './pages/PlatformsSplitView';
import { ViewModeProvider } from './contexts/ViewModeContext';
import { PillarFilterProvider } from './contexts/PillarFilterContext';
import './App.css';

export const GraphContext = React.createContext<{
  graph: CapabilityGraph | null;
  queryBuilder: CapabilityQueryBuilder | null;
}>({ graph: null, queryBuilder: null });

function App() {
  const [graph, setGraph] = useState<CapabilityGraph | null>(null);
  const [queryBuilder, setQueryBuilder] = useState<CapabilityQueryBuilder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGraph = async () => {
      try {
        const capabilityGraph = new CapabilityGraph();
        const dataLoader = new DataLoaderV2(capabilityGraph);
        
        // Load data from folder structure
        await dataLoader.loadAllData();
        
        const qb = new CapabilityQueryBuilder(capabilityGraph);
        
        setGraph(capabilityGraph);
        setQueryBuilder(qb);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize graph:', err);
        setError('Failed to load capability data');
        setLoading(false);
      }
    };

    initializeGraph();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading capabilities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <GraphContext.Provider value={{ graph, queryBuilder }}>
      <ViewModeProvider>
        <PillarFilterProvider>
          <Router basename={getBasePath()}>
            <Routes>
            <Route path="/" element={<AppLayoutVertical />}>
            <Route index element={<HomePage />} />
            {/* Entity pages that handle both list and detail views */}
            <Route path="pillars" element={<PillarsPage />} />
            <Route path="pillars/:id" element={<PillarsPage />} />
            
            <Route path="coes" element={<CoEsPage />} />
            <Route path="coes/:id" element={<CoEsPage />} />
            
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="platforms/:id" element={<PlatformsPage />} />
            
            <Route path="accelerators" element={<AcceleratorsPage />} />
            <Route path="accelerators/:id" element={<AcceleratorsPage />} />
            
            <Route path="components" element={<ComponentsPage />} />
            <Route path="components/:id" element={<ComponentsPage />} />
            
            <Route path="frameworks" element={<FrameworksPage />} />
            <Route path="frameworks/:id" element={<FrameworksPage />} />
            
            <Route path="prototypes" element={<PrototypesPage />} />
            <Route path="prototypes/:id" element={<PrototypesPage />} />
            
            <Route path="technologies" element={<TechnologiesPage />} />
            <Route path="technologies/:id" element={<TechnologiesPage />} />
            
            <Route path="industries" element={<IndustriesPage />} />
            <Route path="industries/:id" element={<IndustriesPage />} />
            
            <Route path="industry-intelligence" element={<IndustryIntelligencePage />} />
            
            <Route path="case-studies" element={<CaseStudiesPage />} />
            <Route path="case-studies/:id" element={<CaseStudiesPage />} />
            
            <Route path="test" element={<TestPage />} />
            <Route path="test-graph" element={<TestGraphPage />} />
          </Route>
        </Routes>
      </Router>
        </PillarFilterProvider>
      </ViewModeProvider>
    </GraphContext.Provider>
  );
}

export default App;