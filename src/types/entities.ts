// Core entity types and interfaces

// Content Support
export interface ContentReference {
  type: 'inline' | 'file' | 'url';
  source: string; // Markdown string, file path, or URL
  assets?: ContentAsset[];
}

export interface ContentAsset {
  id: string;
  type: 'image' | 'svg' | 'mermaid' | 'video';
  path: string;
  alt?: string;
  caption?: string;
}

export interface EntityMetadata {
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  author?: string;
  version?: string;
}

// Base Entity
export interface BaseEntity {
  id: string;
  name: string;
  description: string;
  content?: ContentReference;
  metadata?: EntityMetadata;
}

// Core Entities
export interface Pillar extends BaseEntity {
  coeCount: number;
  keyFocusAreas: string[];
}

export interface CenterOfExcellence extends BaseEntity {
  pillarId: string;
  keyCompetencies: string[];
  ipAssets: string[];
  platforms: string[];
  technologies: string[];
  services: Service[];
  targetIndustries: string[];
  caseStudies?: CaseStudyReference[];
}

export interface Service {
  name: string;
  description: string;
  deliverables?: string[];
}

export interface CaseStudyReference {
  id: string;
  clientName: string;
  summary: string;
}

// IP Asset Types
export interface IPAsset extends BaseEntity {
  category: 'platform' | 'accelerator' | 'component' | 'framework' | 'prototype';
  strategicValue: string;
  clientValue: string[];
  usedByCoEs: string[];
  technologies: string[];
  industries: string[];
}

export interface Platform extends IPAsset {
  category: 'platform';
  keyFeatures: Feature[];
  businessImpactMetrics: Metric[];
  maturityLevel?: 'emerging' | 'growth' | 'mature' | 'strategic';
  deploymentModels?: string[];
}

export interface Accelerator extends IPAsset {
  category: 'accelerator';
  solutionType: string;
  keyFeatures: Feature[];
  clientValueMetrics: Metric[];
  successStories: SuccessStory[];
  deploymentTime?: string;
  costSavings?: string;
}

export interface Component extends IPAsset {
  category: 'component';
  componentType: string;
  technicalSpecs: string[];
  integrationPoints: string[];
  performanceMetrics: Metric[];
}

export interface DeliveryFramework extends IPAsset {
  category: 'framework';
  frameworkType: 'engagement' | 'process' | 'governance' | 'specialized';
  methodology: string;
  deliverables: string[];
  maturityModel?: string;
}

export interface InnovationPrototype extends IPAsset {
  category: 'prototype';
  marketOpportunity: string;
  readinessLevel: 'concept' | 'prototype' | 'pilot' | 'production-ready';
  potentialImpact: string;
  futureRoadmap?: string;
}

// Supporting Types
export interface Feature {
  name: string;
  description: string;
  businessValue?: string;
}

export interface Metric {
  name: string;
  value: string;
  unit?: string;
  improvement?: string;
}

export interface SuccessStory {
  client: string;
  outcome: string;
  metrics?: Metric[];
}

export interface Technology extends BaseEntity {
  category: 'language' | 'framework' | 'platform' | 'tool' | 'cloud' | 'database';
  vendor?: string;
  isOpenSource: boolean;
  isPartnership: boolean;
}

export interface Industry extends BaseEntity {
  segment?: string;
}

export interface CaseStudy extends BaseEntity {
  clientName: string;
  industryId: string;
  challenge: string;
  solution: string;
  ipAssetsUsed: string[];
  coesInvolved: string[];
  outcomes: Outcome[];
  metrics: Metric[];
}

export interface Outcome {
  description: string;
  impact: string;
  measuredValue?: string;
}

// Type guards
export function isPlatform(asset: IPAsset): asset is Platform {
  return asset.category === 'platform';
}

export function isAccelerator(asset: IPAsset): asset is Accelerator {
  return asset.category === 'accelerator';
}

export function isComponent(asset: IPAsset): asset is Component {
  return asset.category === 'component';
}

export function isFramework(asset: IPAsset): asset is DeliveryFramework {
  return asset.category === 'framework';
}

export function isPrototype(asset: IPAsset): asset is InnovationPrototype {
  return asset.category === 'prototype';
}