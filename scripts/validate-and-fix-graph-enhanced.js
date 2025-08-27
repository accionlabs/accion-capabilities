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
    this.entityMoves = new Map(); // oldId -> newId
    this.issues = [];
    this.fixes = [];
    this.stats = {
      totalEntities: 0,
      movedEntities: 0,
      renamedEntities: 0,
      brokenRelationships: 0,
      fixedRelationships: 0,
      deletedRelationships: 0,
      updatedContentPaths: 0,
      updatedReferences: 0
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

          // Check if entity has been moved (ID doesn't match folder type)
          const expectedPrefix = type === 'casestudy' ? 'casestudy_' : `${type}_`;
          const hasCorrectPrefix = entityData.id.startsWith(expectedPrefix) || 
                                  (type === 'casestudy' && entityData.id.startsWith('case_'));

          let newId = entityData.id;
          let needsMove = false;

          if (!hasCorrectPrefix) {
            // Entity has been moved to a different folder
            needsMove = true;
            
            // Generate new ID based on current folder
            const idSuffix = entityData.id.replace(/^[^_]+_/, ''); // Remove old prefix
            newId = `${expectedPrefix}${idSuffix}`;
            
            this.entityMoves.set(entityData.id, newId);
            this.stats.movedEntities++;
            
            this.fixes.push(`  🔄 Entity moved: ${entityData.id} → ${newId} (from ${entityData.type} to ${type})`);
            
            // Update entity data
            entityData.id = newId;
            entityData.type = type;
          }

          // Ensure type matches folder
          if (entityData.type !== type) {
            entityData.type = type;
            this.fixes.push(`  ✅ Updated type for ${entityData.id}: ${entityData.type} → ${type}`);
          }

          // Store entity with metadata
          this.entities.set(newId, {
            ...entityData,
            _file: file,
            _folder: folder,
            _path: filePath,
            _actualType: type,
            _originalId: rawData.id,
            _originalStructure: rawData,
            _needsMove: needsMove,
            _newFilename: needsMove ? `${newId}.json` : file
          });

          // Store relationships (will be updated later if IDs changed)
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
            
            this.relationships.set(newId, parsedRels);
          }
          
          this.stats.totalEntities++;
        } catch (e) {
          this.issues.push(`❌ Error reading ${file}: ${e.message}`);
        }
      });
    });

    console.log(`  ✅ Found ${this.stats.totalEntities} entities`);
    if (this.stats.movedEntities > 0) {
      console.log(`  🔄 Detected ${this.stats.movedEntities} moved entities`);
    }
  }

  // Update all references to moved entities
  updateReferences() {
    if (this.entityMoves.size === 0) return;
    
    console.log('\n🔄 Updating references to moved entities...');
    
    // Update relationships
    this.relationships.forEach((rels, entityId) => {
      let updated = false;
      
      // Update outgoing relationships
      if (rels.outgoing) {
        rels.outgoing.forEach(rel => {
          if (this.entityMoves.has(rel.to)) {
            const newId = this.entityMoves.get(rel.to);
            this.fixes.push(`  ✅ Updated reference: ${entityId} → ${rel.to} changed to ${newId}`);
            rel.to = newId;
            updated = true;
            this.stats.updatedReferences++;
          }
        });
      }
      
      // Update incoming relationships
      if (rels.incoming) {
        rels.incoming.forEach(rel => {
          if (this.entityMoves.has(rel.from)) {
            const newId = this.entityMoves.get(rel.from);
            this.fixes.push(`  ✅ Updated reference: ${rel.from} → ${entityId} changed to ${newId}`);
            rel.from = newId;
            updated = true;
            this.stats.updatedReferences++;
          }
        });
      }
    });
    
    // Also need to update any references in the old ID's relationships
    this.entityMoves.forEach((newId, oldId) => {
      if (this.relationships.has(oldId) && !this.relationships.has(newId)) {
        // Move relationships from old ID to new ID
        this.relationships.set(newId, this.relationships.get(oldId));
        this.relationships.delete(oldId);
      }
    });
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
            return false;
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
            return false;
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
        const idSuffix = id.replace(`${actualType}_`, '').replace('casestudy_', '').replace('case_', '');
        const expectedPath = `content/${CONTENT_FOLDERS[actualType] || actualType}/${idSuffix}.md`;
        
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
      const actualType = entity._actualType || entity.type;
      const category = categoryMap[actualType];
      
      if (category && index.entities[category]) {
        const name = entity.name || entity.data?.name || '';
        
        index.entities[category].push({
          id: id,  // Use the new ID
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
      if (this.entityMoves.size > 0) {
        console.log('\n  📝 Files that would be renamed:');
        this.entities.forEach((entity, id) => {
          if (entity._needsMove) {
            console.log(`    ${entity._file} → ${entity._newFilename}`);
          }
        });
      }
      return;
    }

    // Save modified entities with their relationships
    let savedCount = 0;
    let renamedCount = 0;
    
    this.entities.forEach((entity, id) => {
      const originalStructure = entity._originalStructure;
      const rels = this.relationships.get(id);
      
      // Prepare the data to save based on original structure
      let dataToSave;
      
      if (originalStructure.data && typeof originalStructure.data === 'object' && !Array.isArray(originalStructure.data)) {
        // Nested structure (preserve it)
        dataToSave = {
          id: id,  // Use new ID
          type: entity.type,  // Use updated type
          data: {
            ...originalStructure.data,
            content: originalStructure.data.content  // Preserve content with updated path
          }
        };
        
        // Add relationships if they exist
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
        } else if (originalStructure.relationships) {
          // Update existing relationships with new IDs
          dataToSave.relationships = originalStructure.relationships.map(rel => {
            if (rel.to && this.entityMoves.has(rel.to)) {
              return { ...rel, to: this.entityMoves.get(rel.to) };
            }
            return rel;
          });
        }
      } else {
        // Flat structure
        dataToSave = {
          ...originalStructure,
          id: id,  // Use new ID
          type: entity.type  // Use updated type
        };
        
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

      // Handle file rename if entity was moved
      if (entity._needsMove) {
        const oldPath = entity._path;
        const newPath = path.join(path.dirname(oldPath), entity._newFilename);
        
        // Delete old file
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        
        // Write to new file
        fs.writeFileSync(newPath, JSON.stringify(dataToSave, null, 2));
        renamedCount++;
        console.log(`  📝 Renamed: ${entity._file} → ${entity._newFilename}`);
      } else {
        // Just update existing file
        const filePath = entity._path;
        fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
      }
      
      savedCount++;
    });

    console.log(`  ✅ Saved ${savedCount} entity files`);
    if (renamedCount > 0) {
      console.log(`  📝 Renamed ${renamedCount} files`);
    }

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
    console.log(`  Moved entities: ${this.stats.movedEntities}`);
    console.log(`  Updated references: ${this.stats.updatedReferences}`);
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

    console.log('🚀 Starting Enhanced Graph Validation and Consistency Check');
    console.log('════════════════════════════════════════════════════════════\n');

    // Step 1: Scan all entities
    this.scanEntities();

    // Step 2: Update references to moved entities
    this.updateReferences();

    // Step 3: Validate relationships
    this.validateRelationships();

    // Step 4: Validate content paths
    this.validateContentPaths();

    // Step 5: Save changes if requested
    if (fix) {
      await this.saveChanges(dryRun);
    }

    // Step 6: Generate report
    this.generateReport();

    // Step 7: Generate lookup files
    if (!dryRun && fix) {
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
Enhanced Graph Validation and Consistency Tool

This tool handles entity moves between folders, automatically updating:
- Entity IDs to match their new type
- Entity type fields
- File names to match new IDs
- All relationship references to use new IDs
- Content paths

Usage: node scripts/validate-and-fix-graph-enhanced.js [options]

Options:
  --dry-run, -d    Show what would be changed without modifying files
  --no-fix, -n     Only report issues without fixing them
  --help, -h       Show this help message

Examples:
  node scripts/validate-and-fix-graph-enhanced.js           # Fix all issues
  node scripts/validate-and-fix-graph-enhanced.js -d        # Dry run (preview changes)
  node scripts/validate-and-fix-graph-enhanced.js -n        # Report only
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