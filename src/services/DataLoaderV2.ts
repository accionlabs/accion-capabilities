// Data loader v2 - loads from folder structure
import { CapabilityGraph } from './CapabilityGraph';
import { GraphNode, GraphEdge } from '../types/graph';
import { getDataPath } from '../config/paths';

export class DataLoaderV2 {
  private graph: CapabilityGraph;
  private idCounter: number = 0;
  private baseUrl: string = getDataPath('/data');

  constructor(graph: CapabilityGraph) {
    this.graph = graph;
  }

  async loadAllData(): Promise<void> {
    try {
      console.log('Starting data load...');
      console.log('Base URL:', this.baseUrl);
      
      // Load index to get list of all entities
      const indexUrl = `${this.baseUrl}/index.json`;
      console.log('Loading index from:', indexUrl);
      const indexResponse = await fetch(indexUrl);
      const index = await indexResponse.json();
      console.log('Index loaded');

      // Load all entities in parallel by type
      await Promise.all([
        this.loadEntities('pillars', index.entities.pillars),
        this.loadEntities('technologies', index.entities.technologies),
        this.loadEntities('industries', index.entities.industries)
      ]);

      // Load entities that depend on the above
      await Promise.all([
        this.loadEntities('coes', index.entities.centersOfExcellence),
        this.loadEntities('platforms', index.entities.platforms),
        this.loadEntities('accelerators', index.entities.accelerators),
        this.loadEntities('components', index.entities.components),
        this.loadEntities('frameworks', index.entities.frameworks),
        this.loadEntities('prototypes', index.entities.prototypes)
      ]);


      // Load case studies last as they reference other entities
      await this.loadEntities('case-studies', index.entities.caseStudies);
      
      console.log('All entities loaded, now creating relationships...');

      // Create relationships from entity data
      this.createRelationshipsFromEntities();
      
      // Compute pillar associations for all entities
      console.log('Computing pillar associations...');
      this.computePillarAssociations();
      
      // Validate the graph for consistency
      const validation = this.validateGraph();
      if (validation.errors.length > 0) {
        console.warn('⚠️ Graph validation found issues:', validation);
      } else {
        console.log('✅ Graph validation passed');
      }

      console.log('✅ All data loaded successfully');
      
      // Final stats
      const stats = this.graph.getStatistics();
      console.log('Final Graph Stats:', stats);
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  private async loadEntities(folder: string, entities: Array<{id: string, name: string}>): Promise<void> {
    const promises = entities.map(async (entity) => {
      const response = await fetch(`${this.baseUrl}/${folder}/${entity.id}.json`);
      const data = await response.json();
      
      // Map folder names to entity types
      const typeMap: Record<string, any> = {
        'pillars': 'pillar',
        'coes': 'coe',
        'platforms': 'platform',
        'accelerators': 'accelerator',
        'components': 'component',
        'frameworks': 'framework',
        'prototypes': 'prototype',
        'technologies': 'technology',
        'industries': 'industry',
        'case-studies': 'casestudy'
      };

      const entityType = typeMap[folder];
      
      // Handle both old format (direct data) and new format (with data wrapper)
      const nodeData = data.data || data;
      
      const node: GraphNode = {
        id: data.id,
        type: data.type || entityType,
        data: nodeData,
        metadata: {
          ...data.metadata,
          createdAt: new Date(),
          tags: this.extractTags(nodeData, entityType),
          rawData: data // Store the full original data including relationships
        }
      };
      
      this.graph.addNode(node);
    });

    await Promise.all(promises);
    console.log(`Loaded ${entities.length} ${folder}`);
  }

  private extractTags(data: any, type: string): string[] {
    switch (type) {
      case 'pillar':
        return data.keyFocusAreas || [];
      case 'coe':
        return data.keyCompetencies || [];
      case 'platform':
      case 'accelerator':
        return data.keyFeatures?.map((f: any) => f.name) || [];
      case 'component':
        return [data.componentType].filter(Boolean);
      case 'framework':
        return [data.frameworkType, data.methodology].filter(Boolean);
      case 'prototype':
        return [data.readinessLevel].filter(Boolean);
      case 'technology':
        return [data.category].filter(Boolean);
      case 'industry':
        return data.segment ? [data.segment] : [];
      case 'casestudy':
        return data.outcomes?.map((o: any) => o.description) || [];
      default:
        return [];
    }
  }

  private createRelationshipsFromEntities(): void {
    // Iterate through all nodes to extract relationships
    this.graph.findByType('pillar').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('coe').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('platform').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('accelerator').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('component').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('framework').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('prototype').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('technology').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('industry').forEach(node => this.processEntityRelationships(node));
    this.graph.findByType('casestudy').forEach(node => this.processEntityRelationships(node));
    
    // Count total relationships
    const stats = this.graph.getStatistics();
    console.log(`✅ Created ${stats.totalEdges} relationships from entity files`);
  }
  
  private processEntityRelationships(node: GraphNode): void {
    const entity = node.data;
    const rawData = node.metadata?.rawData || entity; // Keep reference to full data
    
    // Process relationships from the entity file structure
    // Check both entity.relationships (from data wrapper) and rawData.relationships (from root)
    const relationships = entity.relationships || rawData.relationships || [];
    
    if (Array.isArray(relationships)) {
      relationships.forEach((rel: any) => {
        const targetNode = this.graph.getNode(rel.to);
        if (targetNode) {
          this.createEdge(node.id, rel.to, rel.type, rel.metadata);
        } else {
          console.warn(`⚠️ Target node not found for relationship: ${node.id} -> ${rel.to}`);
        }
      });
    }
    
    // Also handle legacy outgoing/incoming format if it exists
    if (entity.relationships?.outgoing) {
      entity.relationships.outgoing.forEach((rel: any) => {
        const targetNode = this.graph.getNode(rel.to);
        if (targetNode) {
          this.createEdge(node.id, rel.to, rel.type, rel.metadata);
        } else {
          console.warn(`⚠️ Target node not found for relationship: ${node.id} -> ${rel.to}`);
        }
      });
    }
  }
  
  private validateGraph(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for orphaned nodes (nodes with no relationships)
    this.graph.findByType('coe').forEach(node => {
      const edges = this.graph.getEdges(node.id);
      const reverseEdges = this.graph.getReverseEdges(node.id);
      if (edges.length === 0 && reverseEdges.length === 0) {
        warnings.push(`Orphaned node: ${node.id} (${node.data.name}) has no relationships`);
      }
    });
    
    // Check for bidirectional consistency
    // When A has outgoing to B, B should have incoming from A
    const allNodes = [
      ...this.graph.findByType('pillar'),
      ...this.graph.findByType('coe'),
      ...this.graph.findByType('platform'),
      ...this.graph.findByType('accelerator'),
      ...this.graph.findByType('component'),
      ...this.graph.findByType('framework'),
      ...this.graph.findByType('prototype'),
      ...this.graph.findByType('technology'),
      ...this.graph.findByType('industry'),
      ...this.graph.findByType('casestudy')
    ];
    
    allNodes.forEach(node => {
      const entity = node.data;
      
      // Check outgoing relationships
      if (entity.relationships?.outgoing) {
        entity.relationships.outgoing.forEach((rel: any) => {
          const targetNode = this.graph.getNode(rel.to);
          if (targetNode) {
            // Check if target has corresponding incoming relationship
            const targetIncoming = targetNode.data.relationships?.incoming || [];
            const hasCorresponding = targetIncoming.some((inc: any) => 
              inc.from === node.id && inc.type === rel.type
            );
            
            if (!hasCorresponding) {
              warnings.push(
                `Missing reverse relationship: ${rel.to} should have incoming from ${node.id} (${rel.type})`
              );
            }
          }
        });
      }
    });
    
    // Check for invalid relationship types
    const validTypes = ['BELONGS_TO', 'USES', 'IMPLEMENTS', 'TARGETS', 'LEVERAGES', 
                       'DELIVERS', 'DEPENDS_ON', 'RELATED_TO', 'INVOLVED_IN'];
    
    allNodes.forEach(node => {
      const entity = node.data;
      if (entity.relationships?.outgoing) {
        entity.relationships.outgoing.forEach((rel: any) => {
          if (!validTypes.includes(rel.type)) {
            errors.push(`Invalid relationship type: ${rel.type} in ${node.id}`);
          }
        });
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private computePillarAssociations(): void {
    const pillarMap = new Map<string, string[]>(); // entityId -> pillarIds
    const visited = new Set<string>();
    
    // First pass: Direct relationships (Pillars themselves and CoEs)
    const pillars = this.graph.findByType('pillar');
    pillars.forEach(pillar => {
      pillarMap.set(pillar.id, [pillar.id]); // Pillars belong to themselves
    });
    
    const coes = this.graph.findByType('coe');
    coes.forEach(coe => {
      const edges = this.graph.getEdges(coe.id);
      const belongsToEdge = edges.find(e => e.type === 'BELONGS_TO');
      if (belongsToEdge) {
        const pillarNode = this.graph.getNode(belongsToEdge.to);
        if (pillarNode && pillarNode.type === 'pillar') {
          pillarMap.set(coe.id, [belongsToEdge.to]);
        }
      }
    });
    
    // Helper function to find all pillars through relationships
    const findPillarssThroughRelationships = (entityId: string, depth: number = 0): string[] => {
      if (depth > 5) return []; // Prevent infinite recursion
      if (visited.has(entityId)) return [];
      visited.add(entityId);
      
      const foundPillars = new Set<string>();
      
      // Check if this entity already has pillar associations
      if (pillarMap.has(entityId)) {
        pillarMap.get(entityId)!.forEach(pillarId => foundPillars.add(pillarId));
        return Array.from(foundPillars);
      }
      
      // For frameworks, check all SUPPORTS relationships to pillars
      const node = this.graph.getNode(entityId);
      if (node && node.type === 'framework') {
        const edges = this.graph.getEdges(entityId);
        const supportsEdges = edges.filter(e => e.type === 'SUPPORTS');
        supportsEdges.forEach(edge => {
          const targetNode = this.graph.getNode(edge.to);
          if (targetNode && targetNode.type === 'pillar') {
            foundPillars.add(edge.to);
          }
        });
        
        if (foundPillars.size > 0) {
          return Array.from(foundPillars);
        }
      }
      
      // Check incoming relationships (who uses/leverages this entity)
      const reverseEdges = this.graph.getReverseEdges(entityId);
      for (const edge of reverseEdges) {
        if (['USES', 'LEVERAGES', 'IMPLEMENTS', 'DELIVERS'].includes(edge.type)) {
          const fromNode = this.graph.getNode(edge.from);
          if (fromNode && pillarMap.has(edge.from)) {
            pillarMap.get(edge.from)!.forEach(pillarId => foundPillars.add(pillarId));
          }
        }
      }
      
      // Check outgoing relationships
      const edges = this.graph.getEdges(entityId);
      for (const edge of edges) {
        if (['BELONGS_TO', 'USES', 'LEVERAGES'].includes(edge.type)) {
          const toNode = this.graph.getNode(edge.to);
          if (toNode && pillarMap.has(edge.to)) {
            pillarMap.get(edge.to)!.forEach(pillarId => foundPillars.add(pillarId));
          }
        }
      }
      
      if (foundPillars.size > 0) {
        return Array.from(foundPillars);
      }
      
      // Recursively check connected entities
      for (const edge of reverseEdges) {
        const pillarIds = findPillarssThroughRelationships(edge.from, depth + 1);
        pillarIds.forEach(pillarId => foundPillars.add(pillarId));
      }
      
      for (const edge of edges) {
        const pillarIds = findPillarssThroughRelationships(edge.to, depth + 1);
        pillarIds.forEach(pillarId => foundPillars.add(pillarId));
      }
      
      return Array.from(foundPillars);
    };
    
    // Second pass: Find associations for all other entities
    const allEntityTypes = ['platform', 'accelerator', 'component', 'framework', 'prototype', 'technology', 'industry', 'casestudy'];
    
    for (const entityType of allEntityTypes) {
      const entities = this.graph.findByType(entityType as any);
      entities.forEach(entity => {
        visited.clear();
        const pillarIds = findPillarssThroughRelationships(entity.id);
        if (pillarIds.length > 0) {
          pillarMap.set(entity.id, pillarIds);
        }
      });
    }
    
    // Store the computed associations in the graph
    this.graph.setPillarAssociations(pillarMap);
    
    // Log statistics
    const allNodes = [
      ...this.graph.findByType('pillar'),
      ...this.graph.findByType('coe'),
      ...this.graph.findByType('platform'),
      ...this.graph.findByType('accelerator'),
      ...this.graph.findByType('component'),
      ...this.graph.findByType('framework'),
      ...this.graph.findByType('prototype'),
      ...this.graph.findByType('technology'),
      ...this.graph.findByType('industry'),
      ...this.graph.findByType('casestudy')
    ];
    
    const stats = {
      totalEntities: allNodes.length,
      entitiesWithPillar: pillarMap.size,
      byPillar: new Map<string, number>()
    };
    
    pillarMap.forEach((pillarIds) => {
      pillarIds.forEach(pillarId => {
        stats.byPillar.set(pillarId, (stats.byPillar.get(pillarId) || 0) + 1);
      });
    });
    
    const breakdownArray: string[] = [];
    stats.byPillar.forEach((count, pillarId) => {
      const pillar = this.graph.getNode(pillarId);
      breakdownArray.push(`${pillar?.data.name || pillarId}: ${count} entities`);
    });
    
    console.log('Pillar associations computed:', {
      total: stats.entitiesWithPillar,
      coverage: `${Math.round(stats.entitiesWithPillar / stats.totalEntities * 100)}%`,
      breakdown: breakdownArray
    });
  }

  private createEdge(from: string, to: string, type: any, metadata?: any): void {
    const edge: GraphEdge = {
      id: `edge_${++this.idCounter}`,
      from,
      to,
      type,
      weight: 1,
      metadata
    };
    this.graph.addEdge(edge);
  }

  // Load a single entity (useful for updates)
  async loadSingleEntity(folder: string, entityId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${folder}/${entityId}.json`);
    const data = await response.json();
    
    const typeMap: Record<string, any> = {
      'pillars': 'pillar',
      'coes': 'coe',
      'platforms': 'platform',
      'accelerators': 'accelerator',
      'components': 'component',
      'frameworks': 'framework',
      'prototypes': 'prototype',
      'technologies': 'technology',
      'industries': 'industry',
      'case-studies': 'casestudy'
    };

    const entityType = typeMap[folder];
    
    // Update or add node
    const existingNode = this.graph.getNode(entityId);
    if (existingNode) {
      this.graph.updateNode(entityId, data);
    } else {
      const node: GraphNode = {
        id: data.id,
        type: entityType,
        data: data,
        metadata: {
          createdAt: new Date(),
          tags: this.extractTags(data, entityType)
        }
      };
      this.graph.addNode(node);
    }
  }
}