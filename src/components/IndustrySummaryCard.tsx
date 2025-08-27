import React from 'react';
import { Link } from 'react-router-dom';
import { IndustrySummary } from '../services/IndustryAnalytics';

interface IndustrySummaryCardProps {
  summary: IndustrySummary;
  onViewDetails?: (industryId: string) => void;
}

const IndustrySummaryCard: React.FC<IndustrySummaryCardProps> = ({ summary, onViewDetails }) => {
  const { industry, metrics, impactMetrics } = summary;

  const getIndustryIcon = (industryId: string) => {
    const icons: Record<string, JSX.Element> = {
      'industry_healthcare': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      'industry_financial_services': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'industry_manufacturing': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      'industry_retail': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      'industry_technology': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    };

    return icons[industryId] || (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  };

  const getIndustryColor = (industryId: string) => {
    const colors: Record<string, string> = {
      'industry_healthcare': 'from-red-500 to-pink-500',
      'industry_financial_services': 'from-green-500 to-emerald-500',
      'industry_manufacturing': 'from-gray-500 to-slate-500',
      'industry_retail': 'from-orange-500 to-amber-500',
      'industry_technology': 'from-blue-500 to-indigo-500',
      'industry_media': 'from-purple-500 to-violet-500',
      'industry_pharma': 'from-teal-500 to-cyan-500',
      'industry_ecommerce': 'from-yellow-500 to-orange-500',
      'industry_utilities': 'from-slate-500 to-zinc-500'
    };
    return colors[industryId] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getIndustryColor(industry.id)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              {getIndustryIcon(industry.id)}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{industry.data.name}</h3>
              <p className="text-white text-opacity-90 mt-1">
                {industry.data.description || 'Industry solutions and expertise'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{metrics.caseStudies}</div>
            <div className="text-sm text-gray-600">Case Studies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{metrics.coes}</div>
            <div className="text-sm text-gray-600">CoEs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{metrics.platforms}</div>
            <div className="text-sm text-gray-600">Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{metrics.accelerators}</div>
            <div className="text-sm text-gray-600">Accelerators</div>
          </div>
        </div>

        {/* Impact Metrics */}
        {impactMetrics && Object.keys(impactMetrics).length > 0 && (
          <div className="border-t pt-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Impact Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {impactMetrics.costSavings && (
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">💰</span>
                  <span className="text-gray-600">Cost Savings: {impactMetrics.costSavings}</span>
                </div>
              )}
              {impactMetrics.efficiencyGains && (
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">⚡</span>
                  <span className="text-gray-600">Efficiency: {impactMetrics.efficiencyGains}</span>
                </div>
              )}
              {impactMetrics.timeToMarket && (
                <div className="flex items-center">
                  <span className="text-purple-600 mr-2">🚀</span>
                  <span className="text-gray-600">Time to Market: {impactMetrics.timeToMarket}</span>
                </div>
              )}
              {impactMetrics.customerSatisfaction && (
                <div className="flex items-center">
                  <span className="text-orange-600 mr-2">😊</span>
                  <span className="text-gray-600">Satisfaction: {impactMetrics.customerSatisfaction}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Case Studies */}
        {summary.caseStudies.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Success Stories</h4>
            <div className="space-y-1">
              {summary.caseStudies.slice(0, 3).map(cs => (
                <Link
                  key={cs.id}
                  to={`/case-studies/${cs.id}`}
                  className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                >
                  • {cs.data.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Link
            to={`/industry-intelligence/${industry.id}`}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors text-center"
          >
            View Details
          </Link>
          <Link
            to={`/industry-intelligence/${industry.id}/case-studies`}
            className="flex-1 border border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            Case Studies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IndustrySummaryCard;