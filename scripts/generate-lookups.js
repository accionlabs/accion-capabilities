const fs = require('fs');
const path = require('path');

// Read all entity files and create lookup tables
function generateLookups() {
  const dataPath = path.join(__dirname, '../public/data');
  const lookupPath = path.join(dataPath, 'lookups');
  
  // Ensure lookup directory exists
  if (!fs.existsSync(lookupPath)) {
    fs.mkdirSync(lookupPath, { recursive: true });
  }

  // Entity types and their folders
  const entityTypes = [
    { type: 'pillar', folder: 'pillars' },
    { type: 'coe', folder: 'coes' },
    { type: 'platform', folder: 'platforms' },
    { type: 'accelerator', folder: 'accelerators' },
    { type: 'component', folder: 'components' },
    { type: 'framework', folder: 'frameworks' },
    { type: 'prototype', folder: 'prototypes' },
    { type: 'technology', folder: 'technologies' },
    { type: 'industry', folder: 'industries' },
    { type: 'casestudy', folder: 'case-studies' }
  ];

  // Create a master lookup with all entities
  const masterLookup = {
    entities: {},
    byType: {},
    relationships: []
  };

  // Process each entity type
  entityTypes.forEach(({ type, folder }) => {
    const folderPath = path.join(dataPath, folder);
    masterLookup.byType[type] = [];
    
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
      
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Extract key information
        const entity = {
          id: content.id,
          type: content.type || type,
          name: content.data?.name || content.name,
          description: content.data?.description || content.description,
          category: content.data?.category || content.category,
          tags: content.metadata?.tags || [],
          folder: folder,
          file: file
        };
        
        // Add to master lookup
        masterLookup.entities[entity.id] = entity;
        masterLookup.byType[type].push(entity.id);
        
        // Extract relationships
        if (content.relationships) {
          // Handle both array format and object format with outgoing/incoming
          const rels = Array.isArray(content.relationships) 
            ? content.relationships 
            : content.relationships.outgoing || [];
            
          rels.forEach(rel => {
            masterLookup.relationships.push({
              from: content.id,
              to: rel.to,
              type: rel.type,
              metadata: rel.metadata
            });
          });
        }
      });
    }
  });

  // Write master lookup
  fs.writeFileSync(
    path.join(lookupPath, 'entities.json'),
    JSON.stringify(masterLookup, null, 2)
  );

  // Create simplified lookups for common queries
  
  // 1. Technologies lookup
  const techLookup = {};
  masterLookup.byType.technology?.forEach(id => {
    const tech = masterLookup.entities[id];
    techLookup[id] = {
      name: tech.name,
      category: tech.category,
      description: tech.description
    };
  });
  fs.writeFileSync(
    path.join(lookupPath, 'technologies.json'),
    JSON.stringify(techLookup, null, 2)
  );

  // 2. Pillars lookup
  const pillarLookup = {};
  masterLookup.byType.pillar?.forEach(id => {
    const pillar = masterLookup.entities[id];
    pillarLookup[id] = {
      name: pillar.name,
      description: pillar.description
    };
  });
  fs.writeFileSync(
    path.join(lookupPath, 'pillars.json'),
    JSON.stringify(pillarLookup, null, 2)
  );

  // 3. Valid relationship types
  const relationshipTypes = {
    types: [
      'BELONGS_TO',
      'USES',
      'IMPLEMENTS',
      'TARGETS',
      'LEVERAGES',
      'DELIVERS',
      'DEPENDS_ON',
      'RELATED_TO',
      'INVOLVED_IN'
    ],
    descriptions: {
      'BELONGS_TO': 'Entity is part of or owned by another entity (e.g., CoE belongs to Pillar)',
      'USES': 'Entity uses or depends on another entity (e.g., CoE uses Technology)',
      'IMPLEMENTS': 'Entity implements or realizes another entity (e.g., Platform implements Framework)',
      'TARGETS': 'Entity is designed for or targets another entity (e.g., Accelerator targets Industry)',
      'LEVERAGES': 'Entity leverages or builds upon another entity',
      'DELIVERS': 'Entity delivers or provides another entity',
      'DEPENDS_ON': 'Entity has a dependency on another entity',
      'RELATED_TO': 'General relationship between entities',
      'INVOLVED_IN': 'Entity is involved in or participates in another entity (e.g., Technology involved in Case Study)'
    }
  };
  fs.writeFileSync(
    path.join(lookupPath, 'relationship-types.json'),
    JSON.stringify(relationshipTypes, null, 2)
  );

  console.log('✅ Lookup files generated successfully');
  console.log(`   - Total entities: ${Object.keys(masterLookup.entities).length}`);
  console.log(`   - Total relationships: ${masterLookup.relationships.length}`);
  
  // Print entity counts by type
  Object.keys(masterLookup.byType).forEach(type => {
    const count = masterLookup.byType[type].length;
    if (count > 0) {
      console.log(`   - ${type}: ${count} entities`);
    }
  });
}

// Run the generation
generateLookups();