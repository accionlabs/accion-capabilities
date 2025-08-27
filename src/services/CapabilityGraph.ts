// In-memory graph database implementation

import { 
  GraphNode, 
  GraphEdge, 
  EntityType, 
  RelationshipType, 
  GraphTraversal, 
  GraphStatistics 
} from '../types/graph';

export class CapabilityGraph {
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge[]>;
  private reverseEdges: Map<string, GraphEdge[]>; // For reverse lookups
  private pillarAssociations: Map<string, string[]>; // entityId -> pillarIds for derived relationships
  private indices: {
    byType: Map<EntityType, Set<string>>;
    byPillar: Map<string, Set<string>>;
    byCategory: Map<string, Set<string>>;
    byName: Map<string, string>; // name -> id mapping
  };

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.reverseEdges = new Map();
    this.pillarAssociations = new Map();
    this.indices = {
      byType: new Map(),
      byPillar: new Map(),
      byCategory: new Map(),
      byName: new Map()
    };
  }

  // Node operations
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.indexNode(node);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getNodeByName(name: string): GraphNode | undefined {
    const id = this.indices.byName.get(name.toLowerCase());
    return id ? this.nodes.get(id) : undefined;
  }

  updateNode(id: string, data: any): void {
    const node = this.nodes.get(id);
    if (node) {
      node.data = { ...node.data, ...data };
      node.metadata = {
        ...node.metadata,
        updatedAt: new Date()
      };
    }
  }

  deleteNode(id: string): void {
    const node = this.nodes.get(id);
    if (node) {
      this.removeFromIndices(node);
      this.nodes.delete(id);
      this.edges.delete(id);
      // Remove edges pointing to this node
      this.reverseEdges.get(id)?.forEach(edge => {
        const fromEdges = this.edges.get(edge.from);
        if (fromEdges) {
          const index = fromEdges.findIndex(e => e.to === id);
          if (index !== -1) fromEdges.splice(index, 1);
        }
      });
      this.reverseEdges.delete(id);
    }
  }

  // Edge operations
  addEdge(edge: GraphEdge): void {
    // Add to forward edges
    if (!this.edges.has(edge.from)) {
      this.edges.set(edge.from, []);
    }
    this.edges.get(edge.from)!.push(edge);

    // Add to reverse edges for efficient reverse lookups
    if (!this.reverseEdges.has(edge.to)) {
      this.reverseEdges.set(edge.to, []);
    }
    this.reverseEdges.get(edge.to)!.push(edge);
  }

  getEdges(nodeId: string): GraphEdge[] {
    return this.edges.get(nodeId) || [];
  }

  getReverseEdges(nodeId: string): GraphEdge[] {
    return this.reverseEdges.get(nodeId) || [];
  }

  // Query operations
  findByType(type: EntityType): GraphNode[] {
    const ids = this.indices.byType.get(type) || new Set();
    return Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  findByPillar(pillarId: string): GraphNode[] {
    const ids = this.indices.byPillar.get(pillarId) || new Set();
    return Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  findByCategory(category: string): GraphNode[] {
    const ids = this.indices.byCategory.get(category) || new Set();
    return Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  findRelated(nodeId: string, relationshipType?: RelationshipType, direction: 'forward' | 'reverse' | 'both' = 'forward'): GraphNode[] {
    const nodes: GraphNode[] = [];
    
    if (direction === 'forward' || direction === 'both') {
      const edges = this.edges.get(nodeId) || [];
      const filtered = relationshipType 
        ? edges.filter(e => e.type === relationshipType)
        : edges;
      filtered.forEach(e => {
        const node = this.nodes.get(e.to);
        if (node) nodes.push(node);
      });
    }
    
    if (direction === 'reverse' || direction === 'both') {
      const reverseEdges = this.reverseEdges.get(nodeId) || [];
      const filtered = relationshipType 
        ? reverseEdges.filter(e => e.type === relationshipType)
        : reverseEdges;
      filtered.forEach(e => {
        const node = this.nodes.get(e.from);
        if (node) nodes.push(node);
      });
    }
    
    return nodes;
  }

  // Search with scoring
  search(query: string): GraphNode[] {
    const lowerQuery = query.toLowerCase();
    const results: { node: GraphNode; score: number }[] = [];
    
    this.nodes.forEach(node => {
      let score = 0;
      const data = node.data;
      
      // Check name (highest priority)
      const name = data.name?.toLowerCase() || '';
      if (name.includes(lowerQuery)) {
        score += 10;
        // Bonus for exact match
        if (name === lowerQuery) {
          score += 5;
        }
        // Bonus for starts with
        if (name.startsWith(lowerQuery)) {
          score += 3;
        }
      }
      
      // Check description
      const description = data.description?.toLowerCase() || '';
      if (description.includes(lowerQuery)) {
        score += 5;
      }
      
      // Check tags
      if (node.metadata?.tags && Array.isArray(node.metadata.tags)) {
        const tags = node.metadata.tags.join(' ').toLowerCase();
        if (tags.includes(lowerQuery)) {
          score += 3;
        }
      }
      
      // Check key competencies (for CoEs)
      if (data.keyCompetencies && Array.isArray(data.keyCompetencies)) {
        const competencies = data.keyCompetencies.join(' ').toLowerCase();
        if (competencies.includes(lowerQuery)) {
          score += 2;
        }
      }
      
      // Check technologies
      if (data.technologies && Array.isArray(data.technologies)) {
        data.technologies.forEach((tech: string) => {
          if (tech && typeof tech === 'string' && tech.toLowerCase().includes(lowerQuery)) {
            score += 1;
          }
        });
      }
      
      // Check keyFeatures (for platforms/accelerators)
      if (data.keyFeatures && Array.isArray(data.keyFeatures)) {
        data.keyFeatures.forEach((feature: any) => {
          if (typeof feature === 'string' && feature.toLowerCase().includes(lowerQuery)) {
            score += 1;
          } else if (feature?.name && typeof feature.name === 'string' && feature.name.toLowerCase().includes(lowerQuery)) {
            score += 1;
          }
        });
      }
      
      // Check services (for CoEs)
      if (data.services && Array.isArray(data.services)) {
        data.services.forEach((service: any) => {
          if (service?.name && typeof service.name === 'string' && service.name.toLowerCase().includes(lowerQuery)) {
            score += 1;
          }
          if (service?.description && typeof service.description === 'string' && service.description.toLowerCase().includes(lowerQuery)) {
            score += 0.5;
          }
        });
      }
      
      if (score > 0) {
        results.push({ node, score });
      }
    });
    
    // Sort by score (highest first) and return nodes
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.node);
  }

  // Graph traversal
  traverse(startId: string, depth: number = 2): GraphTraversal {
    const visited = new Set<string>();
    const result: GraphTraversal = {
      nodes: [],
      edges: []
    };
    
    this.dfs(startId, depth, visited, result);
    return result;
  }

  private dfs(nodeId: string, depth: number, visited: Set<string>, result: GraphTraversal): void {
    if (depth === 0 || visited.has(nodeId)) return;
    
    visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (node) {
      result.nodes.push(node);
      const edges = this.edges.get(nodeId) || [];
      result.edges.push(...edges);
      
      edges.forEach(edge => {
        this.dfs(edge.to, depth - 1, visited, result);
      });
    }
  }

  // Analytics
  getStatistics(): GraphStatistics {
    const nodesByType: Record<string, number> = {};
    this.indices.byType.forEach((ids, type) => {
      nodesByType[type] = ids.size;
    });

    return {
      totalNodes: this.nodes.size,
      nodesByType,
      totalEdges: Array.from(this.edges.values()).reduce((sum, edges) => sum + edges.length, 0),
      avgConnections: this.calculateAverageConnections()
    };
  }

  getPath(fromId: string, toId: string, maxDepth: number = 5): GraphNode[] | null {
    const visited = new Set<string>();
    const path: GraphNode[] = [];
    
    const found = this.findPath(fromId, toId, visited, path, maxDepth);
    return found ? path : null;
  }

  private findPath(currentId: string, targetId: string, visited: Set<string>, path: GraphNode[], depth: number): boolean {
    if (depth === 0) return false;
    if (currentId === targetId) {
      const node = this.nodes.get(currentId);
      if (node) path.push(node);
      return true;
    }
    
    visited.add(currentId);
    const currentNode = this.nodes.get(currentId);
    if (!currentNode) return false;
    
    path.push(currentNode);
    
    const edges = this.edges.get(currentId) || [];
    for (const edge of edges) {
      if (!visited.has(edge.to)) {
        if (this.findPath(edge.to, targetId, visited, path, depth - 1)) {
          return true;
        }
      }
    }
    
    path.pop();
    return false;
  }

  private calculateAverageConnections(): number {
    if (this.nodes.size === 0) return 0;
    const edgeCounts = Array.from(this.edges.values()).map(e => e.length);
    return edgeCounts.reduce((sum, count) => sum + count, 0) / this.nodes.size;
  }

  private indexNode(node: GraphNode): void {
    // Index by type
    if (!this.indices.byType.has(node.type)) {
      this.indices.byType.set(node.type, new Set());
    }
    this.indices.byType.get(node.type)!.add(node.id);

    // Index by name
    if (node.data.name) {
      this.indices.byName.set(node.data.name.toLowerCase(), node.id);
    }

    // Index by pillar (for CoEs)
    if (node.type === 'coe' && node.data.pillarId) {
      if (!this.indices.byPillar.has(node.data.pillarId)) {
        this.indices.byPillar.set(node.data.pillarId, new Set());
      }
      this.indices.byPillar.get(node.data.pillarId)!.add(node.id);
    }

    // Index by category (for IP Assets)
    if (node.data.category) {
      if (!this.indices.byCategory.has(node.data.category)) {
        this.indices.byCategory.set(node.data.category, new Set());
      }
      this.indices.byCategory.get(node.data.category)!.add(node.id);
    }
  }

  private removeFromIndices(node: GraphNode): void {
    // Remove from type index
    this.indices.byType.get(node.type)?.delete(node.id);
    
    // Remove from name index
    if (node.data.name) {
      this.indices.byName.delete(node.data.name.toLowerCase());
    }
    
    // Remove from pillar index
    if (node.type === 'coe' && node.data.pillarId) {
      this.indices.byPillar.get(node.data.pillarId)?.delete(node.id);
    }
    
    // Remove from category index
    if (node.data.category) {
      this.indices.byCategory.get(node.data.category)?.delete(node.id);
    }
  }

  // Pillar Association Methods
  setPillarAssociation(entityId: string, pillarIds: string[]): void {
    this.pillarAssociations.set(entityId, pillarIds);
  }

  getPillarAssociation(entityId: string): string[] | undefined {
    return this.pillarAssociations.get(entityId);
  }

  // Check if an entity belongs to multiple pillars
  isMultiPillar(entityId: string): boolean {
    const pillars = this.pillarAssociations.get(entityId);
    return pillars ? pillars.length > 1 : false;
  }

  setPillarAssociations(associations: Map<string, string[]>): void {
    this.pillarAssociations = associations;
  }

  getAllPillarAssociations(): Map<string, string[]> {
    return new Map(this.pillarAssociations);
  }

  // Get all entities associated with a pillar (direct and indirect)
  getEntitiesByPillar(pillarId: string): GraphNode[] {
    const entities: GraphNode[] = [];
    this.pillarAssociations.forEach((associatedPillarIds, entityId) => {
      if (associatedPillarIds.includes(pillarId)) {
        const node = this.getNode(entityId);
        if (node) entities.push(node);
      }
    });
    return entities;
  }

  // Get pillar summaries with counts by entity type
  getPillarSummaries(): Map<string, { pillar: GraphNode; counts: Record<string, number>; total: number }> {
    const summaries = new Map<string, { pillar: GraphNode; counts: Record<string, number>; total: number }>();
    
    // Initialize summaries for each pillar
    const pillars = this.findByType('pillar' as EntityType);
    pillars.forEach(pillar => {
      summaries.set(pillar.id, {
        pillar,
        counts: {},
        total: 0
      });
    });

    // Add direct CoE relationships (BELONGS_TO)
    const coes = this.findByType('coe' as EntityType);
    coes.forEach(coe => {
      const edges = this.getEdges(coe.id);
      const belongsToEdge = edges.find(e => e.type === 'BELONGS_TO');
      if (belongsToEdge && summaries.has(belongsToEdge.to)) {
        const summary = summaries.get(belongsToEdge.to)!;
        summary.counts['coe'] = (summary.counts['coe'] || 0) + 1;
        summary.total++;
      }
    });

    // Count all entities by their pillar associations
    this.pillarAssociations.forEach((pillarIds, entityId) => {
      const node = this.getNode(entityId);
      if (node && node.type !== 'coe' && node.type !== 'pillar') { // CoEs already counted above, skip pillars
        // Add to each pillar this entity is associated with
        pillarIds.forEach(pillarId => {
          if (summaries.has(pillarId)) {
            const summary = summaries.get(pillarId)!;
            summary.counts[node.type] = (summary.counts[node.type] || 0) + 1;
            summary.total++;
          }
        });
      }
    });

    return summaries;
  }

  // Serialization
  toJSON(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.entries()).flatMap(([from, edges]) => edges),
      pillarAssociations: Array.from(this.pillarAssociations.entries())
    });
  }

  static fromJSON(json: string): CapabilityGraph {
    const data = JSON.parse(json);
    const graph = new CapabilityGraph();
    
    data.nodes.forEach((node: GraphNode) => graph.addNode(node));
    data.edges.forEach((edge: GraphEdge) => graph.addEdge(edge));
    
    // Add pillar associations if they exist
    if (data.pillarAssociations) {
      const associations = new Map<string, string[]>(data.pillarAssociations);
      graph.setPillarAssociations(associations);
    }
    
    return graph;
  }
}