#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content');

// Entity type mappings
const ENTITY_FOLDERS = {
  'pillar': 'pillars',
  'coe': 'coes',
  'platform': 'platforms',
  'accelerator': 'accelerators',
  'component': 'components',
  'framework': 'frameworks',
  'prototype': 'prototypes',
  'technology': 'technologies',
  'industry': 'industries',
  'casestudy': 'case-studies'
};

const CONTENT_FOLDERS = {
  'pillar': 'pillar',
  'coe': 'coes',
  'platform': 'platform',
  'accelerator': 'accelerator',
  'component': 'component',
  'framework': 'framework',
  'prototype': 'prototype',
  'technology': 'technology',
  'industry': 'industry',
  'casestudy': 'casestudy'
};

class GraphValidator {
  constructor() {
    this.entities = new Map(); // id -> entity
    this.relationships = new Map(); // entityId -> { outgoing: [], incoming: [] }
    this.issues = [];
    this.fixes = [];
    this.stats = {
      totalEntities: 0,
      brokenRelationships: 0,
      fixedRelationships: 0,
      movedEntities: 0,
      deletedRelationships: 0,
      updatedContentPaths: 0
    };
  }

  // Scan all directories and load entities
  scanEntities() {
    console.log('🔍 Scanning for entities...');
    
    Object.entries(ENTITY_FOLDERS).forEach(([type, folder]) => {
      const dirPath = path.join(DATA_DIR, folder);
      if (!fs.existsSync(dirPath)) {
        console.log(`  ⚠️  Directory not found: ${folder}`);
        return;
      }

      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        try {
          const filePath = path.join(dirPath, file);
          const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Extract the actual entity data
          // Handle both nested (CoE) and flat structures
          let entityData, relationships;
          
          if (rawData.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
            // Nested structure (like CoEs)
            entityData = {
              id: rawData.id,
              type: rawData.type || type,
              ...rawData.data
            };
            relationships = rawData.relationships || [];
          } else {
            // Flat structure
            entityData = {
              ...rawData
            };
            relationships = rawData.relationships || [];
          }

          // Ensure type is set
          if (!entityData.type) {
            entityData.type = type;
          }

          // Validate ID matches expected pattern
          const expectedPrefix = type === 'casestudy' ? 'casestudy_' : `${type}_`;
          if (!entityData.id.startsWith(expectedPrefix) && !entityData.id.startsWith('case_')) {
            this.issues.push(`⚠️  Entity ${entityData.id} has incorrect ID prefix (expected: ${expectedPrefix})`);
          }

          // Store entity with metadata
          this.entities.set(entityData.id, {
            ...entityData,
            _file: file,
            _folder: folder,
            _path: filePath,
            _actualType: type,
            _originalStructure: rawData // Keep original structure for saving
          });

          // Store relationships separately
          if (relationships && relationships.length > 0) {
            const parsedRels = { outgoing: [], incoming: [] };
            
            relationships.forEach(rel => {
              if (rel.to) {
                parsedRels.outgoing.push({
                  to: rel.to,
                  type: rel.type || 'RELATED_TO',
                  metadata: rel.metadata
                });
              }
              if (rel.from) {
                parsedRels.incoming.push({
                  from: rel.from,
                  type: rel.type || 'RELATED_TO',
                  metadata: rel.metadata
                });
              }
            });
            
            this.relationships.set(entityData.id, parsedRels);
          }
          
          this.stats.totalEntities++;
        } catch (e) {
          this.issues.push(`❌ Error reading ${file}: ${e.message}`);
        }
      });
    });

    console.log(`  ✅ Found ${this.stats.totalEntities} entities`);
  }

  // Validate all relationships
  validateRelationships() {
    console.log('\n🔗 Validating relationships...');
    
    // First pass: Remove relationships to non-existent entities
    this.relationships.forEach((rels, entityId) => {
      // Check outgoing relationships
      if (rels.outgoing) {
        const validOutgoing = rels.outgoing.filter(rel => {
          if (!this.entities.has(rel.to)) {
            this.issues.push(`  ❌ ${entityId} → ${rel.to} (${rel.type}) - target not found`);
            this.stats.brokenRelationships++;
            this.stats.deletedRelationships++;
            return false; // Remove this relationship
          }
          return true;
        });
        rels.outgoing = validOutgoing;
      }

      // Check incoming relationships
      if (rels.incoming) {
        const validIncoming = rels.incoming.filter(rel => {
          if (!this.entities.has(rel.from)) {
            this.issues.push(`  ❌ ${rel.from} → ${entityId} (${rel.type}) - source not found`);
            this.stats.brokenRelationships++;
            this.stats.deletedRelationships++;
            return false; // Remove this relationship
          }
          return true;
        });
        rels.incoming = validIncoming;
      }
    });

    // Second pass: Ensure bidirectional consistency
    this.relationships.forEach((rels, entityId) => {
      // Check outgoing relationships have corresponding incoming
      if (rels.outgoing) {
        rels.outgoing.forEach(rel => {
          if (!this.relationships.has(rel.to)) {
            this.relationships.set(rel.to, { outgoing: [], incoming: [] });
          }
          
          const targetRels = this.relationships.get(rel.to);
          
          // Check if reverse relationship exists
          const hasReverse = targetRels.incoming.some(
            inc => inc.from === entityId && inc.type === rel.type
          );
          
          if (!hasReverse) {
            targetRels.incoming.push({
              from: entityId,
              type: rel.type,
              metadata: rel.metadata
            });
            this.fixes.push(`  ✅ Added missing reverse: ${entityId} → ${rel.to} (${rel.type})`);
            this.stats.fixedRelationships++;
          }
        });
      }

      // Check incoming relationships have corresponding outgoing
      if (rels.incoming) {
        rels.incoming.forEach(rel => {
          if (!this.relationships.has(rel.from)) {
            this.relationships.set(rel.from, { outgoing: [], incoming: [] });
          }
          
          const sourceRels = this.relationships.get(rel.from);
          
          // Check if forward relationship exists
          const hasForward = sourceRels.outgoing.some(
            out => out.to === entityId && out.type === rel.type
          );
          
          if (!hasForward) {
            sourceRels.outgoing.push({
              to: entityId,
              type: rel.type,
              metadata: rel.metadata
            });
            this.fixes.push(`  ✅ Added missing forward: ${rel.from} → ${entityId} (${rel.type})`);
            this.stats.fixedRelationships++;
          }
        });
      }
    });
  }

  // Validate and fix content paths
  validateContentPaths() {
    console.log('\n📄 Validating content paths...');
    
    this.entities.forEach((entity, id) => {
      const originalData = entity._originalStructure?.data || entity;
      
      if (originalData.content?.source) {
        const actualType = entity._actualType || entity.type;
        const expectedPath = `content/${CONTENT_FOLDERS[actualType] || actualType}/${id.replace(`${actualType}_`, '').replace('casestudy_', '').replace('case_', '')}.md`;
        
        if (originalData.content.source !== expectedPath) {
          const oldPath = originalData.content.source;
          originalData.content.source = expectedPath;
          this.fixes.push(`  ✅ Fixed content path for ${id}: ${oldPath} → ${expectedPath}`);
          this.stats.updatedContentPaths++;
        }

        // Check if markdown file actually exists
        const fullPath = path.join(__dirname, '..', 'public', originalData.content.source);
        if (!fs.existsSync(fullPath)) {
          this.issues.push(`  ⚠️  Missing markdown file for ${id}: ${originalData.content.source}`);
        }
      }
    });
  }

  // Generate updated index.json
  generateIndex() {
    console.log('\n📋 Generating index.json...');
    
    const index = {
      version: "1.2.0",
      lastUpdated: new Date().toISOString(),
      entities: {
        pillars: [],
        centersOfExcellence: [],
        platforms: [],
        accelerators: [],
        components: [],
        frameworks: [],
        prototypes: [],
        technologies: [],
        industries: [],
        caseStudies: []
      }
    };

    const categoryMap = {
      'pillar': 'pillars',
      'coe': 'centersOfExcellence',
      'platform': 'platforms',
      'accelerator': 'accelerators',
      'component': 'components',
      'framework': 'frameworks',
      'prototype': 'prototypes',
      'technology': 'technologies',
      'industry': 'industries',
      'casestudy': 'caseStudies'
    };

    this.entities.forEach((entity, id) => {
      // Use the actual folder type, not the entity's type field
      const actualType = entity._actualType || entity.type;
      const category = categoryMap[actualType];
      
      if (category && index.entities[category]) {
        // Handle nested data structure for CoEs and other entities
        const name = entity.name || entity.data?.name || '';
        
        index.entities[category].push({
          id: entity.id,
          name: name
        });
      }
    });

    // Sort each category by name
    Object.keys(index.entities).forEach(category => {
      index.entities[category].sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
    });

    return index;
  }

  // Save all changes
  async saveChanges(dryRun = false) {
    console.log(`\n💾 ${dryRun ? 'Would save' : 'Saving'} changes...`);
    
    if (dryRun) {
      console.log('  🔍 DRY RUN - No files will be modified');
      return;
    }

    // Save modified entities with their relationships
    let savedCount = 0;
    this.entities.forEach((entity, id) => {
      const originalStructure = entity._originalStructure;
      const rels = this.relationships.get(id);
      
      // Prepare the data to save based on original structure
      let dataToSave;
      
      if (originalStructure.data && typeof originalStructure.data === 'object' && !Array.isArray(originalStructure.data)) {
        // Nested structure (preserve it)
        dataToSave = {
          id: originalStructure.id,
          type: originalStructure.type,
          data: originalStructure.data
        };
        
        // Add relationships if they exist
        if (rels && (rels.outgoing.length > 0 || rels.incoming.length > 0)) {
          const relationships = [];
          
          // Convert to the expected format
          rels.outgoing.forEach(rel => {
            relationships.push({
              type: rel.type,
              to: rel.to,
              metadata: rel.metadata || {}
            });
          });
          
          dataToSave.relationships = relationships;
        } else if (originalStructure.relationships) {
          dataToSave.relationships = originalStructure.relationships;
        }
      } else {
        // Flat structure
        dataToSave = { ...originalStructure };
        
        // Update relationships if they exist
        if (rels && (rels.outgoing.length > 0 || rels.incoming.length > 0)) {
          const relationships = [];
          
          rels.outgoing.forEach(rel => {
            relationships.push({
              type: rel.type,
              to: rel.to,
              metadata: rel.metadata || {}
            });
          });
          
          dataToSave.relationships = relationships;
        }
      }

      const filePath = entity._path;
      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
      savedCount++;
    });

    console.log(`  ✅ Saved ${savedCount} entity files`);

    // Save index
    const index = this.generateIndex();
    const indexPath = path.join(DATA_DIR, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log('  ✅ Updated index.json');
  }

  // Generate detailed report
  generateReport() {
    console.log('\n📊 Validation Report');
    console.log('═══════════════════════════════════════');
    
    console.log('\n📈 Statistics:');
    console.log(`  Total entities: ${this.stats.totalEntities}`);
    console.log(`  Broken relationships found: ${this.stats.brokenRelationships}`);
    console.log(`  Relationships fixed: ${this.stats.fixedRelationships}`);
    console.log(`  Relationships deleted: ${this.stats.deletedRelationships}`);
    console.log(`  Content paths updated: ${this.stats.updatedContentPaths}`);

    if (this.issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      this.issues.slice(0, 50).forEach(issue => console.log(`  ${issue}`));
      if (this.issues.length > 50) {
        console.log(`  ... and ${this.issues.length - 50} more issues`);
      }
    }

    if (this.fixes.length > 0) {
      console.log('\n✅ Fixes Applied:');
      this.fixes.slice(0, 50).forEach(fix => console.log(`  ${fix}`));
      if (this.fixes.length > 50) {
        console.log(`  ... and ${this.fixes.length - 50} more fixes`);
      }
    }

    console.log('\n═══════════════════════════════════════');
  }

  // Main validation process
  async validate(options = {}) {
    const { fix = true, dryRun = false } = options;

    console.log('🚀 Starting Graph Validation and Consistency Check');
    console.log('═══════════════════════════════════════════════════\n');

    // Step 1: Scan all entities
    this.scanEntities();

    // Step 2: Validate relationships
    this.validateRelationships();

    // Step 3: Validate content paths
    this.validateContentPaths();

    // Step 4: Save changes if requested
    if (fix) {
      await this.saveChanges(dryRun);
    }

    // Step 5: Generate report
    this.generateReport();

    // Step 6: Generate lookup files
    if (!dryRun) {
      console.log('\n🔄 Regenerating lookup files...');
      const { execSync } = require('child_process');
      try {
        execSync('node scripts/generate-lookups.js', { stdio: 'inherit' });
      } catch (e) {
        console.log('  ⚠️  Could not regenerate lookup files');
      }
    }

    return {
      issues: this.issues.length,
      fixes: this.fixes.length,
      stats: this.stats
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const noFix = args.includes('--no-fix') || args.includes('-n');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Graph Validation and Consistency Tool

Usage: node scripts/validate-and-fix-graph.js [options]

Options:
  --dry-run, -d    Show what would be changed without modifying files
  --no-fix, -n     Only report issues without fixing them
  --help, -h       Show this help message

Examples:
  node scripts/validate-and-fix-graph.js           # Fix all issues
  node scripts/validate-and-fix-graph.js -d        # Dry run (preview changes)
  node scripts/validate-and-fix-graph.js -n        # Report only
`);
    process.exit(0);
  }

  const validator = new GraphValidator();
  validator.validate({ 
    fix: !noFix, 
    dryRun: dryRun 
  }).then(result => {
    if (result.issues > 0 || result.fixes > 0) {
      console.log(`\n${dryRun ? '🔍 Dry run complete' : '✅ Validation complete'}`);
      console.log(`Found ${result.issues} issues, applied ${result.fixes} fixes`);
    } else {
      console.log('\n✨ Everything looks good! No issues found.');
    }
  });
}

module.exports = GraphValidator;