const fs = require('fs');
const path = require('path');

// Properties to remove from entities (these are now in relationships.json)
const relationshipProperties = [
  'pillarId',
  'ipAssets',
  'platforms',
  'technologies',
  'targetIndustries',
  'industries',
  'usedByCoEs',
  'coesInvolved',
  'ipAssetsUsed',
  'industryId'
];

function cleanEntity(entity) {
  const cleaned = { ...entity };
  
  // Remove relationship properties
  relationshipProperties.forEach(prop => {
    delete cleaned[prop];
  });
  
  // Ensure base properties exist
  cleaned.type = cleaned.type || cleaned.category || inferType(cleaned.id);
  
  // Add tags if not present
  if (!cleaned.tags) {
    cleaned.tags = [];
    
    // Extract tags from various properties
    if (cleaned.keyCompetencies) {
      cleaned.tags.push(...cleaned.keyCompetencies);
    }
    if (cleaned.keyFocusAreas) {
      cleaned.tags.push(...cleaned.keyFocusAreas);
    }
    if (cleaned.category) {
      cleaned.tags.push(cleaned.category);
    }
  }
  
  return cleaned;
}

function inferType(id) {
  if (id.startsWith('pillar_')) return 'pillar';
  if (id.startsWith('coe_')) return 'coe';
  if (id.startsWith('platform_')) return 'platform';
  if (id.startsWith('acc_')) return 'accelerator';
  if (id.startsWith('comp_')) return 'component';
  if (id.startsWith('framework_')) return 'framework';
  if (id.startsWith('proto_')) return 'prototype';
  if (id.startsWith('tech_')) return 'technology';
  if (id.startsWith('industry_')) return 'industry';
  if (id.startsWith('case_')) return 'casestudy';
  return 'unknown';
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    if (file.endsWith('.json') && file !== 'index.json' && file !== 'relationships.json') {
      const filePath = path.join(dirPath, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const entity = JSON.parse(content);
        
        const cleaned = cleanEntity(entity);
        
        fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
        console.log(`✓ Cleaned ${file}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    }
  });
}

// Process all entity directories
const dataDir = path.join(__dirname, '..', 'public', 'data');
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

console.log('Cleaning entity files...\n');

directories.forEach(dir => {
  const dirPath = path.join(dataDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Processing ${dir}/`);
    processDirectory(dirPath);
    console.log('');
  }
});

console.log('✅ Entity cleanup complete!');