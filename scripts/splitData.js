const fs = require('fs');
const path = require('path');

// Read the main capabilities file
const capabilities = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/capabilities.json'), 'utf8')
);

// Create data directory structure
const dataDir = path.join(__dirname, '../public/data');

// Helper function to write JSON files
function writeJsonFile(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Created: ${filepath}`);
}

// Split and save pillars
capabilities.pillars.forEach(pillar => {
  const filename = path.join(dataDir, 'pillars', `${pillar.id}.json`);
  writeJsonFile(filename, pillar);
});

// Split and save CoEs
capabilities.centersOfExcellence.forEach(coe => {
  const filename = path.join(dataDir, 'coes', `${coe.id}.json`);
  writeJsonFile(filename, coe);
});

// Split and save platforms
capabilities.platforms.forEach(platform => {
  const filename = path.join(dataDir, 'platforms', `${platform.id}.json`);
  writeJsonFile(filename, platform);
});

// Split and save accelerators
capabilities.accelerators.forEach(accelerator => {
  const filename = path.join(dataDir, 'accelerators', `${accelerator.id}.json`);
  writeJsonFile(filename, accelerator);
});

// Split and save components
capabilities.components.forEach(component => {
  const filename = path.join(dataDir, 'components', `${component.id}.json`);
  writeJsonFile(filename, component);
});

// Split and save frameworks
capabilities.frameworks.forEach(framework => {
  const filename = path.join(dataDir, 'frameworks', `${framework.id}.json`);
  writeJsonFile(filename, framework);
});

// Split and save prototypes
capabilities.prototypes.forEach(prototype => {
  const filename = path.join(dataDir, 'prototypes', `${prototype.id}.json`);
  writeJsonFile(filename, prototype);
});

// Split and save technologies
capabilities.technologies.forEach(technology => {
  const filename = path.join(dataDir, 'technologies', `${technology.id}.json`);
  writeJsonFile(filename, technology);
});

// Split and save industries
capabilities.industries.forEach(industry => {
  const filename = path.join(dataDir, 'industries', `${industry.id}.json`);
  writeJsonFile(filename, industry);
});

// Split and save case studies
capabilities.caseStudies.forEach(caseStudy => {
  const filename = path.join(dataDir, 'case-studies', `${caseStudy.id}.json`);
  writeJsonFile(filename, caseStudy);
});

// Create an index file with metadata
const index = {
  version: "1.0.0",
  generated: new Date().toISOString(),
  entities: {
    pillars: capabilities.pillars.map(p => ({ id: p.id, name: p.name })),
    centersOfExcellence: capabilities.centersOfExcellence.map(c => ({ id: c.id, name: c.name })),
    platforms: capabilities.platforms.map(p => ({ id: p.id, name: p.name })),
    accelerators: capabilities.accelerators.map(a => ({ id: a.id, name: a.name })),
    components: capabilities.components.map(c => ({ id: c.id, name: c.name })),
    frameworks: capabilities.frameworks.map(f => ({ id: f.id, name: f.name })),
    prototypes: capabilities.prototypes.map(p => ({ id: p.id, name: p.name })),
    technologies: capabilities.technologies.map(t => ({ id: t.id, name: t.name })),
    industries: capabilities.industries.map(i => ({ id: i.id, name: i.name })),
    caseStudies: capabilities.caseStudies.map(cs => ({ id: cs.id, name: cs.name }))
  }
};

writeJsonFile(path.join(dataDir, 'index.json'), index);

console.log('\n✅ Data split complete!');
console.log(`Created ${Object.values(index.entities).flat().length} individual entity files`);