// Data loader for populating the capability graph from configuration files

import { CapabilityGraph } from './CapabilityGraph';
import { 
  Pillar, 
  CenterOfExcellence, 
  Platform, 
  Accelerator, 
  Component, 
  DeliveryFramework, 
  InnovationPrototype,
  Technology,
  Industry,
  CaseStudy
} from '../types/entities';
import { GraphNode, GraphEdge, EntityType } from '../types/graph';

export interface CapabilityConfig {
  pillars: Pillar[];
  centersOfExcellence: CenterOfExcellence[];
  platforms: Platform[];
  accelerators: Accelerator[];
  components: Component[];
  frameworks: DeliveryFramework[];
  prototypes: InnovationPrototype[];
  technologies: Technology[];
  industries: Industry[];
  caseStudies: CaseStudy[];
}

export class DataLoader {
  private graph: CapabilityGraph;
  private idCounter: number = 0;

  constructor(graph: CapabilityGraph) {
    this.graph = graph;
  }

  async loadFromConfig(config: CapabilityConfig): Promise<void> {
    // Load entities in order of dependencies
    this.loadPillars(config.pillars);
    this.loadTechnologies(config.technologies);
    this.loadIndustries(config.industries);
    this.loadCentersOfExcellence(config.centersOfExcellence);
    this.loadPlatforms(config.platforms);
    this.loadAccelerators(config.accelerators);
    this.loadComponents(config.components);
    this.loadFrameworks(config.frameworks);
    this.loadPrototypes(config.prototypes);
    this.loadCaseStudies(config.caseStudies);
    
    // Create relationships
    this.createRelationships(config);
  }

  private loadPillars(pillars: Pillar[]): void {
    pillars.forEach(pillar => {
      const node: GraphNode = {
        id: pillar.id,
        type: 'pillar',
        data: pillar,
        metadata: {
          createdAt: new Date(),
          tags: pillar.keyFocusAreas
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadCentersOfExcellence(coes: CenterOfExcellence[]): void {
    coes.forEach(coe => {
      const node: GraphNode = {
        id: coe.id,
        type: 'coe',
        data: coe,
        metadata: {
          createdAt: new Date(),
          tags: coe.keyCompetencies
        }
      };
      this.graph.addNode(node);
      
      // Create relationship to pillar
      if (coe.pillarId) {
        this.createEdge(coe.id, coe.pillarId, 'BELONGS_TO');
      }
    });
  }

  private loadPlatforms(platforms: Platform[]): void {
    platforms.forEach(platform => {
      const node: GraphNode = {
        id: platform.id,
        type: 'platform',
        data: platform,
        metadata: {
          createdAt: new Date(),
          tags: platform.keyFeatures?.map(f => f.name) || []
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadAccelerators(accelerators: Accelerator[]): void {
    accelerators.forEach(accelerator => {
      const node: GraphNode = {
        id: accelerator.id,
        type: 'accelerator',
        data: accelerator,
        metadata: {
          createdAt: new Date(),
          tags: [accelerator.solutionType]
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadComponents(components: Component[]): void {
    components.forEach(component => {
      const node: GraphNode = {
        id: component.id,
        type: 'component',
        data: component,
        metadata: {
          createdAt: new Date(),
          tags: [component.componentType]
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadFrameworks(frameworks: DeliveryFramework[]): void {
    frameworks.forEach(framework => {
      const node: GraphNode = {
        id: framework.id,
        type: 'framework',
        data: framework,
        metadata: {
          createdAt: new Date(),
          tags: [framework.frameworkType, framework.methodology]
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadPrototypes(prototypes: InnovationPrototype[]): void {
    prototypes.forEach(prototype => {
      const node: GraphNode = {
        id: prototype.id,
        type: 'prototype',
        data: prototype,
        metadata: {
          createdAt: new Date(),
          tags: [prototype.readinessLevel]
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadTechnologies(technologies: Technology[]): void {
    technologies.forEach(technology => {
      const node: GraphNode = {
        id: technology.id,
        type: 'technology',
        data: technology,
        metadata: {
          createdAt: new Date(),
          tags: [technology.category]
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadIndustries(industries: Industry[]): void {
    industries.forEach(industry => {
      const node: GraphNode = {
        id: industry.id,
        type: 'industry',
        data: industry,
        metadata: {
          createdAt: new Date(),
          tags: industry.segment ? [industry.segment] : []
        }
      };
      this.graph.addNode(node);
    });
  }

  private loadCaseStudies(caseStudies: CaseStudy[]): void {
    caseStudies.forEach(caseStudy => {
      const node: GraphNode = {
        id: caseStudy.id,
        type: 'casestudy',
        data: caseStudy,
        metadata: {
          createdAt: new Date(),
          tags: caseStudy.outcomes.map(o => o.description)
        }
      };
      this.graph.addNode(node);
    });
  }

  private createRelationships(config: CapabilityConfig): void {
    // CoE -> IPAsset relationships
    config.centersOfExcellence.forEach(coe => {
      // Create USES relationships for IP assets
      [...(coe.ipAssets || []), ...(coe.platforms || [])].forEach(assetId => {
        this.createEdge(coe.id, assetId, 'USES');
      });
      
      // Create USES relationships for technologies
      coe.technologies?.forEach(techId => {
        this.createEdge(coe.id, techId, 'USES');
      });
      
      // Create TARGETS relationships for industries
      coe.targetIndustries?.forEach(industryId => {
        this.createEdge(coe.id, industryId, 'TARGETS');
      });
    });

    // IPAsset -> Technology relationships
    const allAssets = [
      ...config.platforms,
      ...config.accelerators,
      ...config.components,
      ...config.frameworks,
      ...config.prototypes
    ];
    
    allAssets.forEach(asset => {
      asset.technologies?.forEach(techId => {
        this.createEdge(asset.id, techId, 'IMPLEMENTS');
      });
      
      asset.industries?.forEach(industryId => {
        this.createEdge(asset.id, industryId, 'TARGETS');
      });
    });

    // Prototype -> Platform relationships
    config.prototypes.forEach(prototype => {
      // This would need to be configured in the data
      // For now, we'll leave this as a placeholder
    });

    // CaseStudy relationships
    config.caseStudies.forEach(caseStudy => {
      caseStudy.coesInvolved?.forEach(coeId => {
        this.createEdge(coeId, caseStudy.id, 'INVOLVED_IN');
      });
      
      caseStudy.ipAssetsUsed?.forEach(assetId => {
        this.createEdge(caseStudy.id, assetId, 'LEVERAGED');
      });
      
      if (caseStudy.industryId) {
        this.createEdge(caseStudy.id, caseStudy.industryId, 'DELIVERED_FOR');
      }
    });
  }

  private createEdge(from: string, to: string, type: any): void {
    const edge: GraphEdge = {
      id: `edge_${++this.idCounter}`,
      from,
      to,
      type,
      weight: 1
    };
    this.graph.addEdge(edge);
  }

  async loadFromJSON(url: string): Promise<void> {
    const response = await fetch(url);
    const config: CapabilityConfig = await response.json();
    await this.loadFromConfig(config);
  }

  async loadFromFile(file: File): Promise<void> {
    const text = await file.text();
    const config: CapabilityConfig = JSON.parse(text);
    await this.loadFromConfig(config);
  }
}