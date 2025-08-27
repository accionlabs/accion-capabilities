import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GraphContext } from '../App';
import { Platform } from '../types/entities';
import MarkdownRenderer from '../components/MarkdownRenderer';

const PlatformDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { graph, queryBuilder } = useContext(GraphContext);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const platformNode = graph?.getNode(id || '');
  const platform = platformNode?.data as Platform | undefined;

  const usedByCoEs = id && queryBuilder ? queryBuilder.getCoEsUsingAsset(id) : [];

  useEffect(() => {
    const loadMarkdownContent = async () => {
      if (platform?.content?.type === 'file' && platform.content.source) {
        setLoading(true);
        try {
          const path = platform.content.source.startsWith('/') ? platform.content.source : `/${platform.content.source}`;
          const response = await fetch(path);
          if (response.ok) {
            const text = await response.text();
            if (!text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
              setMarkdownContent(text);
            } else {
              console.error('Received HTML content instead of markdown');
              setMarkdownContent(null);
            }
          } else {
            console.error('Failed to fetch markdown:', response.status);
          }
        } catch (error) {
          console.error('Failed to load markdown content:', error);
        }
        setLoading(false);
      } else if (platform?.content?.type === 'inline' && platform.content.source) {
        setMarkdownContent(platform.content.source);
      } else {
        setMarkdownContent(null);
      }
    };

    loadMarkdownContent();
  }, [platform]);

  if (!platform) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Platform not found</p>
        <Link to="/platforms" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Platforms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center mb-4">
          <Link to="/platforms" className="text-white hover:text-blue-200 mr-4">
            ← Back to Platforms
          </Link>
          {platform.maturityLevel && (
            <span className={`px-3 py-1 rounded-full text-sm ${
              platform.maturityLevel === 'strategic' ? 'bg-purple-500' :
              platform.maturityLevel === 'mature' ? 'bg-green-500' :
              platform.maturityLevel === 'growth' ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}>
              {platform.maturityLevel}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4">{platform.name}</h1>
        <p className="text-xl">{platform.description}</p>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategic Value */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Strategic Value</h2>
          <p className="text-gray-700">{platform.strategicValue}</p>
        </div>

        {/* Deployment Models */}
        {platform.deploymentModels && platform.deploymentModels.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-3">Deployment Models</h2>
            <div className="flex flex-wrap gap-2">
              {platform.deploymentModels.map((model, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Value */}
      {platform.clientValue && platform.clientValue.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Client Value</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platform.clientValue.map((value, idx) => (
              <div key={idx} className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Features */}
      {platform.keyFeatures && platform.keyFeatures.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platform.keyFeatures.map((feature, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-1">{feature.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                {feature.businessValue && (
                  <p className="text-sm text-blue-600 font-medium">{feature.businessValue}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Impact Metrics */}
      {platform.businessImpactMetrics && platform.businessImpactMetrics.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Business Impact Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platform.businessImpactMetrics.map((metric, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-sm text-gray-600 mt-1">{metric.name}</p>
                {metric.improvement && (
                  <p className="text-xs text-green-600 mt-1">{metric.improvement}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technologies */}
      {platform.technologies && platform.technologies.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>
          <div className="flex flex-wrap gap-2">
            {platform.technologies.map((techId) => (
              <span
                key={techId}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {techId.replace('tech_', '').replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Used by CoEs */}
      {usedByCoEs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Used by Centers of Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usedByCoEs.map((coe, index) => (
              <Link
                key={`${coe.id}-${index}`}
                to={`/coe/${coe.id}`}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-blue-600">{coe.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{coe.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Industries */}
      {platform.industries && platform.industries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Target Industries</h2>
          <div className="flex flex-wrap gap-3">
            {platform.industries.map((industryId) => (
              <span
                key={industryId}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg"
              >
                {industryId.replace('industry_', '').replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Markdown Content */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      )}

      {markdownContent && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <MarkdownRenderer content={markdownContent} />
        </div>
      )}
    </div>
  );
};

export default PlatformDetailPage;