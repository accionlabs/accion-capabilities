import { CapabilityGraph } from './CapabilityGraph';
import { GraphNode, EntityType } from '../types/graph';

export interface IndustrySummary {
  industry: GraphNode;
  metrics: {
    caseStudies: number;
    coes: number;
    platforms: number;
    accelerators: number;
    totalSolutions: number;
  };
  caseStudies: GraphNode[];
  coes: GraphNode[];
  platforms: GraphNode[];
  accelerators: GraphNode[];
  impactMetrics?: {
    costSavings?: string;
    efficiencyGains?: string;
    timeToMarket?: string;
    customerSatisfaction?: string;
  };
}

export class IndustryAnalytics {
  constructor(private graph: CapabilityGraph) {}

  /**
   * Get comprehensive summary for all industries
   */
  getAllIndustrySummaries(): IndustrySummary[] {
    const industries = this.graph.findByType('industry' as EntityType);
    return industries
      .map(industry => this.getIndustrySummary(industry.id))
      .filter(summary => summary !== null) as IndustrySummary[];
  }

  /**
   * Get detailed summary for a specific industry
   */
  getIndustrySummary(industryId: string): IndustrySummary | null {
    const industry = this.graph.getNode(industryId);
    if (!industry || industry.type !== 'industry') return null;

    // Find all entities targeting this industry
    const caseStudies = this.findEntitiesTargetingIndustry(industryId, 'casestudy');
    const coes = this.findEntitiesTargetingIndustry(industryId, 'coe');
    const platforms = this.findEntitiesTargetingIndustry(industryId, 'platform');
    const accelerators = this.findEntitiesTargetingIndustry(industryId, 'accelerator');

    // Extract impact metrics from case studies
    const impactMetrics = this.extractImpactMetrics(caseStudies);

    return {
      industry,
      metrics: {
        caseStudies: caseStudies.length,
        coes: coes.length,
        platforms: platforms.length,
        accelerators: accelerators.length,
        totalSolutions: caseStudies.length + platforms.length + accelerators.length
      },
      caseStudies,
      coes,
      platforms,
      accelerators,
      impactMetrics
    };
  }

  /**
   * Find entities that target a specific industry
   */
  private findEntitiesTargetingIndustry(industryId: string, entityType: EntityType): GraphNode[] {
    const allEntities = this.graph.findByType(entityType);
    return allEntities.filter(entity => {
      const edges = this.graph.getEdges(entity.id);
      return edges.some(edge => 
        edge.type === 'TARGETS' && edge.to === industryId
      );
    });
  }

  /**
   * Extract impact metrics from case studies
   */
  private extractImpactMetrics(caseStudies: GraphNode[]): IndustrySummary['impactMetrics'] {
    const metrics: IndustrySummary['impactMetrics'] = {};
    
    // Aggregate metrics from case study data
    caseStudies.forEach(cs => {
      const data = cs.data as any;
      if (data.metrics) {
        // Extract and aggregate common impact metrics
        if (data.metrics.costSavings) {
          metrics.costSavings = this.aggregateMetric(metrics.costSavings, data.metrics.costSavings);
        }
        if (data.metrics.efficiencyGains) {
          metrics.efficiencyGains = this.aggregateMetric(metrics.efficiencyGains, data.metrics.efficiencyGains);
        }
        if (data.metrics.timeToMarket) {
          metrics.timeToMarket = this.aggregateMetric(metrics.timeToMarket, data.metrics.timeToMarket);
        }
        if (data.metrics.customerSatisfaction) {
          metrics.customerSatisfaction = this.aggregateMetric(metrics.customerSatisfaction, data.metrics.customerSatisfaction);
        }
      }
    });

    return metrics;
  }

  /**
   * Helper to aggregate metric values
   */
  private aggregateMetric(existing: string | undefined, newValue: string): string {
    // Simple aggregation - in production, you might want more sophisticated logic
    if (!existing) return newValue;
    return `${existing}, ${newValue}`;
  }

  /**
   * Get industry relationships and capabilities
   */
  getIndustryCapabilities(industryId: string) {
    const summary = this.getIndustrySummary(industryId);
    if (!summary) return null;

    // Group capabilities by pillar
    const capabilitiesByPillar = new Map<string, {
      pillar: GraphNode;
      coes: GraphNode[];
      solutions: GraphNode[];
    }>();

    // Map CoEs to their pillars
    summary.coes.forEach(coe => {
      const edges = this.graph.getEdges(coe.id);
      const belongsTo = edges.find(e => e.type === 'BELONGS_TO');
      if (belongsTo) {
        const pillar = this.graph.getNode(belongsTo.to);
        if (pillar && pillar.type === 'pillar') {
          if (!capabilitiesByPillar.has(pillar.id)) {
            capabilitiesByPillar.set(pillar.id, {
              pillar,
              coes: [],
              solutions: []
            });
          }
          capabilitiesByPillar.get(pillar.id)!.coes.push(coe);
        }
      }
    });

    // Map platforms and accelerators to pillars
    [...summary.platforms, ...summary.accelerators].forEach(solution => {
      const edges = this.graph.getEdges(solution.id);
      const belongsTo = edges.find(e => e.type === 'BELONGS_TO');
      if (belongsTo) {
        const pillar = this.graph.getNode(belongsTo.to);
        if (pillar && pillar.type === 'pillar') {
          if (!capabilitiesByPillar.has(pillar.id)) {
            capabilitiesByPillar.set(pillar.id, {
              pillar,
              coes: [],
              solutions: []
            });
          }
          capabilitiesByPillar.get(pillar.id)!.solutions.push(solution);
        }
      }
    });

    return {
      summary,
      capabilitiesByPillar: Array.from(capabilitiesByPillar.values())
    };
  }

  /**
   * Get success stories for an industry
   */
  getIndustrySuccessStories(industryId: string, limit: number = 5) {
    const summary = this.getIndustrySummary(industryId);
    if (!summary) return [];

    // Sort case studies by recency or impact
    return summary.caseStudies
      .sort((a, b) => {
        // Sort by date if available, otherwise by name
        const dateA = (a.data as any).date || '';
        const dateB = (b.data as any).date || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, limit);
  }
}