# Entity Ordering Documentation

## Overview
The EntityListPage component now supports custom ordering of entities in the listing views. This allows you to control the display order of entities regardless of their alphabetical names.

## How It Works

### 1. Add Order Field to Entity Data
Add an `order` field to any entity's JSON file:

```json
{
  "id": "pillar_digital_products",
  "name": "Digital Products",
  "order": 1,  // <-- Add this field
  "description": "...",
  ...
}
```

### 2. Sorting Logic
Entities are sorted using the following logic:
1. **First**: By `order` field (lower numbers appear first)
2. **Second**: Alphabetically by `name` (if no order or same order value)

Entities without an `order` field are treated as having `order: Number.MAX_VALUE` and will appear after ordered entities.

### 3. Group Sorting
When using `groupBy="parent"` (e.g., CoEs grouped by Pillar):
- Groups are sorted by their parent entity's order
- Entities within each group maintain their individual ordering

## Examples

### Pillars
```json
// pillar_digital_products.json
{
  "order": 1,  // Shows first
  "name": "Digital Products"
}

// pillar_data.json
{
  "order": 2,  // Shows second
  "name": "Data"
}

// pillar_automation.json
{
  "order": 3,  // Shows third
  "name": "Automation"
}
```

### Centers of Excellence
```json
// coe_genai.json
{
  "order": 1,  // Shows first in CoE list
  "name": "Generative AI CoE"
}

// coe_data_analytics.json
{
  "order": 2,  // Shows second
  "name": "Data & Analytics CoE"
}

// coe_devops.json
{
  "order": 3,  // Shows third
  "name": "DevOps CoE"
}
```

## Usage Tips

1. **Strategic Ordering**: Use orders like 10, 20, 30 to leave room for insertions
2. **Category Priority**: Order most important/popular items first
3. **Consistency**: Apply ordering within entity types for better UX
4. **Optional**: Only add order fields where custom ordering is needed

## Implementation Details

The sorting is implemented in `src/components/EntityListPage.tsx`:
- Line 63-74: Core sorting logic
- Line 114-142: Group sorting for parent-based grouping

## Entity Types That Support Ordering
All entity types support the order field:
- Pillars
- Centers of Excellence (CoEs)
- Platforms
- Accelerators
- Components
- Frameworks
- Prototypes
- Technologies
- Industries
- Case Studies