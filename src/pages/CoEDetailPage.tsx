import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GraphContext } from '../App';
import { CenterOfExcellence, Pillar } from '../types/entities';
import MarkdownRenderer from '../components/MarkdownRenderer';

const CoEDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { graph, queryBuilder } = useContext(GraphContext);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const coeNode = graph?.getNode(id || '');
  const coe = coeNode?.data as CenterOfExcellence | undefined;
  
  const pillarNode = coe?.pillarId ? graph?.getNode(coe.pillarId) : undefined;
  const pillar = pillarNode?.data as Pillar | undefined;

  const assetMapping = id && queryBuilder ? queryBuilder.getCoEAssetMapping(id) : null;
  const caseStudies = id && queryBuilder ? queryBuilder.getCaseStudies(id) : [];

  useEffect(() => {
    const loadMarkdownContent = async () => {
      if (coe?.content?.type === 'file' && coe.content.source) {
        setLoading(true);
        try {
          // Ensure the path starts with /
          const path = coe.content.source.startsWith('/') ? coe.content.source : `/${coe.content.source}`;
          const response = await fetch(path);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            // Check if we're getting the correct content type
            if (contentType && contentType.includes('text/html')) {
              console.warn('Received HTML instead of markdown, check the file path:', path);
            }
            const text = await response.text();
            // Only set content if it looks like markdown (not HTML)
            if (!text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
              setMarkdownContent(text);
            } else {
              console.error('Received HTML content instead of markdown');
              setMarkdownContent('# Content Not Found\n\nThe markdown content could not be loaded.');
            }
          } else {
            console.error('Failed to fetch markdown:', response.status);
            setMarkdownContent('# Content Not Found\n\nThe markdown content could not be loaded.');
          }
        } catch (error) {
          console.error('Failed to load markdown content:', error);
          setMarkdownContent('# Error Loading Content\n\nAn error occurred while loading the content.');
        }
        setLoading(false);
      } else if (coe?.content?.type === 'inline' && coe.content.source) {
        setMarkdownContent(coe.content.source);
      } else {
        // No content specified, don't show the markdown section
        setMarkdownContent(null);
      }
    };

    loadMarkdownContent();
  }, [coe]);

  if (!coe) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Center of Excellence not found</p>
        <Link to="/pillars" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to CoEs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center mb-4">
          <Link to="/pillars" className="text-white hover:text-blue-200 mr-4">
            ← Back to CoEs
          </Link>
          {pillar && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {pillar.name} Pillar
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4">{coe.name}</h1>
        <p className="text-xl">{coe.description}</p>
      </div>

      {/* Key Competencies */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Key Competencies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {coe.keyCompetencies.map((comp, idx) => (
            <div key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-center">
              {comp}
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {coe.services && coe.services.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coe.services.map((service, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                {service.deliverables && service.deliverables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Deliverables:</p>
                    <ul className="text-sm space-y-1">
                      {service.deliverables.map((deliverable, dIdx) => (
                        <li key={dIdx} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP Assets */}
      {assetMapping && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">IP Assets</h2>
          
          {assetMapping.platforms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetMapping.platforms.map((platform) => (
                  <Link
                    key={platform.id}
                    to={`/platforms`}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-blue-600">{platform.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                    {platform.maturityLevel && (
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                        platform.maturityLevel === 'strategic' ? 'bg-purple-100 text-purple-700' :
                        platform.maturityLevel === 'mature' ? 'bg-green-100 text-green-700' :
                        platform.maturityLevel === 'growth' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {platform.maturityLevel}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {assetMapping.accelerators.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Accelerators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetMapping.accelerators.map((accelerator) => (
                  <Link
                    key={accelerator.id}
                    to={`/accelerators`}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-green-600">{accelerator.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{accelerator.solutionType}</p>
                    {accelerator.deploymentTime && (
                      <span className="inline-block mt-2 text-sm text-gray-500">
                        Deployment: {accelerator.deploymentTime}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {assetMapping.components.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Components</h3>
              <div className="flex flex-wrap gap-3">
                {assetMapping.components.map((component) => (
                  <Link
                    key={component.id}
                    to={`/components`}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                  >
                    {component.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {assetMapping.frameworks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Frameworks</h3>
              <div className="flex flex-wrap gap-3">
                {assetMapping.frameworks.map((framework) => (
                  <Link
                    key={framework.id}
                    to={`/frameworks`}
                    className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition"
                  >
                    {framework.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Technologies */}
      {coe.technologies && coe.technologies.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {coe.technologies.map((techId) => (
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

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Case Studies</h2>
          <div className="space-y-4">
            {caseStudies.map((caseStudy) => (
              <div key={caseStudy.id} className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold mb-2">{caseStudy.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Client: {caseStudy.clientName}</p>
                <p className="text-gray-600 mb-3">{caseStudy.description}</p>
                <div className="flex flex-wrap gap-3">
                  {caseStudy.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-green-50 px-3 py-1 rounded">
                      <span className="font-semibold text-green-700">
                        {metric.value}{metric.unit}
                      </span>
                      <span className="text-green-600 ml-1">
                        {metric.improvement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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

      {/* Target Industries */}
      {coe.targetIndustries && coe.targetIndustries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Target Industries</h2>
          <div className="flex flex-wrap gap-3">
            {coe.targetIndustries.map((industryId) => (
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
    </div>
  );
};

export default CoEDetailPage;