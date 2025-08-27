#!/usr/bin/env node

/**
 * PDF Text Extraction Utility
 * Extracts text from PDF files for processing by sub-agents
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata
    };
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error.message);
    throw error;
  }
}

async function processAllPDFs(directory) {
  const results = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.pdf')) {
        results.push({
          path: fullPath,
          name: file,
          category: path.basename(path.dirname(fullPath))
        });
      }
    }
  }
  
  walkDir(directory);
  return results;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node extract-pdf-text.js <pdf-file-or-directory> [output-file]');
    process.exit(1);
  }
  
  const inputPath = path.resolve(args[0]);
  const outputFile = args[1] ? path.resolve(args[1]) : null;
  
  (async () => {
    try {
      const stats = fs.statSync(inputPath);
      let results = {};
      
      if (stats.isDirectory()) {
        const pdfs = await processAllPDFs(inputPath);
        console.log(`Found ${pdfs.length} PDF files`);
        
        for (const pdf of pdfs) {
          console.log(`Processing: ${pdf.name}`);
          try {
            const extracted = await extractTextFromPDF(pdf.path);
            results[pdf.path] = {
              name: pdf.name,
              category: pdf.category,
              text: extracted.text,
              pages: extracted.pages,
              info: extracted.info
            };
          } catch (error) {
            results[pdf.path] = {
              name: pdf.name,
              category: pdf.category,
              error: error.message
            };
          }
        }
      } else {
        const extracted = await extractTextFromPDF(inputPath);
        results[inputPath] = extracted;
      }
      
      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log(`Results saved to: ${outputFile}`);
      } else {
        console.log(JSON.stringify(results, null, 2));
      }
      
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { extractTextFromPDF, processAllPDFs };