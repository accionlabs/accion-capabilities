const fs = require('fs');
const path = require('path');

// Read the central relationships file
const dataDir = path.join(__dirname, '..', 'public', 'data');
const relationshipsPath = path.join(dataDir, 'relationships.json');
const relationshipsData = JSON.parse(fs.readFileSync(relationshipsPath, 'utf8'));

// Map to store relationships for each entity
const entityRelationships = {};

// Process each relationship
relationshipsData.relationships.forEach(rel => {
  // Add outgoing relationship to the source entity
  if (!entityRelationships[rel.from]) {
    entityRelationships[rel.from] = {
      outgoing: [],
      incoming: []
    };
  }
  entityRelationships[rel.from].outgoing.push({
    to: rel.to,
    type: rel.type,
    metadata: rel.metadata
  });

  // Add incoming relationship reference to the target entity
  if (!entityRelationships[rel.to]) {
    entityRelationships[rel.to] = {
      outgoing: [],
      incoming: []
    };
  }
  entityRelationships[rel.to].incoming.push({
    from: rel.from,
    type: rel.type,
    metadata: rel.metadata
  });
});

// Function to find entity file
function findEntityFile(entityId) {
  const directories = [
    'pillars',
    'coes',
    'platforms',
    'accelerators',
    'components',
    'frameworks',
    'prototypes',
    'technologies',
    'industries',
    'case-studies'
  ];

  for (const dir of directories) {
    const filePath = path.join(dataDir, dir, `${entityId}.json`);
    if (fs.existsSync(filePath)) {
      return { path: filePath, dir };
    }
  }
  return null;
}

// Update each entity file with its relationships
let updatedCount = 0;
let errorCount = 0;
const errors = [];

Object.keys(entityRelationships).forEach(entityId => {
  const fileInfo = findEntityFile(entityId);
  
  if (!fileInfo) {
    console.warn(`⚠️  Could not find file for entity: ${entityId}`);
    errorCount++;
    errors.push(`Entity not found: ${entityId}`);
    return;
  }

  try {
    // Read the entity file
    const entityData = JSON.parse(fs.readFileSync(fileInfo.path, 'utf8'));
    
    // Add relationships to the entity
    entityData.relationships = {
      outgoing: entityRelationships[entityId].outgoing || [],
      incoming: entityRelationships[entityId].incoming || []
    };
    
    // Write back the updated entity
    fs.writeFileSync(fileInfo.path, JSON.stringify(entityData, null, 2));
    console.log(`✅ Updated ${fileInfo.dir}/${entityId}.json`);
    updatedCount++;
  } catch (error) {
    console.error(`❌ Error updating ${entityId}:`, error.message);
    errorCount++;
    errors.push(`${entityId}: ${error.message}`);
  }
});

// Create a backup of the old relationships file
const backupPath = path.join(dataDir, 'relationships.backup.json');
fs.copyFileSync(relationshipsPath, backupPath);
console.log(`\n📁 Backup created: relationships.backup.json`);

// Create a validation report
const report = {
  timestamp: new Date().toISOString(),
  totalRelationships: relationshipsData.relationships.length,
  entitiesUpdated: updatedCount,
  errors: errorCount,
  errorDetails: errors,
  migrationComplete: errorCount === 0
};

fs.writeFileSync(
  path.join(dataDir, 'migration-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📊 Migration Summary:');
console.log(`  Total relationships: ${relationshipsData.relationships.length}`);
console.log(`  Entities updated: ${updatedCount}`);
console.log(`  Errors: ${errorCount}`);

if (errorCount > 0) {
  console.log('\n⚠️  Some entities could not be found:');
  errors.forEach(err => console.log(`  - ${err}`));
  console.log('\nThese may be references to entities that don\'t exist yet.');
}

console.log('\n✅ Migration complete! Check migration-report.json for details.');