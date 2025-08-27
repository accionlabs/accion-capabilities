# Data Folder Structure

This folder contains all the configuration data for the Accion Capabilities application, organized in a hierarchical structure for easy management.

## 📁 Folder Structure

```
data/
├── index.json                 # Index file with metadata and entity listings
├── pillars/                   # Strategic pillars
│   ├── pillar_digital_products.json
│   ├── pillar_data.json
│   ├── pillar_cloud.json
│   └── pillar_automation.json
├── coes/                      # Centers of Excellence
│   ├── coe_data_analytics.json
│   ├── coe_devops.json
│   └── coe_genai.json
├── platforms/                 # Enterprise platforms
│   ├── platform_unifiedai.json
│   └── platform_digitalhub.json
├── accelerators/              # Pre-built accelerators
│   ├── acc_data_orchestrator.json
│   ├── acc_cicd_accelerator.json
│   └── acc_genai_studio.json
├── components/                # Reusable components
│   └── comp_auth_service.json
├── frameworks/                # Delivery frameworks
│   ├── framework_devops_maturity.json
│   └── framework_agile_delivery.json
├── prototypes/                # Innovation prototypes
│   ├── proto_quantum_ml.json
│   └── proto_ar_field_service.json
├── technologies/              # Technology stack
│   ├── tech_python.json
│   ├── tech_kubernetes.json
│   └── ... (more tech files)
├── industries/                # Target industries
│   ├── industry_financial_services.json
│   ├── industry_retail.json
│   └── ... (more industry files)
└── case-studies/              # Client success stories
    ├── case_bank_transformation.json
    └── case_retailer_devops.json
```

## 🔍 Finding Files

Each file is named with its entity ID for easy identification:
- **Pattern**: `{entity_type}_{name}.json`
- **Example**: `coe_data_analytics.json` for the Data Analytics CoE

## ➕ Adding New Entities

### 1. Create a new JSON file
Create a file in the appropriate folder with a unique ID:
```bash
# Example: Adding a new CoE
touch data/coes/coe_cloud_native.json
```

### 2. Add the entity data
Follow the schema for that entity type:

```json
{
  "id": "coe_cloud_native",
  "name": "Cloud Native CoE",
  "description": "...",
  "pillarId": "pillar_cloud",
  "keyCompetencies": [...],
  "ipAssets": [...],
  "technologies": [...],
  "services": [...],
  "targetIndustries": [...],
  "content": {
    "type": "file",
    "source": "content/coe/cloud-native.md"
  }
}
```

### 3. Update the index
Add an entry to `index.json`:
```json
{
  "entities": {
    "centersOfExcellence": [
      ...existing,
      { "id": "coe_cloud_native", "name": "Cloud Native CoE" }
    ]
  }
}
```

## 📝 Entity Schemas

### Pillar
```json
{
  "id": "pillar_xxx",
  "name": "Pillar Name",
  "description": "Description",
  "coeCount": 10,
  "keyFocusAreas": ["Area 1", "Area 2"]
}
```

### Center of Excellence (CoE)
```json
{
  "id": "coe_xxx",
  "name": "CoE Name",
  "description": "Description",
  "pillarId": "pillar_xxx",
  "keyCompetencies": ["Competency 1", "Competency 2"],
  "ipAssets": ["platform_id", "accelerator_id"],
  "platforms": ["platform_id"],
  "technologies": ["tech_id1", "tech_id2"],
  "services": [
    {
      "name": "Service Name",
      "description": "Service description",
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ],
  "targetIndustries": ["industry_id1", "industry_id2"],
  "content": {
    "type": "file",
    "source": "content/coe/xxx.md"
  }
}
```

### Platform
```json
{
  "id": "platform_xxx",
  "name": "Platform Name",
  "category": "platform",
  "description": "Description",
  "strategicValue": "Strategic value statement",
  "clientValue": ["Value 1", "Value 2"],
  "usedByCoEs": ["coe_id1", "coe_id2"],
  "technologies": ["tech_id1", "tech_id2"],
  "industries": ["industry_id1"],
  "maturityLevel": "strategic",
  "deploymentModels": ["SaaS", "On-premise"],
  "keyFeatures": [
    {
      "name": "Feature Name",
      "description": "Description",
      "businessValue": "Business value"
    }
  ],
  "businessImpactMetrics": [
    {
      "name": "Metric Name",
      "value": "95",
      "unit": "%",
      "improvement": "15% improvement"
    }
  ],
  "content": {
    "type": "file",
    "source": "content/platform/xxx.md"
  }
}
```

### Accelerator
```json
{
  "id": "acc_xxx",
  "name": "Accelerator Name",
  "category": "accelerator",
  "description": "Description",
  "solutionType": "Solution Type",
  "strategicValue": "Strategic value",
  "clientValue": ["Value 1", "Value 2"],
  "usedByCoEs": ["coe_id"],
  "technologies": ["tech_id"],
  "industries": ["industry_id"],
  "keyFeatures": [...],
  "clientValueMetrics": [...],
  "successStories": [...],
  "deploymentTime": "2-4 weeks",
  "costSavings": "$500K annually"
}
```

### Technology
```json
{
  "id": "tech_xxx",
  "name": "Technology Name",
  "description": "Description",
  "category": "language|framework|platform|tool|cloud|database",
  "vendor": "Vendor Name",
  "isOpenSource": true,
  "isPartnership": false
}
```

### Industry
```json
{
  "id": "industry_xxx",
  "name": "Industry Name",
  "description": "Description",
  "segment": "Industry Segment"
}
```

### Case Study
```json
{
  "id": "case_xxx",
  "name": "Case Study Name",
  "description": "Description",
  "clientName": "Client Name",
  "industryId": "industry_xxx",
  "challenge": "Challenge description",
  "solution": "Solution description",
  "ipAssetsUsed": ["platform_id", "accelerator_id"],
  "coesInvolved": ["coe_id"],
  "outcomes": [
    {
      "description": "Outcome description",
      "impact": "Impact statement",
      "measuredValue": "75% reduction"
    }
  ],
  "metrics": [
    {
      "name": "Metric Name",
      "value": "75",
      "unit": "%",
      "improvement": "reduction"
    }
  ]
}
```

## 🔄 Data Loading

The application automatically loads all data files on startup using the DataLoaderV2 service:

1. Reads `index.json` to get the list of entities
2. Loads all entity files in parallel
3. Creates relationships between entities
4. Builds the in-memory graph database

## 🚀 Benefits of This Structure

1. **Easy to Find**: Each entity has its own file with a descriptive name
2. **Easy to Edit**: Edit individual files without affecting others
3. **Version Control Friendly**: Changes to individual entities are clearly visible in git
4. **Scalable**: Add new entities without modifying existing files
5. **Organized**: Clear hierarchy makes navigation simple
6. **Modular**: Load only what you need

## 💡 Tips

- Keep IDs consistent across references
- Use descriptive IDs that indicate the entity type
- Update the index.json when adding/removing entities
- Place markdown content in `/public/content/` folder
- Test changes by refreshing the browser