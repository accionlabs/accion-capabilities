#!/usr/bin/env node

/**
 * Enhanced PDF Processing with Vision Capabilities
 * 
 * This script converts PDFs to images and prepares them for processing
 * by Claude Code sub-agents with vision capabilities.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { fromPath } = require('pdf2pic');
const { extractTextFromPDF } = require('./extract-pdf-text');

/**
 * Convert PDF pages to images
 */
async function convertPDFToImages(pdfPath, outputDir) {
  const pdfName = path.basename(pdfPath, '.pdf');
  const imageDir = path.join(outputDir, 'images', pdfName);
  
  // Create output directory
  await fs.mkdir(imageDir, { recursive: true });
  
  // Configure pdf2pic options
  const options = {
    density: 150,
    saveFilename: pdfName,
    savePath: imageDir,
    format: 'png',
    width: 1200,
    height: 1600
  };
  
  const converter = fromPath(pdfPath, options);
  
  try {
    // Convert all pages
    const results = await converter.bulk(-1, true);
    
    const imagePaths = results.map(result => ({
      page: result.page,
      path: result.path,
      name: result.name
    }));
    
    console.log(`   ✓ Converted ${imagePaths.length} pages to images`);
    return imagePaths;
  } catch (error) {
    console.error(`   ✗ Error converting PDF to images: ${error.message}`);
    // Fallback: try to at least get the first page
    try {
      const result = await converter(1, true);
      return [{
        page: 1,
        path: result.path,
        name: result.name
      }];
    } catch (fallbackError) {
      throw new Error(`Failed to convert PDF to images: ${fallbackError.message}`);
    }
  }
}

/**
 * Create an enhanced prompt that references both text and images
 */
function createVisionPrompt(pdfText, imagePaths, fileName, category, exampleStructure) {
  const prompt = `
You are tasked with analyzing a PDF document about a Center of Excellence (CoE) using both the extracted text and visual content.

CONTEXT:
- PDF File: ${fileName}
- Category: ${category}
- Number of pages with visuals: ${imagePaths.length}
- Document contains information about a specific CoE including diagrams, charts, and visual representations

IMPORTANT: You have access to both:
1. The extracted text content (provided below)
2. Visual images of each PDF page (will be provided separately)

TASK:
1. Analyze BOTH the text content AND the visual elements in the PDF pages
2. Extract information from diagrams, charts, architecture diagrams, and any visual content
3. Identify all technologies, frameworks, and tools shown in visuals
4. Note any relationships or connections shown in diagrams
5. Extract metrics, KPIs, or data points from charts and graphs
6. Create a complete JSON configuration file combining insights from both text and visuals

${exampleStructure ? `
EXAMPLE STRUCTURE TO FOLLOW:
${JSON.stringify(exampleStructure, null, 2)}
` : ''}

VISUAL ANALYSIS INSTRUCTIONS:
- Look for architecture diagrams showing technology stacks
- Identify logos and technology icons in the visuals
- Extract process flows and workflow diagrams
- Note any metrics or statistics shown in charts
- Identify team structures or organizational charts
- Look for roadmaps or timeline visuals
- Extract any visual representations of services or capabilities

EXTRACTED PDF TEXT:
================================================================================
${pdfText}
================================================================================

IMAGE FILES AVAILABLE FOR ANALYSIS:
${imagePaths.map((img, idx) => `- Page ${img.page}: ${img.name}`).join('\n')}

OUTPUT REQUIREMENTS:
1. Create a valid JSON object with all required fields
2. Combine information from both text AND visual elements
3. When technologies are shown visually but not mentioned in text, include them
4. Extract actual content from both text and visuals
5. Include relationships visible in architecture diagrams
6. Note any metrics or KPIs shown in charts
7. Generate tags based on all technologies visible in text and images

Please analyze both the text and visual content to create a comprehensive JSON configuration for this CoE.
`;

  return prompt;
}

/**
 * Process a PDF with both text and vision
 */
async function processPDFWithVision(pdfPath, outputDir) {
  const fileName = path.basename(pdfPath);
  const category = path.basename(path.dirname(pdfPath));
  
  console.log(`\n📄 Processing with Vision: ${fileName}`);
  console.log(`   Category: ${category}`);
  
  try {
    // Extract text from PDF
    const { text, pages } = await extractTextFromPDF(pdfPath);
    console.log(`   ✓ Extracted ${text.length} characters from ${pages} pages`);
    
    // Convert PDF to images
    let imagePaths = [];
    try {
      imagePaths = await convertPDFToImages(pdfPath, outputDir);
    } catch (error) {
      console.log(`   ⚠ Could not convert to images: ${error.message}`);
      console.log(`   → Proceeding with text-only extraction`);
    }
    
    // Get example structure
    const exampleStructure = await getExampleStructure();
    
    // Create enhanced prompt with vision instructions
    const prompt = createVisionPrompt(text, imagePaths, fileName, category, exampleStructure);
    
    // Save the prompt
    const promptFileName = fileName.replace('.pdf', '_vision_prompt.txt');
    const promptPath = path.join(outputDir, 'prompts', promptFileName);
    await fs.mkdir(path.dirname(promptPath), { recursive: true });
    await fs.writeFile(promptPath, prompt);
    
    console.log(`   ✓ Created vision-enabled prompt: ${promptFileName}`);
    
    // Save metadata about the processing
    const metadataFileName = fileName.replace('.pdf', '_metadata.json');
    const metadataPath = path.join(outputDir, 'metadata', metadataFileName);
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    
    const metadata = {
      pdfPath,
      fileName,
      category,
      pages,
      textLength: text.length,
      hasImages: imagePaths.length > 0,
      imagePaths: imagePaths.map(img => path.relative(outputDir, img.path)),
      promptPath: path.relative(outputDir, promptPath),
      processedAt: new Date().toISOString()
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    return {
      success: true,
      pdfPath,
      promptPath,
      imagePaths,
      metadata
    };
    
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    return {
      success: false,
      pdfPath,
      error: error.message
    };
  }
}

/**
 * Get example structure
 */
async function getExampleStructure() {
  try {
    const examplePath = path.join(__dirname, '../data/coes/coe_devops.json');
    const content = await fs.readFile(examplePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Process all PDFs in a directory with vision
 */
async function processDirectoryWithVision(inputDir, outputDir) {
  const results = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.name.endsWith('.pdf')) {
        const result = await processPDFWithVision(fullPath, outputDir);
        results.push(result);
      }
    }
  }
  
  await walkDir(inputDir);
  return results;
}

/**
 * Generate instructions for processing with sub-agents
 */
async function generateVisionInstructions(outputDir, results) {
  const instructions = `
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

\`\`\`javascript
// Example for processing a single CoE PDF
Use the Task tool with:
- subagent_type: "general-purpose"
- description: "Extract CoE data from PDF with vision"
- prompt: Read from prompts/[filename]_vision_prompt.txt and analyze the images in images/[filename]/
\`\`\`

### Step 2: Batch Processing
To process multiple PDFs, you can create a sequence of sub-agent tasks:

\`\`\`javascript
// Process all CoE PDFs
For each prompt file in prompts/:
1. Read the vision prompt
2. Load the corresponding images from images/[pdf-name]/
3. Use sub-agent to analyze both text and visuals
4. Generate JSON configuration
5. Save to data/coes/[coe_id].json
\`\`\`

## Files to Process

### Cloud CoEs
${results.filter(r => r.success && r.metadata?.category === 'Cloud').map(r => {
  const name = path.basename(r.pdfPath, '.pdf');
  return `- [ ] ${name} (${r.imagePaths?.length || 0} pages with visuals)`;
}).join('\n') || '- No Cloud CoE PDFs found'}

### Data CoEs
${results.filter(r => r.success && r.metadata?.category === 'Data').map(r => {
  const name = path.basename(r.pdfPath, '.pdf');
  return `- [ ] ${name} (${r.imagePaths?.length || 0} pages with visuals)`;
}).join('\n') || '- No Data CoE PDFs found'}

### Product Engineering CoEs
${results.filter(r => r.success && r.metadata?.category === 'Prod Engg').map(r => {
  const name = path.basename(r.pdfPath, '.pdf');
  return `- [ ] ${name} (${r.imagePaths?.length || 0} pages with visuals)`;
}).join('\n') || '- No Product Engineering CoE PDFs found'}

### Enterprise Automation CoEs
${results.filter(r => r.success && r.metadata?.category === 'Enterprise Automation').map(r => {
  const name = path.basename(r.pdfPath, '.pdf');
  return `- [ ] ${name} (${r.imagePaths?.length || 0} pages with visuals)`;
}).join('\n') || '- No Enterprise Automation CoE PDFs found'}

## Directory Structure

\`\`\`
${outputDir}/
├── prompts/          # Vision-enabled prompts for sub-agent processing
├── images/           # Converted PDF pages as PNG images
│   ├── [pdf-name]/   # Directory for each PDF's images
│   │   ├── 1.png     # Page 1
│   │   ├── 2.png     # Page 2
│   │   └── ...       # Additional pages
├── metadata/         # Processing metadata for each PDF
└── instructions.md   # This file
\`\`\`

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

\`\`\`json
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
\`\`\`

## Processing Status

Total PDFs: ${results.length}
Successfully processed: ${results.filter(r => r.success).length}
With visual content: ${results.filter(r => r.success && r.imagePaths?.length > 0).length}
Failed: ${results.filter(r => !r.success).length}

Generated: ${new Date().toISOString()}
`;

  const instructionsPath = path.join(outputDir, 'instructions.md');
  await fs.writeFile(instructionsPath, instructions);
  console.log(`\n📋 Vision instructions saved to: ${instructionsPath}`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node process-pdfs-with-vision.js <input-dir> <output-dir>');
    console.log('Example: node process-pdfs-with-vision.js ../info/Centers\\ of\\ Excellence ../data/pdf-vision-processing');
    process.exit(1);
  }
  
  const inputDir = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);
  
  (async () => {
    try {
      console.log('🚀 PDF Processing with Vision Capabilities');
      console.log('==========================================');
      console.log(`Input directory: ${inputDir}`);
      console.log(`Output directory: ${outputDir}`);
      
      // Create output directory
      await fs.mkdir(outputDir, { recursive: true });
      
      // Process all PDFs with vision
      const results = await processDirectoryWithVision(inputDir, outputDir);
      
      // Generate summary
      const successful = results.filter(r => r.success).length;
      const withImages = results.filter(r => r.success && r.imagePaths?.length > 0).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n📊 Processing Summary');
      console.log('====================');
      console.log(`Total PDFs processed: ${results.length}`);
      console.log(`✓ Successful: ${successful}`);
      console.log(`📸 With visual content: ${withImages}`);
      console.log(`✗ Failed: ${failed}`);
      
      if (failed > 0) {
        console.log('\nFailed files:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`  - ${path.basename(r.pdfPath)}: ${r.error}`);
        });
      }
      
      // Save processing log
      const logPath = path.join(outputDir, 'processing-log.json');
      await fs.writeFile(logPath, JSON.stringify(results, null, 2));
      console.log(`\n📁 Processing log: ${logPath}`);
      
      // Generate vision instructions
      await generateVisionInstructions(outputDir, results);
      
      console.log('\n✅ Processing complete with vision capabilities!');
      console.log('\nNext steps:');
      console.log('1. Review the generated prompts and images in the output directory');
      console.log('2. Use Claude Code sub-agents with vision to process each PDF');
      console.log('3. Sub-agents will analyze both text and visual content');
      console.log('4. Save the generated JSON files to the data directory');
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { processPDFWithVision, processDirectoryWithVision };