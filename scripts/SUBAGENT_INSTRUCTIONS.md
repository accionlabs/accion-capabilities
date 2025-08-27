# Using Claude Code Sub-Agents for PDF Processing

Claude Code can directly read and process PDF files, including both text and visual content. No conversion scripts are needed.

## How Sub-Agents Work in Claude Code

Sub-agents are invoked using the `Task` tool and can:
- **Directly read PDFs** with text and visual content
- **Process multiple files** in a single task
- **Write output files** automatically
- **Access all Claude Code tools** (Read, Write, Bash, etc.)

## Agent Configuration Files

Agent configurations are stored in `.claude/agents/`:
- `coe-pdf-extractor.md` - For processing individual CoE PDFs
- `batch-pdf-processor.md` - For processing multiple PDFs at once

## Example: Process a Single PDF

```javascript
Use the Task tool with:
- description: "Extract DevOps CoE data"
- subagent_type: "general-purpose"
- prompt: "Read the PDF at info/Centers of Excellence/Cloud/DevOps CoE.pdf. Extract all information including text and visual content (diagrams, charts). Create a JSON configuration following the CoE schema and save to data/coes/coe_devops.json"
```

## Example: Process Multiple PDFs

```javascript
Use the Task tool with:
- description: "Process all Data CoE PDFs"
- subagent_type: "general-purpose"  
- prompt: "Process all PDF files in info/Centers of Excellence/Data/. For each PDF: read the content including visuals, extract CoE information, create JSON configuration files in data/coes/ with appropriate naming (coe_data_analytics.json, coe_snowflake.json, etc.)"
```

## Processing All CoE PDFs

### Option 1: Process by Category

**Cloud CoEs:**
```javascript
Task tool:
description: "Process Cloud CoE PDFs"
subagent_type: "general-purpose"
prompt: "Process all PDFs in info/Centers of Excellence/Cloud/. For Security CoE, combine Part 1 and Part 2. Create JSON files: coe_devops.json and coe_security.json in data/coes/"
```

**Data CoEs:**
```javascript
Task tool:
description: "Process Data CoE PDFs"
subagent_type: "general-purpose"
prompt: "Process all 11 PDFs in info/Centers of Excellence/Data/. Create JSON files for each CoE (data_analytics, data_governance, data_mesh, data_roi, data_streaming, data_transformation, databricks, financial_analytics, mdm, medical_imaging, snowflake) in data/coes/"
```

**Product Engineering CoEs:**
```javascript
Task tool:
description: "Process Product Engineering CoE PDFs"
subagent_type: "general-purpose"
prompt: "Process all PDFs in info/Centers of Excellence/Prod Engg/. For UX CoE, combine Part 1 and Part 2. Create JSON files for architecture, blockchain, ecommerce, iot, portfolio_rationalization, reengineering, testing, and ux in data/coes/"
```

**Enterprise Automation CoEs:**
```javascript
Task tool:
description: "Process Enterprise Automation CoE PDFs"
subagent_type: "general-purpose"
prompt: "Process Service Now CoE.pdf from info/Centers of Excellence/Enterprise Automation/. Create coe_servicenow.json in data/coes/"
```

### Option 2: Process All at Once

```javascript
Task tool:
description: "Process all CoE PDFs"
subagent_type: "general-purpose"
prompt: "Process all PDF files recursively in info/Centers of Excellence/. Handle multi-part PDFs by combining their content. Create JSON configuration files for each CoE in data/coes/ with proper naming conventions (coe_[name].json). Include all text and visual content from the PDFs."
```

## What the Sub-Agent Extracts

From each PDF, the sub-agent will extract:

1. **Text Content:**
   - CoE name and description
   - Key competencies and capabilities
   - Services and deliverables
   - Business value propositions
   - Case studies and metrics

2. **Visual Content:**
   - Technology stacks from architecture diagrams
   - Tools and platforms from logos/icons
   - Process flows and methodologies
   - Metrics and KPIs from charts
   - Organizational structures

## JSON Output Structure

Each generated file follows this structure:

```json
{
  "id": "coe_[name]",
  "type": "coe",
  "data": {
    "name": "Full CoE Name",
    "description": "Comprehensive description",
    "category": "Cloud/Data/Product Engineering/Enterprise Automation",
    "order": 1,
    "keyCompetencies": ["List of competencies"],
    "services": [
      {
        "name": "Service Name",
        "description": "Service Description",
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }
    ],
    "technologies": ["Technology 1", "Technology 2"],
    "businessValue": "Value proposition",
    "content": {
      "type": "file",
      "source": "content/coes/[id].md"
    }
  },
  "relationships": [
    {
      "type": "BELONGS_TO",
      "to": "pillar_[category]"
    }
  ],
  "metadata": {
    "tags": ["relevant", "tags"],
    "lastUpdated": "2024-01-26",
    "version": "1.0"
  }
}
```

## Validation

After processing, validate all generated files:

```javascript
Task tool:
description: "Validate CoE JSON files"
subagent_type: "general-purpose"
prompt: "Validate all JSON files in data/coes/. Check for: valid JSON syntax, required fields, proper ID naming convention (coe_*), valid relationships to pillars. Report any issues found."
```

## Benefits of Direct PDF Processing

- **No conversion needed** - Claude reads PDFs natively
- **Visual analysis included** - Diagrams and charts are processed
- **Faster processing** - No intermediate steps
- **Better accuracy** - Direct access to formatted content
- **Simpler workflow** - Just point to the PDF and get JSON output