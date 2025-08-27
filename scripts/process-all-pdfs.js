const fs = require('fs');
const path = require('path');
const CoEPDFParser = require('./parse-coe-pdfs');

class BatchPDFProcessor {
    constructor() {
        this.parser = new CoEPDFParser();
        this.inputDir = path.join(__dirname, '..', 'info', 'Centers of Excellence');
        this.outputDir = path.join(__dirname, '..', 'public', 'data', 'coes');
        this.logFile = path.join(__dirname, 'processing-log.txt');
    }

    /**
     * Find all PDF files recursively
     */
    findAllPDFs(dir = this.inputDir) {
        const pdfs = [];
        
        const scanDirectory = (currentDir) => {
            try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);
                    
                    if (entry.isDirectory()) {
                        scanDirectory(fullPath);
                    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
                        pdfs.push({
                            path: fullPath,
                            name: entry.name,
                            category: this.getCategoryFromPath(fullPath)
                        });
                    }
                }
            } catch (error) {
                console.error(`Error scanning directory ${currentDir}:`, error.message);
            }
        };

        scanDirectory(dir);
        return pdfs;
    }

    /**
     * Get category from file path
     */
    getCategoryFromPath(filePath) {
        const relativePath = path.relative(this.inputDir, filePath);
        const parts = relativePath.split(path.sep);
        
        if (parts.length > 1) {
            return parts[0].toLowerCase(); // First directory level
        }
        
        return 'general';
    }

    /**
     * Check if file should be skipped
     */
    shouldSkipFile(pdfInfo) {
        // Skip the mapping file for now - it will be processed separately
        if (pdfInfo.name.toLowerCase().includes('mapping')) {
            return true;
        }
        
        // Skip files that are too small (likely not content files)
        try {
            const stats = fs.statSync(pdfInfo.path);
            if (stats.size < 10000) { // Less than 10KB
                return true;
            }
        } catch (error) {
            return true; // If we can't stat the file, skip it
        }
        
        return false;
    }

    /**
     * Log processing activity
     */
    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        
        console.log(message);
        fs.appendFileSync(this.logFile, logEntry);
    }

    /**
     * Initialize processing
     */
    initialize() {
        // Clear previous log
        if (fs.existsSync(this.logFile)) {
            fs.unlinkSync(this.logFile);
        }
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        this.log('Batch PDF processing initialized');
        this.log(`Input directory: ${this.inputDir}`);
        this.log(`Output directory: ${this.outputDir}`);
    }

    /**
     * Process all PDFs
     */
    async processAllPDFs() {
        this.initialize();
        
        this.log('Scanning for PDF files...');
        const allPDFs = this.findAllPDFs();
        this.log(`Found ${allPDFs.length} PDF files`);
        
        // Filter out files to skip
        const pdfsToProcess = allPDFs.filter(pdf => !this.shouldSkipFile(pdf));
        const skippedCount = allPDFs.length - pdfsToProcess.length;
        
        this.log(`Processing ${pdfsToProcess.length} PDF files (${skippedCount} skipped)`);
        
        const results = {
            successful: [],
            failed: [],
            skipped: skippedCount,
            total: allPDFs.length
        };
        
        // Process each PDF
        for (let i = 0; i < pdfsToProcess.length; i++) {
            const pdfInfo = pdfsToProcess[i];
            const progress = `${i + 1}/${pdfsToProcess.length}`;
            
            this.log(`[${progress}] Processing: ${pdfInfo.name}`);
            
            try {
                const result = await this.parser.parsePDF(pdfInfo.path);
                results.successful.push({
                    ...result,
                    originalPath: pdfInfo.path,
                    category: pdfInfo.category
                });
                
                this.log(`[${progress}] ✓ SUCCESS: ${result.id}`);
                
            } catch (error) {
                results.failed.push({
                    path: pdfInfo.path,
                    name: pdfInfo.name,
                    error: error.message,
                    category: pdfInfo.category
                });
                
                this.log(`[${progress}] ✗ FAILED: ${pdfInfo.name} - ${error.message}`);
            }
            
            // Add a small delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return results;
    }

    /**
     * Process pillar mapping
     */
    async processPillarMapping() {
        this.log('Looking for pillar mapping file...');
        
        const mappingFiles = this.findAllPDFs().filter(pdf => 
            pdf.name.toLowerCase().includes('mapping') || 
            pdf.name.toLowerCase().includes('pillar')
        );
        
        if (mappingFiles.length === 0) {
            this.log('No pillar mapping file found');
            return null;
        }
        
        const mappingFile = mappingFiles[0];
        this.log(`Processing pillar mapping: ${mappingFile.name}`);
        
        try {
            const mapping = await this.parser.generatePillarMapping(mappingFile.path);
            this.log('✓ Pillar mapping generated successfully');
            return mapping;
        } catch (error) {
            this.log(`✗ Failed to generate pillar mapping: ${error.message}`);
            return null;
        }
    }

    /**
     * Update existing CoE files with relationships
     */
    async updateCoERelationships(pillarMapping) {
        if (!pillarMapping) {
            this.log('No pillar mapping available - skipping relationship updates');
            return;
        }
        
        this.log('Updating CoE relationships...');
        
        // Read all existing CoE files
        const coeFiles = fs.readdirSync(this.outputDir)
            .filter(file => file.startsWith('coe_') && file.endsWith('.json'));
        
        let updatedCount = 0;
        
        for (const filename of coeFiles) {
            try {
                const filePath = path.join(this.outputDir, filename);
                const coeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const coeId = coeData.id;
                
                // Find which pillar this CoE belongs to
                let belongsToPillar = null;
                for (const [pillarId, coeIds] of Object.entries(pillarMapping)) {
                    if (coeIds.includes(coeId)) {
                        belongsToPillar = pillarId;
                        break;
                    }
                }
                
                if (belongsToPillar) {
                    // Add BELONGS_TO relationship
                    const belongsRelation = {
                        to: belongsToPillar,
                        type: "BELONGS_TO"
                    };
                    
                    // Check if relationship already exists
                    const existingRelation = coeData.relationships.outgoing.find(
                        rel => rel.to === belongsToPillar && rel.type === "BELONGS_TO"
                    );
                    
                    if (!existingRelation) {
                        coeData.relationships.outgoing.push(belongsRelation);
                        
                        // Write updated file
                        fs.writeFileSync(filePath, JSON.stringify(coeData, null, 2));
                        updatedCount++;
                        
                        this.log(`Updated relationships for: ${coeId}`);
                    }
                }
                
            } catch (error) {
                this.log(`Error updating relationships for ${filename}: ${error.message}`);
            }
        }
        
        this.log(`Updated relationships for ${updatedCount} CoE files`);
    }

    /**
     * Generate processing summary
     */
    generateSummary(results, pillarMapping) {
        const summary = {
            timestamp: new Date().toISOString(),
            processing: results,
            pillarMapping: pillarMapping ? 'Generated' : 'Not available',
            details: {
                totalPDFsFound: results.total,
                successfullyProcessed: results.successful.length,
                failed: results.failed.length,
                skipped: results.skipped
            }
        };
        
        // Write summary to file
        const summaryPath = path.join(__dirname, 'processing-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        // Log summary
        this.log('\n' + '='.repeat(50));
        this.log('PROCESSING SUMMARY');
        this.log('='.repeat(50));
        this.log(`Total PDFs found: ${results.total}`);
        this.log(`Successfully processed: ${results.successful.length}`);
        this.log(`Failed: ${results.failed.length}`);
        this.log(`Skipped: ${results.skipped}`);
        this.log(`Pillar mapping: ${pillarMapping ? 'Generated' : 'Not available'}`);
        
        if (results.successful.length > 0) {
            this.log('\nSuccessfully processed files:');
            results.successful.forEach(item => {
                this.log(`  ✓ ${item.id} - ${item.name}`);
            });
        }
        
        if (results.failed.length > 0) {
            this.log('\nFailed files:');
            results.failed.forEach(item => {
                this.log(`  ✗ ${item.name} - ${item.error}`);
            });
        }
        
        this.log(`\nDetailed log: ${this.logFile}`);
        this.log(`Summary file: ${summaryPath}`);
        this.log('='.repeat(50));
        
        return summary;
    }

    /**
     * Run complete processing pipeline
     */
    async run() {
        try {
            this.log('Starting batch PDF processing...\n');
            
            // Process all PDFs
            const results = await this.processAllPDFs();
            
            // Process pillar mapping
            const pillarMapping = await this.processPillarMapping();
            
            // Update relationships
            await this.updateCoERelationships(pillarMapping);
            
            // Generate summary
            const summary = this.generateSummary(results, pillarMapping);
            
            return summary;
            
        } catch (error) {
            this.log(`Fatal error during processing: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BatchPDFProcessor;

// CLI usage
if (require.main === module) {
    const processor = new BatchPDFProcessor();
    
    processor.run()
        .then(summary => {
            console.log('\nBatch processing completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Batch processing failed:', error);
            process.exit(1);
        });
}