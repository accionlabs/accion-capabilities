
# PDF Processing with Vision-Enabled Claude Code Sub-Agents

## Overview
This directory contains extracted text, images, and prompts from PDF documents that need to be processed into structured JSON data files.

## 🎯 Key Features
- **Text Extraction**: Full text content from PDFs
- **Visual Analysis**: Converted PDF pages to images for visual analysis
- **Combined Processing**: Prompts that instruct sub-agents to analyze both text and visuals

## Processing Steps

### Step 1: Process Individual PDFs
For each PDF, use the Task tool with a vision-enabled sub-agent:

```javascript
// Example for processing a single CoE PDF
Use the Task tool with:
- subagent_type: "general-purpose"
- description: "Extract CoE data from PDF with vision"
- prompt: Read from prompts/[filename]_vision_prompt.txt and analyze the images in images/[filename]/
```

### Step 2: Batch Processing
To process multiple PDFs, you can create a sequence of sub-agent tasks:

```javascript
// Process all CoE PDFs
For each prompt file in prompts/:
1. Read the vision prompt
2. Load the corresponding images from images/[pdf-name]/
3. Use sub-agent to analyze both text and visuals
4. Generate JSON configuration
5. Save to data/coes/[coe_id].json
```

## Files to Process

### Cloud CoEs
- [ ] DevOps CoE (0 pages with visuals)
- [ ] Security CoE - Part 1 (0 pages with visuals)
- [ ] Security CoE - Part 2 (0 pages with visuals)

### Data CoEs
- No Data CoE PDFs found

### Product Engineering CoEs
- No Product Engineering CoE PDFs found

### Enterprise Automation CoEs
- No Enterprise Automation CoE PDFs found

## Directory Structure

```
/Users/ashutoshbijoor/Code/accion-capabilities/data/pdf-vision-test/
├── prompts/          # Vision-enabled prompts for sub-agent processing
├── images/           # Converted PDF pages as PNG images
│   ├── [pdf-name]/   # Directory for each PDF's images
│   │   ├── 1.png     # Page 1
│   │   ├── 2.png     # Page 2
│   │   └── ...       # Additional pages
├── metadata/         # Processing metadata for each PDF
└── instructions.md   # This file
```

## Sub-Agent Capabilities

When processing with vision-enabled sub-agents, they can:
- 📊 Extract data from charts and graphs
- 🏗️ Analyze architecture diagrams
- 🔧 Identify technologies from logos and icons
- 📈 Extract metrics and KPIs from visual dashboards
- 🔄 Understand process flows and workflows
- 🎯 Identify relationships from visual connections

## Notes

- Each prompt contains instructions for analyzing both text and visual content
- The sub-agent should combine insights from both sources
- Visual elements often contain information not present in the text
- Ensure all visually identified technologies are included in the JSON
- Validate the generated JSON before saving

## Example Sub-Agent Output

The sub-agent should generate JSON like:

```json
{
  "id": "coe_data_analytics",
  "type": "coe",
  "data": {
    "name": "Data Analytics CoE",
    "description": "...",
    "keyCompetencies": [
      "Real-time Analytics",
      "Predictive Modeling"
    ],
    "technologies": [
      "Apache Spark",  // Identified from architecture diagram
      "Tableau",       // Seen in dashboard screenshot
      "Python"         // Mentioned in text
    ],
    // ... additional fields
  }
}
```

## Processing Status

Total PDFs: 3
Successfully processed: 3
With visual content: 0
Failed: 0

Generated: 2025-08-26T04:26:29.743Z
