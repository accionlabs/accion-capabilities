#!/usr/bin/env node

/**
 * AI-Powered PDF Extraction Agent
 * 
 * This agent uses Claude API to intelligently extract and structure information
 * from PDF documents into our entity data model format.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Extracts text content from a PDF file using pdftotext
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(pdfPath) {
  try {
    // First try with pdftotext (more reliable for text extraction)
    const { stdout } = await execAsync(`pdftotext -layout "${pdfPath}" -`);
    return stdout;
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error.message);
    // Fallback to pdf-parse if pdftotext is not available
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (fallbackError) {
      throw new Error(`Failed to extract text from PDF: ${fallbackError.message}`);
    }
  }
}

/**
 * Creates a prompt for Claude to extract CoE information
 * @param {string} pdfText - Extracted text from PDF
 * @param {string} fileName - Name of the PDF file
 * @returns {string} - Formatted prompt
 */
function createCoEExtractionPrompt(pdfText, fileName) {
  return `
You are an expert at extracting structured information from documents about Centers of Excellence (CoE).

Please analyze the following text extracted from "${fileName}" and create a JSON configuration for a Center of Excellence entity.

The JSON should follow this exact structure:
{
  "id": "coe_[lowercase_name_with_underscores]",
  "type": "coe",
  "data": {
    "name": "[Full CoE Name]",
    "description": "[Comprehensive description of the CoE]",
    "category": "[One of: Cloud, Data, Product Engineering, Enterprise Automation]",
    "order": [number for display ordering],
    "parentPillar": "[ID of parent pillar if mentioned]",
    "keyCompetencies": [
      "[Competency 1]",
      "[Competency 2]",
      // ... list all key competencies mentioned
    ],
    "services": [
      {
        "name": "[Service Name]",
        "description": "[Service Description]",
        "deliverables": [
          "[Deliverable 1]",
          "[Deliverable 2]"
        ]
      }
      // ... list all services mentioned
    ],
    "technologies": [
      "[Technology 1]",
      "[Technology 2]"
      // ... list all technologies mentioned
    ],
    "industries": [
      "[Industry 1]",
      "[Industry 2]"
      // ... list relevant industries
    ],
    "businessValue": "[Summary of business value provided]",
    "content": {
      "type": "file",
      "source": "content/coes/[id].md"
    }
  },
  "relationships": [
    {
      "type": "BELONGS_TO",
      "to": "[pillar_id]",
      "metadata": {
        "primary": true
      }
    },
    {
      "type": "USES",
      "to": "[technology_id]"
    }
    // ... add other relationships as appropriate
  ],
  "metadata": {
    "tags": [
      "[relevant tag 1]",
      "[relevant tag 2]"
    ],
    "lastUpdated": "[current date]",
    "version": "1.0"
  }
}

Important guidelines:
1. Extract as much relevant information as possible
2. Infer the category based on the content and file path
3. Create meaningful relationships based on mentioned technologies, platforms, or frameworks
4. Generate appropriate tags based on the content
5. If certain information is not available, omit that field rather than using placeholder text
6. Ensure all IDs follow the pattern: coe_[name] where name is lowercase with underscores

Here is the extracted text from the PDF:

---
${pdfText}
---

Please provide only the JSON output without any additional explanation or markdown formatting.
`;
}

/**
 * Creates a prompt for extracting platform/accelerator information
 * @param {string} pdfText - Extracted text from PDF
 * @param {string} entityType - Type of entity (platform, accelerator, etc.)
 * @returns {string} - Formatted prompt
 */
function createEntityExtractionPrompt(pdfText, entityType, fileName) {
  return `
You are an expert at extracting structured information from technical documents.

Please analyze the following text extracted from "${fileName}" and create a JSON configuration for a ${entityType} entity.

The JSON should follow this structure:
{
  "id": "${entityType}_[lowercase_name_with_underscores]",
  "type": "${entityType}",
  "data": {
    "name": "[Full Name]",
    "description": "[Comprehensive description]",
    "category": "[Relevant category]",
    "order": [number for display ordering],
    "keyFeatures": [
      {
        "name": "[Feature Name]",
        "description": "[Feature Description]",
        "businessValue": "[Business value of this feature]"
      }
    ],
    "technologies": ["[Tech 1]", "[Tech 2]"],
    "targetIndustries": ["[Industry 1]", "[Industry 2]"],
    "clientValue": [
      "[Value proposition 1]",
      "[Value proposition 2]"
    ],
    "content": {
      "type": "file",
      "source": "content/${entityType}s/[id].md"
    }
  },
  "relationships": [
    {
      "type": "IMPLEMENTS",
      "to": "[related_entity_id]"
    }
  ],
  "metadata": {
    "tags": ["[tag1]", "[tag2]"],
    "lastUpdated": "[current date]",
    "version": "1.0"
  }
}

Extract all relevant information from the text below:

---
${pdfText}
---

Provide only the JSON output.
`;
}

/**
 * Main function to process a PDF and extract entity data
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} entityType - Type of entity to extract
 * @param {string} outputDir - Directory to save the JSON output
 */
async function processPDF(pdfPath, entityType = 'coe', outputDir) {
  console.log(`Processing: ${pdfPath}`);
  
  try {
    // Extract text from PDF
    const pdfText = await extractTextFromPDF(pdfPath);
    const fileName = path.basename(pdfPath);
    
    // Create appropriate prompt based on entity type
    let prompt;
    if (entityType === 'coe') {
      prompt = createCoEExtractionPrompt(pdfText, fileName);
    } else {
      prompt = createEntityExtractionPrompt(pdfText, entityType, fileName);
    }
    
    // Save prompt for manual processing or API call
    const promptFile = path.join(outputDir, `${path.basename(pdfPath, '.pdf')}_prompt.txt`);
    await fs.writeFile(promptFile, prompt);
    
    console.log(`✓ Created prompt for: ${fileName}`);
    console.log(`  Saved to: ${promptFile}`);
    
    // Note: Actual Claude API integration would go here
    // For now, we're saving the prompts for manual processing
    
    return {
      success: true,
      pdfPath,
      promptFile,
      textLength: pdfText.length
    };
    
  } catch (error) {
    console.error(`✗ Error processing ${pdfPath}:`, error.message);
    return {
      success: false,
      pdfPath,
      error: error.message
    };
  }
}

/**
 * Process all PDFs in a directory recursively
 * @param {string} directory - Directory containing PDFs
 * @param {string} outputDir - Directory for output files
 */
async function processDirectory(directory, outputDir) {
  const files = await fs.readdir(directory, { withFileTypes: true });
  const results = [];
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      // Recursively process subdirectories
      const subResults = await processDirectory(fullPath, outputDir);
      results.push(...subResults);
    } else if (file.name.endsWith('.pdf')) {
      // Determine entity type based on file path
      let entityType = 'coe';
      if (fullPath.includes('platforms')) entityType = 'platform';
      else if (fullPath.includes('accelerators')) entityType = 'accelerator';
      
      const result = await processPDF(fullPath, entityType, outputDir);
      results.push(result);
    }
  }
  
  return results;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node pdf-extraction-agent.js <input-dir-or-file> <output-dir>');
    console.log('Example: node pdf-extraction-agent.js "../info/Centers of Excellence" "../data/extracted"');
    process.exit(1);
  }
  
  const inputPath = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);
  
  (async () => {
    try {
      // Create output directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });
      
      const stats = await fs.stat(inputPath);
      let results;
      
      if (stats.isDirectory()) {
        console.log(`Processing directory: ${inputPath}`);
        results = await processDirectory(inputPath, outputDir);
      } else if (inputPath.endsWith('.pdf')) {
        console.log(`Processing file: ${inputPath}`);
        results = [await processPDF(inputPath, 'coe', outputDir)];
      } else {
        throw new Error('Input must be a PDF file or directory');
      }
      
      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n=== Processing Summary ===');
      console.log(`Total PDFs processed: ${results.length}`);
      console.log(`Successful: ${successful}`);
      console.log(`Failed: ${failed}`);
      
      if (failed > 0) {
        console.log('\nFailed files:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`  - ${r.pdfPath}: ${r.error}`);
        });
      }
      
      // Save processing log
      const logFile = path.join(outputDir, 'processing-log.json');
      await fs.writeFile(logFile, JSON.stringify(results, null, 2));
      console.log(`\nProcessing log saved to: ${logFile}`);
      
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { extractTextFromPDF, processPDF, processDirectory };