// Base entity structure with standard properties
export interface BaseEntity {
  id: string;
  name: string;
  description: string;
  type: EntityType;
  tags?: string[];
  metadata?: Record<string, any>;
  content?: ContentReference;
}

export type EntityType = 
  | 'pillar'
  | 'coe'
  | 'platform'
  | 'accelerator'
  | 'component'
  | 'framework'
  | 'prototype'
  | 'technology'
  | 'industry'
  | 'casestudy';

export interface ContentReference {
  type: 'file' | 'inline' | 'url';
  source: string;
}

// Relationship definition
export interface EntityRelationship {
  from: string;       // source entity id
  to: string;         // target entity id
  type: string;       // relationship type (uses, implements, targets, etc.)
  metadata?: {
    strength?: 'strong' | 'medium' | 'weak';
    description?: string;
    [key: string]: any;
  };
}

// Extended properties for specific entity types (optional)
export interface EntityExtensions {
  // Pillar specific
  keyFocusAreas?: string[];
  coeCount?: number;
  
  // CoE specific
  keyCompetencies?: string[];
  services?: Service[];
  
  // Platform/Accelerator specific
  keyFeatures?: Feature[];
  clientValue?: string[];
  successStories?: SuccessStory[];
  maturityLevel?: 'emerging' | 'growth' | 'mature' | 'strategic';
  deploymentModels?: string[];
  
  // Component specific
  componentType?: string;
  technicalSpecs?: string[];
  integrationPoints?: string[];
  
  // Framework specific
  frameworkType?: string;
  methodology?: string;
  deliverables?: string[];
  
  // Prototype specific
  readinessLevel?: string;
  marketOpportunity?: string;
  potentialImpact?: string;
  
  // Technology specific
  category?: 'language' | 'framework' | 'platform' | 'tool' | 'cloud' | 'database';
  vendor?: string;
  isOpenSource?: boolean;
  isPartnership?: boolean;
  
  // Industry specific
  segment?: string;
  
  // Case Study specific
  clientName?: string;
  challenge?: string;
  solution?: string;
  outcomes?: Outcome[];
  metrics?: Metric[];
}

// Complete entity with base + extensions
export interface Entity extends BaseEntity, EntityExtensions {}

// Supporting types
export interface Service {
  name: string;
  description: string;
  deliverables?: string[];
}

export interface Feature {
  name: string;
  description: string;
  businessValue?: string;
}

export interface SuccessStory {
  client: string;
  outcome: string;
  metrics?: Metric[];
}

export interface Outcome {
  description: string;
  impact: string;
  measuredValue?: string;
}

export interface Metric {
  name: string;
  value: string;
  unit: string;
  improvement?: string;
}

// Relationship types configuration
export const RELATIONSHIP_TYPES = {
  // Hierarchical
  BELONGS_TO: {
    name: 'Belongs To',
    reverse: 'Has',
    description: 'Entity belongs to a parent entity'
  },
  
  // Usage
  USES: {
    name: 'Uses',
    reverse: 'Used By',
    description: 'Entity uses another entity'
  },
  
  IMPLEMENTS: {
    name: 'Implements',
    reverse: 'Implemented By',
    description: 'Entity implements technology or pattern'
  },
  
  // Targeting
  TARGETS: {
    name: 'Targets',
    reverse: 'Targeted By',
    description: 'Entity targets specific industry or segment'
  },
  
  // Involvement
  INVOLVED_IN: {
    name: 'Involved In',
    reverse: 'Involves',
    description: 'Entity is involved in another entity'
  },
  
  LEVERAGES: {
    name: 'Leverages',
    reverse: 'Leveraged By',
    description: 'Entity leverages another entity'
  },
  
  // Association
  RELATED_TO: {
    name: 'Related To',
    reverse: 'Related To',
    description: 'General relationship between entities'
  },
  
  DEPENDS_ON: {
    name: 'Depends On',
    reverse: 'Required By',
    description: 'Entity depends on another entity'
  },
  
  DELIVERS: {
    name: 'Delivers',
    reverse: 'Delivered By',
    description: 'Entity delivers or produces another entity'
  }
} as const;

export type RelationshipType = keyof typeof RELATIONSHIP_TYPES;