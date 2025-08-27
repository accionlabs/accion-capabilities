import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGraph } from '../contexts/GraphContext';
import { IndustryAnalytics } from '../services/IndustryAnalytics';

const IndustryDetailPage: React.FC = () => {
  const { industryId } = useParams<{ industryId: string }>();
  const { graph } = useGraph();
  const navigate = useNavigate();

  const industryDetails = useMemo(() => {
    if (!industryId || !graph) return null;
    
    const analytics = new IndustryAnalytics(graph);
    const summary = analytics.getIndustrySummary(industryId);
    const capabilities = analytics.getIndustryCapabilities(industryId);
    
    return { summary, capabilities };
  }, [industryId, graph]);

  if (!industryDetails || !industryDetails.summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Industry not found</p>
            <Link to="/industry-intelligence" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Back to Industry Intelligence
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { summary, capabilities } = industryDetails;
  const { capabilitiesByPillar } = capabilities || { capabilitiesByPillar: [] };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          to="/industry-intelligence"
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Industry Intelligence
        </Link>

        {/* Industry Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{summary.industry.data.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{summary.industry.data.description}</p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{summary.metrics.caseStudies}</div>
              <div className="text-sm text-gray-600">Success Stories</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{summary.metrics.coes}</div>
              <div className="text-sm text-gray-600">Centers of Excellence</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{summary.metrics.platforms}</div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{summary.metrics.accelerators}</div>
              <div className="text-sm text-gray-600">Accelerators</div>
            </div>
          </div>
        </div>

        {/* Capabilities by Pillar */}
        {capabilitiesByPillar && capabilitiesByPillar.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold">Capabilities by Pillar</h2>
            {capabilitiesByPillar.map(({ pillar, coes, solutions }) => (
              <div key={pillar.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{pillar.data.name}</h3>
                
                {coes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Centers of Excellence</h4>
                    <div className="flex flex-wrap gap-2">
                      {coes.map(coe => (
                        <Link
                          key={coe.id}
                          to={`/coes/${coe.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                        >
                          {coe.data.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {solutions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Solutions & Accelerators</h4>
                    <div className="flex flex-wrap gap-2">
                      {solutions.map(solution => (
                        <Link
                          key={solution.id}
                          to={`/${solution.type}s/${solution.id}`}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                        >
                          {solution.data.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Case Studies */}
        {summary.caseStudies.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Case Studies</h2>
              <Link
                to={`/industry-intelligence/${industryId}/case-studies`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-4">
              {summary.caseStudies.slice(0, 5).map(cs => (
                <Link
                  key={cs.id}
                  to={`/case-studies/${cs.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-gray-800">{cs.data.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{cs.data.client}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Impact Metrics */}
        {summary.impactMetrics && Object.keys(summary.impactMetrics).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Impact Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.impactMetrics.costSavings && (
                <div className="flex items-start p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl mr-3">💰</span>
                  <div>
                    <div className="font-semibold text-gray-800">Cost Savings</div>
                    <div className="text-sm text-gray-600">{summary.impactMetrics.costSavings}</div>
                  </div>
                </div>
              )}
              {summary.impactMetrics.efficiencyGains && (
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <span className="text-2xl mr-3">⚡</span>
                  <div>
                    <div className="font-semibold text-gray-800">Efficiency Gains</div>
                    <div className="text-sm text-gray-600">{summary.impactMetrics.efficiencyGains}</div>
                  </div>
                </div>
              )}
              {summary.impactMetrics.timeToMarket && (
                <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                  <span className="text-2xl mr-3">🚀</span>
                  <div>
                    <div className="font-semibold text-gray-800">Time to Market</div>
                    <div className="text-sm text-gray-600">{summary.impactMetrics.timeToMarket}</div>
                  </div>
                </div>
              )}
              {summary.impactMetrics.customerSatisfaction && (
                <div className="flex items-start p-4 bg-orange-50 rounded-lg">
                  <span className="text-2xl mr-3">😊</span>
                  <div>
                    <div className="font-semibold text-gray-800">Customer Satisfaction</div>
                    <div className="text-sm text-gray-600">{summary.impactMetrics.customerSatisfaction}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default IndustryDetailPage;