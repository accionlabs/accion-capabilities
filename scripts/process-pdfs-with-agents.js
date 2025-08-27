#!/usr/bin/env node

/**
 * PDF Processing Orchestrator using Claude Code Sub-Agents
 * 
 * This script extracts text from PDFs and creates prompts for Claude Code
 * to process using sub-agents via the Task tool.
 */

const fs = require('fs').promises;
const path = require('path');
const { extractTextFromPDF } = require('./extract-pdf-text');

/**
 * Read the existing CoE data structure as a reference
 */
async function getExampleStructure() {
  try {
    const examplePath = path.join(__dirname, '../data/coes/coe_devops.json');
    const content = await fs.readFile(examplePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.log('Could not load example structure, using default template');
    return null;
  }
}

/**
 * Create a structured prompt for the sub-agent to process
 */
function createSubAgentPrompt(pdfText, fileName, category, exampleStructure) {
  const prompt = `
You are tasked with analyzing a PDF document about a Center of Excellence (CoE) and extracting structured data.

CONTEXT:
- PDF File: ${fileName}
- Category: ${category}
- Document contains information about a specific CoE including its capabilities, services, technologies, and business value.

TASK:
1. Carefully read and understand the extracted text from the PDF
2. Identify all relevant information about the CoE
3. Create a complete JSON configuration file following the exact structure shown in the example
4. Ensure all relationships are properly defined based on mentioned technologies, platforms, or frameworks
5. Generate appropriate metadata including tags

${exampleStructure ? `
EXAMPLE STRUCTURE TO FOLLOW:
${JSON.stringify(exampleStructure, null, 2)}
` : ''}

EXTRACTED PDF TEXT:
================================================================================
${pdfText}
================================================================================

OUTPUT REQUIREMENTS:
1. Create a valid JSON object with all required fields
2. Use lowercase with underscores for IDs (e.g., coe_data_analytics)
3. Extract actual content from the PDF, don't use placeholder text
4. Include relationships to technologies, platforms, and pillars where mentioned
5. Set appropriate category based on the content and file location
6. Generate relevant tags based on the technologies and concepts mentioned

Please analyze the text and create the complete JSON configuration for this CoE.
`;

  return prompt;
}

/**
 * Process a single PDF file
 */
async function processPDF(pdfPath, outputDir) {
  const fileName = path.basename(pdfPath);
  const category = path.basename(path.dirname(pdfPath));
  
  console.log(`\n📄 Processing: ${fileName}`);
  console.log(`   Category: ${category}`);
  
  try {
    // Extract text from PDF
    const { text, pages } = await extractTextFromPDF(pdfPath);
    console.log(`   ✓ Extracted ${text.length} characters from ${pages} pages`);
    
    // Get example structure
    const exampleStructure = await getExampleStructure();
    
    // Create prompt for sub-agent
    const prompt = createSubAgentPrompt(text, fileName, category, exampleStructure);
    
    // Save the prompt for the sub-agent
    const promptFileName = fileName.replace('.pdf', '_prompt.txt');
    const promptPath = path.join(outputDir, 'prompts', promptFileName);
    await fs.mkdir(path.dirname(promptPath), { recursive: true });
    await fs.writeFile(promptPath, prompt);
    
    console.log(`   ✓ Created prompt for sub-agent: ${promptFileName}`);
    
    // Also save the extracted text for reference
    const textFileName = fileName.replace('.pdf', '_text.txt');
    const textPath = path.join(outputDir, 'extracted-text', textFileName);
    await fs.mkdir(path.dirname(textPath), { recursive: true });
    await fs.writeFile(textPath, text);
    
    return {
      success: true,
      pdfPath,
      promptPath,
      textPath,
      textLength: text.length,
      pages
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
 * Process all PDFs in a directory
 */
async function processDirectory(inputDir, outputDir) {
  const results = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.name.endsWith('.pdf')) {
        const result = await processPDF(fullPath, outputDir);
        results.push(result);
      }
    }
  }
  
  await walkDir(inputDir);
  return results;
}

/**
 * Generate instructions for using sub-agents
 */
async function generateInstructions(outputDir, results) {
  const instructions = `
# PDF Processing with Claude Code Sub-Agents

## Overview
This directory contains extracted text and prompts from PDF documents that need to be processed into structured JSON data files.

## Processing Steps

1. **Review the prompts** in the \`prompts/\` directory
2. **Use Claude Code's Task tool** to process each prompt with a sub-agent
3. **Save the generated JSON** to the appropriate data directory

## Example Sub-Agent Command

When processing these files with Claude Code, use the Task tool like this:

\`\`\`
Use the Task tool with subagent_type: "general-purpose" to:
1. Read the prompt file from prompts/[filename]_prompt.txt
2. Generate the JSON configuration based on the prompt
3. Save it to data/coes/[appropriate_id].json
\`\`\`

## Files to Process

${results.filter(r => r.success).map(r => {
  const promptFile = path.basename(r.promptPath);
  return `- [ ] ${promptFile}`;
}).join('\n')}

## Notes

- Each prompt contains the extracted text and instructions for creating the JSON
- The sub-agent should analyze the content and create properly structured entity data
- Ensure all relationships and metadata are correctly defined
- Validate the JSON before saving

## Directory Structure

\`\`\`
${outputDir}/
├── prompts/          # Prompts for sub-agent processing
├── extracted-text/   # Raw text extracted from PDFs
└── instructions.md   # This file
\`\`\`
`;

  const instructionsPath = path.join(outputDir, 'instructions.md');
  await fs.writeFile(instructionsPath, instructions);
  console.log(`\n📋 Instructions saved to: ${instructionsPath}`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node process-pdfs-with-agents.js <input-dir> <output-dir>');
    console.log('Example: node process-pdfs-with-agents.js ../info/Centers\\ of\\ Excellence ../data/pdf-processing');
    process.exit(1);
  }
  
  const inputDir = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);
  
  (async () => {
    try {
      console.log('🚀 PDF Processing Orchestrator');
      console.log('================================');
      console.log(`Input directory: ${inputDir}`);
      console.log(`Output directory: ${outputDir}`);
      
      // Create output directory
      await fs.mkdir(outputDir, { recursive: true });
      
      // Process all PDFs
      const results = await processDirectory(inputDir, outputDir);
      
      // Generate summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n📊 Processing Summary');
      console.log('====================');
      console.log(`Total PDFs processed: ${results.length}`);
      console.log(`✓ Successful: ${successful}`);
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
      
      // Generate instructions
      await generateInstructions(outputDir, results);
      
      console.log('\n✅ Processing complete!');
      console.log('\nNext steps:');
      console.log('1. Review the generated prompts in the output directory');
      console.log('2. Use Claude Code sub-agents to process each prompt');
      console.log('3. Save the generated JSON files to the data directory');
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { processPDF, processDirectory };