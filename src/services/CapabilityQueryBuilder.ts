// Query builder for complex graph queries

import { CapabilityGraph } from './CapabilityGraph';
import { 
  CenterOfExcellence, 
  IPAsset, 
  Platform, 
  Accelerator,
  Component,
  DeliveryFramework,
  InnovationPrototype,
  Technology,
  CaseStudy,
  Pillar
} from '../types/entities';
import { GraphNode } from '../types/graph';

export interface PillarCapabilityMap {
  pillar: Pillar;
  coes: CenterOfExcellence[];
  ipAssets: IPAsset[];
  technologies: Technology[];
  metrics: {
    coeCount: number;
    assetCount: number;
    technologyCount: number;
  };
}

export interface InnovationFlow {
  prototype: InnovationPrototype;
  targetPlatforms: Platform[];
  readinessLevel: string;
}

// ROI Analysis removed - focusing on capabilities instead of financials

export interface CoEAssetMapping {
  coe: CenterOfExcellence;
  platforms: Platform[];
  accelerators: Accelerator[];
  components: Component[];
  frameworks: DeliveryFramework[];
  prototypes: InnovationPrototype[];
}

export class CapabilityQueryBuilder {
  private graph: CapabilityGraph;

  constructor(graph: CapabilityGraph) {
    this.graph = graph;
  }

  // Get all IP assets used by a specific CoE
  getIPAssetsForCoE(coeId: string): IPAsset[] {
    const coeNode = this.graph.getNode(coeId);
    if (!coeNode || coeNode.type !== 'coe') return [];
    
    const coe = coeNode.data as CenterOfExcellence;
    const assets: IPAsset[] = [];
    
    // Get assets from the ipAssets array
    coe.ipAssets?.forEach(assetId => {
      const assetNode = this.graph.getNode(assetId);
      if (assetNode && this.isIPAsset(assetNode.type)) {
        assets.push(assetNode.data as IPAsset);
      }
    });
    
    // Also get assets through USES relationship
    const relatedNodes = this.graph.findRelated(coeId, 'USES');
    relatedNodes.forEach(node => {
      if (this.isIPAsset(node.type)) {
        assets.push(node.data as IPAsset);
      }
    });
    
    return assets;
  }

  // Get all CoEs that use a specific IP asset
  getCoEsUsingAsset(assetId: string): CenterOfExcellence[] {
    const coeMap = new Map<string, CenterOfExcellence>();
    
    // Get CoEs through reverse USES relationship
    const relatedNodes = this.graph.findRelated(assetId, 'USES', 'reverse');
    relatedNodes.forEach(node => {
      if (node.type === 'coe') {
        const coe = node.data as CenterOfExcellence;
        coeMap.set(coe.id, coe);
      }
    });
    
    // Also check through direct references
    const allCoEs = this.graph.findByType('coe');
    allCoEs.forEach(node => {
      const coe = node.data as CenterOfExcellence;
      if (coe.ipAssets?.includes(assetId) || coe.platforms?.includes(assetId)) {
        coeMap.set(coe.id, coe);
      }
    });
    
    return Array.from(coeMap.values());
  }

  // Get complete capability map for a pillar
  getPillarCapabilities(pillarId: string): PillarCapabilityMap | null {
    const pillarNode = this.graph.getNode(pillarId);
    if (!pillarNode || pillarNode.type !== 'pillar') return null;
    
    const pillar = pillarNode.data as Pillar;
    const coes = this.graph.findByPillar(pillarId).map(n => n.data as CenterOfExcellence);
    const ipAssets: IPAsset[] = [];
    const technologies: Technology[] = [];
    const techIds = new Set<string>();
    
    coes.forEach(coe => {
      // Get IP assets for each CoE
      const assets = this.getIPAssetsForCoE(coe.id);
      assets.forEach(asset => {
        if (!ipAssets.find(a => a.id === asset.id)) {
          ipAssets.push(asset);
          
          // Platform metrics could be tracked here if needed
          // For now, we're not tracking financial metrics
        }
      });
      
      // Get technologies
      coe.technologies?.forEach(techId => techIds.add(techId));
    });
    
    // Fetch technology nodes
    techIds.forEach(techId => {
      const techNode = this.graph.getNode(techId);
      if (techNode && techNode.type === 'technology') {
        technologies.push(techNode.data as Technology);
      }
    });
    
    return {
      pillar,
      coes,
      ipAssets,
      technologies,
      metrics: {
        coeCount: coes.length,
        assetCount: ipAssets.length,
        technologyCount: technologies.length
      }
    };
  }

  // Get innovation pipeline (prototype -> platform evolution)
  getInnovationPipeline(): InnovationFlow[] {
    const prototypes = this.graph.findByType('prototype');
    return prototypes.map(protoNode => {
      const prototype = protoNode.data as InnovationPrototype;
      const targetPlatforms = this.graph.findRelated(protoNode.id, 'FEEDS_INTO')
        .filter(n => n.type === 'platform')
        .map(n => n.data as Platform);
      
      return {
        prototype,
        targetPlatforms,
        readinessLevel: prototype.readinessLevel || 'concept'
      };
    });
  }

  // Calculate platform metrics (no longer tracking ROI)
  calculatePlatformMetrics(): {
    totalPlatforms: number;
    byMaturityLevel: Record<string, number>;
    byPlatform: Array<{
      name: string;
      maturityLevel?: string;
      deploymentModels?: string[];
    }>;
  } {
    const platforms = this.graph.findByType('platform')
      .map(n => n.data as Platform);
    
    const byMaturityLevel: Record<string, number> = {};
    
    const byPlatform = platforms.map(p => {
      if (p.maturityLevel) {
        byMaturityLevel[p.maturityLevel] = (byMaturityLevel[p.maturityLevel] || 0) + 1;
      }
      
      return {
        name: p.name,
        maturityLevel: p.maturityLevel,
        deploymentModels: p.deploymentModels
      };
    });
    
    return {
      totalPlatforms: platforms.length,
      byMaturityLevel,
      byPlatform
    };
  }

  // Get complete asset mapping for a CoE
  getCoEAssetMapping(coeId: string): CoEAssetMapping | null {
    const coeNode = this.graph.getNode(coeId);
    if (!coeNode || coeNode.type !== 'coe') return null;
    
    const coe = coeNode.data as CenterOfExcellence;
    const assets = this.getIPAssetsForCoE(coeId);
    
    return {
      coe,
      platforms: assets.filter(a => a.category === 'platform') as Platform[],
      accelerators: assets.filter(a => a.category === 'accelerator') as Accelerator[],
      components: assets.filter(a => a.category === 'component') as Component[],
      frameworks: assets.filter(a => a.category === 'framework') as DeliveryFramework[],
      prototypes: assets.filter(a => a.category === 'prototype') as InnovationPrototype[]
    };
  }

  // Get case studies for a specific CoE or IP asset
  getCaseStudies(entityId: string): CaseStudy[] {
    const caseStudies: CaseStudy[] = [];
    
    // Get case studies through INVOLVED_IN or LEVERAGED relationships
    const relatedNodes = this.graph.findRelated(entityId, undefined, 'both');
    relatedNodes.forEach(node => {
      if (node.type === 'casestudy') {
        const caseStudy = node.data as CaseStudy;
        if (caseStudy.coesInvolved?.includes(entityId) || 
            caseStudy.ipAssetsUsed?.includes(entityId)) {
          caseStudies.push(caseStudy);
        }
      }
    });
    
    // Also check all case studies
    const allCaseStudies = this.graph.findByType('casestudy');
    allCaseStudies.forEach(node => {
      const cs = node.data as CaseStudy;
      if ((cs.coesInvolved?.includes(entityId) || cs.ipAssetsUsed?.includes(entityId)) &&
          !caseStudies.find(c => c.id === cs.id)) {
        caseStudies.push(cs);
      }
    });
    
    return caseStudies;
  }

  // Search across all entities
  searchAll(query: string): {
    pillars: Pillar[];
    coes: CenterOfExcellence[];
    platforms: Platform[];
    accelerators: Accelerator[];
    components: Component[];
    frameworks: DeliveryFramework[];
    prototypes: InnovationPrototype[];
  } {
    const results = this.graph.search(query);
    
    return {
      pillars: results.filter(n => n.type === 'pillar').map(n => n.data as Pillar),
      coes: results.filter(n => n.type === 'coe').map(n => n.data as CenterOfExcellence),
      platforms: results.filter(n => n.type === 'platform').map(n => n.data as Platform),
      accelerators: results.filter(n => n.type === 'accelerator').map(n => n.data as Accelerator),
      components: results.filter(n => n.type === 'component').map(n => n.data as Component),
      frameworks: results.filter(n => n.type === 'framework').map(n => n.data as DeliveryFramework),
      prototypes: results.filter(n => n.type === 'prototype').map(n => n.data as InnovationPrototype)
    };
  }

  // Get related entities for visualization
  getRelatedEntities(entityId: string, depth: number = 2): {
    nodes: GraphNode[];
    edges: Array<{ from: string; to: string; type: string }>;
  } {
    const traversal = this.graph.traverse(entityId, depth);
    return {
      nodes: traversal.nodes,
      edges: traversal.edges.map(e => ({
        from: e.from,
        to: e.to,
        type: e.type
      }))
    };
  }

  private isIPAsset(type: string): boolean {
    return ['platform', 'accelerator', 'component', 'framework', 'prototype'].includes(type);
  }
}