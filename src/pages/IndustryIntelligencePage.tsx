import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGraph } from '../contexts/GraphContext';
import { IndustryAnalytics } from '../services/IndustryAnalytics';
import IndustrySummaryCard from '../components/IndustrySummaryCard';

const IndustryIntelligencePage: React.FC = () => {
  const { graph } = useGraph();
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');

  const industryAnalytics = useMemo(() => {
    if (!graph) return null;
    return new IndustryAnalytics(graph);
  }, [graph]);

  const industrySummaries = useMemo(() => {
    if (!industryAnalytics) return [];
    return industryAnalytics.getAllIndustrySummaries()
      .sort((a, b) => b.metrics.totalSolutions - a.metrics.totalSolutions);
  }, [industryAnalytics]);

  const selectedIndustryDetails = useMemo(() => {
    if (!selectedIndustry || !industryAnalytics) return null;
    return industryAnalytics.getIndustryCapabilities(selectedIndustry);
  }, [selectedIndustry, industryAnalytics]);

  const handleViewDetails = (industryId: string) => {
    setSelectedIndustry(industryId);
    setViewMode('detailed');
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {industrySummaries.map(summary => (
        <IndustrySummaryCard
          key={summary.industry.id}
          summary={summary}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );

  const renderDetailedView = () => {
    if (!selectedIndustryDetails) return null;

    const { summary, capabilitiesByPillar } = selectedIndustryDetails;

    return (
      <div className="space-y-8">
        {/* Back button */}
        <button
          onClick={() => {
            setViewMode('grid');
            setSelectedIndustry(null);
          }}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Industries
        </button>

        {/* Industry Header */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">{summary.industry.data.name}</h2>
          <p className="text-gray-600 mb-6">{summary.industry.data.description}</p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.metrics.caseStudies}</div>
              <div className="text-sm text-gray-600">Success Stories</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.metrics.coes}</div>
              <div className="text-sm text-gray-600">Centers of Excellence</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.metrics.platforms}</div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{summary.metrics.accelerators}</div>
              <div className="text-sm text-gray-600">Accelerators</div>
            </div>
          </div>
        </div>

        {/* Capabilities by Pillar */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Capabilities by Pillar</h3>
          {capabilitiesByPillar.map(({ pillar, coes, solutions }) => (
            <div key={pillar.id} className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-xl font-semibold mb-4">{pillar.data.name}</h4>
              
              {coes.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Centers of Excellence</h5>
                  <div className="flex flex-wrap gap-2">
                    {coes.map(coe => (
                      <button
                        key={coe.id}
                        onClick={() => navigate(`/coes/${coe.id}`)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                      >
                        {coe.data.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {solutions.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Solutions & Accelerators</h5>
                  <div className="flex flex-wrap gap-2">
                    {solutions.map(solution => (
                      <button
                        key={solution.id}
                        onClick={() => navigate(`/${solution.type}s/${solution.id}`)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                      >
                        {solution.data.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Case Studies */}
        {summary.caseStudies.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.caseStudies.map(cs => (
                <button
                  key={cs.id}
                  onClick={() => navigate(`/case-studies/${cs.id}`)}
                  className="text-left p-4 border rounded-lg hover:bg-gray-50"
                >
                  <h4 className="font-semibold text-blue-600">{cs.data.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {(cs.data as any).description || 'View case study details'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!graph || !industryAnalytics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        {viewMode === 'grid' && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Industry Intelligence</h1>
            <p className="text-xl text-gray-600">
              Explore our industry expertise, success stories, and tailored solutions across various sectors
            </p>
            
            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {industrySummaries.length}
                </div>
                <div className="text-sm text-gray-600">Industries Served</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {industrySummaries.reduce((sum, s) => sum + s.metrics.caseStudies, 0)}
                </div>
                <div className="text-sm text-gray-600">Success Stories</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {industrySummaries.reduce((sum, s) => sum + s.metrics.coes, 0)}
                </div>
                <div className="text-sm text-gray-600">Industry CoEs</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {industrySummaries.reduce((sum, s) => sum + s.metrics.totalSolutions, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Solutions</div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'grid' ? renderGridView() : renderDetailedView()}
        </div>
      </div>
    </div>
  );
};

export default IndustryIntelligencePage;