// Graph database types and interfaces

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

export type RelationshipType =
  | 'BELONGS_TO'      // CoE -> Pillar
  | 'USES'            // CoE -> IPAsset, CoE -> Technology
  | 'IMPLEMENTS'      // IPAsset -> Technology
  | 'TARGETS'         // CoE -> Industry, IPAsset -> Industry
  | 'DELIVERED_FOR'   // CaseStudy -> Client
  | 'LEVERAGED'       // CaseStudy -> IPAsset
  | 'INVOLVED_IN'     // CoE -> CaseStudy
  | 'PARTNERS_WITH'   // Technology -> Vendor
  | 'ENHANCED_BY'     // IPAsset -> IPAsset
  | 'FEEDS_INTO'      // Prototype -> Platform
  | 'REQUIRES';       // IPAsset -> IPAsset

export interface GraphNode {
  id: string;
  type: EntityType;
  data: any; // The actual entity data
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    tags?: string[];
    rawData?: any; // Store original data for relationship processing
  };
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: RelationshipType | string;  // Allow any string for flexibility
  metadata?: Record<string, any>;
  weight?: number;
}

export interface GraphTraversal {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStatistics {
  totalNodes: number;
  nodesByType: Record<string, number>;
  totalEdges: number;
  avgConnections: number;
}

export interface GraphQuery {
  type?: EntityType;
  pillarId?: string;
  category?: string;
  searchTerm?: string;
  depth?: number;
}