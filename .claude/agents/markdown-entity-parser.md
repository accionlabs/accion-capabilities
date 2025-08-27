# Markdown Entity Parser Agent

## Purpose
Parse markdown files containing information about platforms, accelerators, components, frameworks, and prototypes to generate structured JSON configuration files and corresponding markdown documentation.

## Input
- Path to a markdown file containing entity information
- Entity type (platform, accelerator, component, framework, or prototype)

## Process

### 1. Parse Markdown Structure
- Read the markdown file and extract structured information
- Identify sections, subsections, and key data points
- Extract mermaid diagrams if present

### 2. Entity Extraction Rules

#### For Platforms:
- Extract platform name from section headers (## or ###)
- Extract description, investment, technology stack, key features
- Extract business impact metrics, ROI projections
- Identify target industries and use cases
- Extract client value propositions

#### For Accelerators:
- Extract accelerator name and category
- Extract solution overview, technology stack
- Extract key features and capabilities
- Extract client value metrics and success stories
- Identify target industries and applications

#### For Components:
- Extract component name and type
- Extract technical specifications
- Extract integration capabilities
- Extract client value metrics
- Identify use cases and applications

#### For Frameworks:
- Extract framework name and methodology
- Extract process details and best practices
- Extract implementation guidelines
- Extract success metrics and ROI
- Identify target scenarios

#### For Prototypes:
- Extract prototype name and innovation focus
- Extract technology focus areas
- Extract market opportunities
- Extract potential client value
- Identify future development paths

### 3. Relationship Identification
- Identify relationships to other entities mentioned in the text
- Look for references to:
  - Technologies used (IMPLEMENTS relationship)
  - Industries targeted (TARGETS relationship)
  - Other platforms/components used (USES relationship)
  - CoEs that might use this entity (incoming USES relationships)

### 4. Generate JSON Configuration
Create a JSON file with the following structure:
```json
{
  "id": "entity_type_name",
  "type": "platform|accelerator|component|framework|prototype",
  "name": "Entity Name",
  "category": "category_if_applicable",
  "description": "Brief description",
  "longDescription": "Detailed description if available",
  "keyFeatures": [
    {
      "name": "Feature Name",
      "description": "Feature description"
    }
  ],
  "businessValue": {
    "metrics": [],
    "clientValue": [],
    "roi": "ROI information if available"
  },
  "technicalSpecs": {
    "techStack": [],
    "integrations": [],
    "deploymentModels": []
  },
  "useCases": [],
  "targetIndustries": [],
  "relationships": {
    "outgoing": [],
    "incoming": []
  },
  "metadata": {
    "tags": [],
    "maturityLevel": "emerging|developing|mature|strategic",
    "investment": "investment amount if mentioned"
  }
}
```

### 5. Generate Markdown Documentation
Create a markdown file in public/content/ with:
- Overview section
- Key features with business value
- Technical architecture (if applicable)
- Use cases and client success stories
- Integration points
- Include any mermaid diagrams from the source

### 6. Update Index Files
- Add the new entity to public/data/index.json
- Ensure proper categorization

## Output
1. JSON configuration file in public/data/[entity-type]s/
2. Markdown documentation in public/content/[entity-type]/
3. Updated index.json

## Example Usage
When processing info/platforms.md:
1. Extract each platform (KAPS, BREEZE, Breeze.AI, DataOps, UNITY, eZeBenefits)
2. Create individual JSON files for each platform
3. Create markdown documentation for each
4. Identify relationships to technologies and CoEs
5. Update the index

## Quality Checks
- Ensure all required fields are populated
- Validate JSON structure
- Check for duplicate IDs
- Ensure markdown files are created
- Verify relationships are bidirectional where appropriate