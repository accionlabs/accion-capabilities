import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Platform, 
  Accelerator, 
  Component, 
  DeliveryFramework, 
  InnovationPrototype,
  IPAsset,
  isPlatform,
  isAccelerator,
  isComponent,
  isFramework,
  isPrototype
} from '../types/entities';
import { GraphContext } from '../App';

interface IPAssetCardProps {
  asset: IPAsset;
}

const IPAssetCard: React.FC<IPAssetCardProps> = ({ asset }) => {
  const { queryBuilder } = useContext(GraphContext);
  
  const categoryColors: Record<string, string> = {
    platform: 'bg-blue-100 text-blue-700',
    accelerator: 'bg-green-100 text-green-700',
    component: 'bg-purple-100 text-purple-700',
    framework: 'bg-yellow-100 text-yellow-700',
    prototype: 'bg-pink-100 text-pink-700'
  };

  const categoryIcons: Record<string, JSX.Element> = {
    platform: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
    accelerator: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    component: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
    framework: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 001-1v4a1 1 0 11-2 0v-3a3 3 0 01-3-3V5z" clipRule="evenodd" />
      </svg>
    ),
    prototype: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1z" />
      </svg>
    )
  };

  const getUsedByCoEs = () => {
    return queryBuilder?.getCoEsUsingAsset(asset.id) || [];
  };

  const renderSpecificDetails = () => {
    if (isPlatform(asset)) {
      const platform = asset as Platform;
      return (
        <>
          {platform.maturityLevel && (
            <div className="mb-3">
              <span className="text-sm text-gray-500">Maturity Level: </span>
              <span className={`font-medium capitalize px-2 py-1 rounded text-xs ${
                platform.maturityLevel === 'strategic' ? 'bg-purple-100 text-purple-700' :
                platform.maturityLevel === 'mature' ? 'bg-green-100 text-green-700' :
                platform.maturityLevel === 'growth' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {platform.maturityLevel}
              </span>
            </div>
          )}
          {platform.deploymentModels && platform.deploymentModels.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500 mb-1">Deployment Models</p>
              <div className="flex flex-wrap gap-1">
                {platform.deploymentModels.map((model, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}
          {platform.keyFeatures && platform.keyFeatures.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500 mb-2">Key Features</p>
              <ul className="text-sm space-y-1">
                {platform.keyFeatures.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {platform.businessImpactMetrics && platform.businessImpactMetrics.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500 mb-1">Business Impact</p>
              <div className="flex flex-wrap gap-2">
                {platform.businessImpactMetrics.slice(0, 3).map((metric, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {metric.name}: {metric.value}{metric.unit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (isAccelerator(asset)) {
      const accelerator = asset as Accelerator;
      return (
        <>
          <div className="mb-3">
            <span className="text-sm text-gray-500">Solution Type: </span>
            <span className="font-medium">{accelerator.solutionType}</span>
          </div>
          {accelerator.deploymentTime && (
            <div className="mb-3">
              <span className="text-sm text-gray-500">Deployment Time: </span>
              <span className="font-medium">{accelerator.deploymentTime}</span>
            </div>
          )}
          {accelerator.costSavings && (
            <div className="mb-3">
              <span className="text-sm text-gray-500">Cost Savings: </span>
              <span className="font-medium text-green-600">{accelerator.costSavings}</span>
            </div>
          )}
          {accelerator.successStories && accelerator.successStories.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500 mb-1">Success Story</p>
              <p className="text-sm italic">
                "{accelerator.successStories[0].outcome}" - {accelerator.successStories[0].client}
              </p>
            </div>
          )}
        </>
      );
    }

    if (isComponent(asset)) {
      const component = asset as Component;
      return (
        <>
          <div className="mb-3">
            <span className="text-sm text-gray-500">Type: </span>
            <span className="font-medium">{component.componentType}</span>
          </div>
          {component.technicalSpecs && component.technicalSpecs.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500 mb-1">Technical Specs</p>
              <div className="flex flex-wrap gap-1">
                {component.technicalSpecs.slice(0, 3).map((spec, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (isFramework(asset)) {
      const framework = asset as DeliveryFramework;
      return (
        <>
          <div className="mb-3">
            <span className="text-sm text-gray-500">Type: </span>
            <span className="font-medium capitalize">{framework.frameworkType}</span>
          </div>
          <div className="mb-3">
            <span className="text-sm text-gray-500">Methodology: </span>
            <span className="font-medium">{framework.methodology}</span>
          </div>
          {framework.deliverables && framework.deliverables.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500 mb-1">Deliverables</p>
              <div className="flex flex-wrap gap-1">
                {framework.deliverables.slice(0, 3).map((deliverable, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {deliverable}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (isPrototype(asset)) {
      const prototype = asset as InnovationPrototype;
      return (
        <>
          <div className="mb-3">
            <span className="text-sm text-gray-500">Readiness: </span>
            <span className={`font-medium capitalize px-2 py-1 rounded text-xs ${
              prototype.readinessLevel === 'production-ready' ? 'bg-green-100 text-green-700' :
              prototype.readinessLevel === 'pilot' ? 'bg-yellow-100 text-yellow-700' :
              prototype.readinessLevel === 'prototype' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {prototype.readinessLevel}
            </span>
          </div>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-500 mb-1">Market Opportunity</p>
            <p className="text-sm">{prototype.marketOpportunity}</p>
          </div>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-500 mb-1">Potential Impact</p>
            <p className="text-sm font-semibold text-blue-600">{prototype.potentialImpact}</p>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${categoryColors[asset.category]}`}>
            {categoryIcons[asset.category]}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{asset.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[asset.category]}`}>
              {asset.category}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{asset.description}</p>

      {renderSpecificDetails()}

      <div className="border-t pt-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-500 mb-2">Strategic Value</p>
          <p className="text-sm">{asset.strategicValue}</p>
        </div>

        {asset.clientValue && asset.clientValue.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-500 mb-2">Client Value</p>
            <ul className="text-sm space-y-1">
              {asset.clientValue.slice(0, 3).map((value, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {asset.technologies?.slice(0, 4).map((techId) => (
            <span key={techId} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {techId.replace('tech_', '').replace(/_/g, ' ')}
            </span>
          ))}
          {asset.technologies && asset.technologies.length > 4 && (
            <span className="text-xs px-2 py-1 text-gray-500">
              +{asset.technologies.length - 4} more
            </span>
          )}
        </div>

        {getUsedByCoEs().length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Used by {getUsedByCoEs().length} CoE(s)</p>
            <div className="flex flex-wrap gap-2">
              {getUsedByCoEs().slice(0, 3).map((coe) => (
                <span key={coe.id} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {coe.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View Details Link for platforms with content */}
        {isPlatform(asset) && (asset as Platform).content && (
          <div className="mt-4 pt-4 border-t">
            <Link 
              to={`/platform/${asset.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View Full Details
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPAssetCard;