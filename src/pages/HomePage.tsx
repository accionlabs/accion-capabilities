import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraphContext } from '../App';
import { useViewMode } from '../contexts/ViewModeContext';
import GlobalSearch from '../components/GlobalSearch';
import PillarSummary from '../components/PillarSummary';

const HomePage: React.FC = () => {
  const { graph, queryBuilder } = useContext(GraphContext);
  const { viewMode } = useViewMode();

  // Get statistics
  const stats = graph?.getStatistics();

  // Get pillar summaries
  const pillarSummaries = useMemo(() => {
    if (!graph) return [];
    const summaries = graph.getPillarSummaries();
    // Sort by order field from pillar data
    return Array.from(summaries.values()).sort((a, b) => {
      const orderA = (a.pillar.data as any).order || 999;
      const orderB = (b.pillar.data as any).order || 999;
      return orderA - orderB;
    });
  }, [graph]);

  // Wrap in scrollable container for split view mode
  const content = (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-white">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">
            Accion Labs Capabilities
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Transforming enterprises through innovative technology solutions, 
            cutting-edge platforms, and deep domain expertise across industries.
          </p>
          {/* Search Bar - needs to overlay content below */}
          <div className="relative z-50">
            <GlobalSearch />
          </div>
        </div>
      </section>

      {/* Pillar Summaries */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Our Strategic Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {pillarSummaries.map(summary => (
            <PillarSummary
              key={summary.pillar.id}
              pillar={summary.pillar}
              counts={summary.counts}
              total={summary.total}
            />
          ))}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Centers of Excellence</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.nodesByType.coe || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">IP Assets</h3>
          <p className="text-3xl font-bold text-gray-900">
            {(stats?.nodesByType.platform || 0) + 
             (stats?.nodesByType.accelerator || 0) + 
             (stats?.nodesByType.component || 0) +
             (stats?.nodesByType.framework || 0) +
             (stats?.nodesByType.prototype || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Technologies</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.nodesByType.technology || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Industries Served</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.nodesByType.industry || 0}
          </p>
        </div>
      </section>

      {/* Capability Categories */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Our Capability Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Pillars */}
          <Link to="/pillars" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.pillar || 0}
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Strategic Pillars</h3>
              <p className="text-gray-600 mb-4">
                Core focus areas driving our innovation and expertise
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                Explore Pillars →
              </span>
            </div>
          </Link>

          {/* Centers of Excellence */}
          <Link to="/coes" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.coe || 0}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Centers of Excellence</h3>
              <p className="text-gray-600 mb-4">
                Deep expertise across technology domains and industries
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                Explore CoEs →
              </span>
            </div>
          </Link>

          {/* Platforms */}
          <Link to="/platforms" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.platform || 0}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Platforms</h3>
              <p className="text-gray-600 mb-4">
                Enterprise-grade platforms driving digital transformation
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                Explore Platforms →
              </span>
            </div>
          </Link>

          {/* Accelerators */}
          <Link to="/accelerators" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-green-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.accelerator || 0}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Accelerators</h3>
              <p className="text-gray-600 mb-4">
                Pre-built solutions for rapid time-to-market
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                View Accelerators →
              </span>
            </div>
          </Link>

          {/* Components */}
          <Link to="/components" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-cyan-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.component || 0}
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Components</h3>
              <p className="text-gray-600 mb-4">
                Reusable building blocks for application development
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                Browse Components →
              </span>
            </div>
          </Link>

          {/* Frameworks */}
          <Link to="/frameworks" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-yellow-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.framework || 0}
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Frameworks</h3>
              <p className="text-gray-600 mb-4">
                Proven methodologies for successful delivery
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                Explore Frameworks →
              </span>
            </div>
          </Link>

          {/* Prototypes */}
          <Link to="/prototypes" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-pink-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.prototype || 0}
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation Prototypes</h3>
              <p className="text-gray-600 mb-4">
                Cutting-edge prototypes exploring new technologies
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                View Prototypes →
              </span>
            </div>
          </Link>

          {/* Technologies */}
          <Link to="/technologies" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.technology || 0}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Technologies</h3>
              <p className="text-gray-600 mb-4">
                Modern technology stack and tools we leverage
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                Explore Technologies →
              </span>
            </div>
          </Link>

          {/* Industries */}
          <Link to="/industries" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-amber-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.industry || 0}
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Industries</h3>
              <p className="text-gray-600 mb-4">
                Industry verticals we serve with domain expertise
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                View Industries →
              </span>
            </div>
          </Link>

          {/* Case Studies */}
          <Link to="/case-studies" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-emerald-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {stats?.nodesByType.casestudy || 0}
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Case Studies</h3>
              <p className="text-gray-600 mb-4">
                Success stories and real-world implementations
              </p>
              <span className="text-blue-600 font-medium group-hover:underline">
                View Case Studies →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );

  // In split view mode, add scrollable wrapper
  if (viewMode === 'split') {
    return (
      <div className="h-full overflow-y-auto p-6">
        {content}
      </div>
    );
  }

  // In grid view mode, return content as-is
  return content;
};

export default HomePage;