const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

class CoEPDFParser {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'public', 'data', 'coes');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Extract text from PDF file
     */
    async extractPDFText(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            console.error(`Error reading PDF ${pdfPath}:`, error);
            throw error;
        }
    }

    /**
     * Parse CoE information from PDF text
     */
    parseCoEContent(text, filename) {
        const coeData = {
            id: this.generateId(filename),
            name: this.extractCoEName(text, filename),
            description: this.extractDescription(text),
            order: this.calculateOrder(filename),
            keyCompetencies: this.extractKeyCompetencies(text),
            services: this.extractServices(text),
            content: {
                type: "file",
                source: `content/coe/${this.generateId(filename).replace('coe_', '')}.md`
            },
            type: "coe",
            tags: [], // Will be populated from keyCompetencies
            relationships: {
                outgoing: [],
                incoming: []
            }
        };

        // Set tags from key competencies
        coeData.tags = [...coeData.keyCompetencies];

        return coeData;
    }

    /**
     * Generate CoE ID from filename
     */
    generateId(filename) {
        const baseName = path.basename(filename, '.pdf')
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        return `coe_${baseName}`;
    }

    /**
     * Extract CoE name from text or filename
     */
    extractCoEName(text, filename) {
        // Try to extract from common patterns in the text
        const patterns = [
            /(?:Accion\s+)?(.+?)\s+CoE/i,
            /(?:Accion\s+)?(.+?)\s+Center\s+of\s+Excellence/i,
            /(?:Accion\s+)(.+?)\s+Capabilities/i,
            /(?:Accion\s+)(.+?)\s+Practice/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let name = match[1].trim();
                // Clean up common variations
                name = name.replace(/Labs:?\s*/i, '');
                if (!name.includes('CoE')) {
                    name += ' CoE';
                }
                return name;
            }
        }

        // Fallback to filename-based extraction
        let name = path.basename(filename, '.pdf');
        name = name.replace(/\s*CoE\s*/i, '');
        name = name.replace(/\s*Part\s+\d+/i, ''); // Remove "Part 1", "Part 2", etc.
        return `${name} CoE`;
    }

    /**
     * Extract description from text
     */
    extractDescription(text) {
        // Look for description patterns
        const patterns = [
            /(?:Key Goals?|Objectives?|Overview)[:\s]+(.*?)(?:\n\n|\n(?=[A-Z])|$)/is,
            /(?:CoE|Center of Excellence)[:\s]+(.{50,200}?)(?:\n\n|\n(?=[A-Z]))/is,
            /(?:Capabilities?|Services?|Expertise)[:\s]+(.{50,300}?)(?:\n\n|\n(?=[A-Z]))/is
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let desc = match[1].trim();
                // Clean up the description
                desc = desc.replace(/\s+/g, ' ');
                desc = desc.replace(/[^\w\s.,\-()]/g, '');
                if (desc.length > 200) {
                    desc = desc.substring(0, 200).trim() + '...';
                }
                return desc;
            }
        }

        return `Specialized center of excellence focused on delivering advanced capabilities and solutions`;
    }

    /**
     * Extract key competencies from text
     */
    extractKeyCompetencies(text) {
        const competencies = new Set();

        // Common technology and practice patterns
        const techPatterns = [
            /CI\/CD(?:\s+Pipeline)?/gi,
            /DevOps/gi,
            /DevSecOps/gi,
            /Site Reliability Engineering|SRE/gi,
            /Infrastructure as Code|IaC/gi,
            /Kubernetes/gi,
            /Docker/gi,
            /Terraform/gi,
            /Jenkins/gi,
            /GitOps/gi,
            /Monitoring/gi,
            /Observability/gi,
            /Security/gi,
            /Automation/gi,
            /Data Analytics?/gi,
            /Machine Learning|ML/gi,
            /Artificial Intelligence|AI/gi,
            /Cloud/gi,
            /Microservices/gi,
            /API/gi,
            /Data Visualization/gi,
            /Self-Service Analytics/gi,
            /Real-time Analytics/gi,
            /Predictive Analytics/gi,
            /Data Governance/gi,
            /Data Mesh/gi,
            /Data Streaming/gi,
            /Blockchain/gi,
            /IoT/gi,
            /UX/gi,
            /Architecture/gi,
            /Testing/gi,
            /Portfolio Rationalization/gi,
            /Reengineering/gi,
            /ECommerce/gi,
            /Medical Imaging/gi,
            /Financial Analytics/gi,
            /Master Data Management|MDM/gi
        ];

        for (const pattern of techPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const normalized = match.trim();
                    if (normalized.length > 2) {
                        competencies.add(normalized);
                    }
                });
            }
        }

        // Extract from bullet points or lists
        const listPattern = /•\s*([^•\n]{10,80})/g;
        let match;
        while ((match = listPattern.exec(text)) !== null) {
            const item = match[1].trim();
            if (item && item.length < 50 && !item.includes(':')) {
                competencies.add(item);
            }
        }

        return Array.from(competencies).slice(0, 8); // Limit to top 8
    }

    /**
     * Extract services from text
     */
    extractServices(text) {
        const services = [];
        
        // Look for service sections
        const servicePatterns = [
            /(?:Services?|Offerings?|Solutions?)[:\s]*\n(.*?)(?:\n\n|\n(?=[A-Z][a-z]+:))/gis,
            /(?:Our Solution|Key Solutions?)[:\s]*\n(.*?)(?:\n\n|\n(?=[A-Z][a-z]+:))/gis
        ];

        for (const pattern of servicePatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const serviceText = match[1];
                const serviceItems = this.parseServiceItems(serviceText);
                services.push(...serviceItems);
            }
        }

        // If no services found, create default ones based on competencies
        if (services.length === 0) {
            services.push({
                name: "Consulting & Implementation",
                description: "End-to-end consulting and implementation services",
                deliverables: [
                    "Assessment & Roadmap",
                    "Implementation",
                    "Training & Enablement"
                ]
            });

            services.push({
                name: "Managed Services",
                description: "Ongoing managed services and support",
                deliverables: [
                    "24/7 Monitoring",
                    "Maintenance & Updates",
                    "Performance Optimization"
                ]
            });
        }

        return services.slice(0, 4); // Limit to 4 services
    }

    /**
     * Parse individual service items from text
     */
    parseServiceItems(serviceText) {
        const services = [];
        const lines = serviceText.split('\n').filter(line => line.trim());
        
        let currentService = null;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Check if this looks like a service header (title case, ends with :)
            if (trimmed.match(/^[A-Z][^:]*:?\s*$/) && trimmed.length < 60) {
                if (currentService) {
                    services.push(currentService);
                }
                currentService = {
                    name: trimmed.replace(':', ''),
                    description: "",
                    deliverables: []
                };
            } else if (currentService && trimmed.startsWith('•')) {
                // This is a deliverable
                const deliverable = trimmed.replace('•', '').trim();
                if (deliverable.length < 100) {
                    currentService.deliverables.push(deliverable);
                }
            } else if (currentService && !currentService.description && trimmed.length > 20) {
                // This might be a description
                currentService.description = trimmed.substring(0, 150);
            }
        }

        if (currentService) {
            services.push(currentService);
        }

        return services.filter(service => service.name && service.name.length > 0);
    }

    /**
     * Calculate order based on filename or content
     */
    calculateOrder(filename) {
        const orderMap = {
            'devops': 1,
            'data': 2,
            'analytics': 3,
            'cloud': 4,
            'security': 5,
            'architecture': 6,
            'automation': 7,
            'testing': 8,
            'ux': 9,
            'blockchain': 10
        };

        const name = filename.toLowerCase();
        for (const [key, order] of Object.entries(orderMap)) {
            if (name.includes(key)) {
                return order;
            }
        }

        return 99; // Default order for unmatched items
    }

    /**
     * Parse single PDF file
     */
    async parsePDF(pdfPath) {
        try {
            console.log(`Parsing PDF: ${pdfPath}`);
            
            const text = await this.extractPDFText(pdfPath);
            const filename = path.basename(pdfPath);
            const coeData = this.parseCoEContent(text, filename);
            
            const outputPath = path.join(this.outputDir, `${coeData.id}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(coeData, null, 2));
            
            console.log(`Generated: ${outputPath}`);
            return coeData;
            
        } catch (error) {
            console.error(`Error parsing ${pdfPath}:`, error);
            throw error;
        }
    }

    /**
     * Parse multiple PDF files
     */
    async parseMultiplePDFs(pdfPaths) {
        const results = [];
        
        for (const pdfPath of pdfPaths) {
            try {
                const result = await this.parsePDF(pdfPath);
                results.push(result);
            } catch (error) {
                console.error(`Failed to parse ${pdfPath}:`, error.message);
                results.push({ error: error.message, path: pdfPath });
            }
        }
        
        return results;
    }

    /**
     * Generate pillar relationship mapping from mapping PDF
     */
    async generatePillarMapping(mappingPdfPath) {
        try {
            console.log(`Generating pillar mapping from: ${mappingPdfPath}`);
            
            const text = await this.extractPDFText(mappingPdfPath);
            const mapping = this.extractPillarMappings(text);
            
            const outputPath = path.join(this.outputDir, '..', 'pillar-coe-mapping.json');
            fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
            
            console.log(`Generated mapping: ${outputPath}`);
            return mapping;
            
        } catch (error) {
            console.error(`Error generating pillar mapping:`, error);
            throw error;
        }
    }

    /**
     * Extract pillar to CoE mappings from text
     */
    extractPillarMappings(text) {
        const mappings = {
            "pillar_cloud": ["coe_devops", "coe_security"],
            "pillar_data": ["coe_data_analytics", "coe_data_governance", "coe_data_mesh", "coe_data_roi", "coe_data_streaming", "coe_data_transformation", "coe_databricks", "coe_financial_analytics", "coe_mdm", "coe_medical_imaging", "coe_snowflake"],
            "pillar_automation": ["coe_service_now"],
            "pillar_digital_products": ["coe_architecture", "coe_blockchain", "coe_ecommerce", "coe_iot", "coe_portfolio_rationalization", "coe_reengineering", "coe_testing", "coe_ux"]
        };

        // TODO: Parse actual mappings from the text when needed
        // For now, return the default mapping structure
        
        return mappings;
    }
}

module.exports = CoEPDFParser;

// CLI usage
if (require.main === module) {
    const parser = new CoEPDFParser();
    
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: node parse-coe-pdfs.js <pdf-file> [<pdf-file2> ...]');
        console.log('Example: node parse-coe-pdfs.js "../info/Centers of Excellence/Cloud/DevOps CoE.pdf"');
        process.exit(1);
    }
    
    parser.parseMultiplePDFs(args)
        .then(results => {
            console.log(`\nParsing completed. Results:`);
            results.forEach((result, index) => {
                if (result.error) {
                    console.log(`${index + 1}. ERROR: ${result.error} (${result.path})`);
                } else {
                    console.log(`${index + 1}. SUCCESS: ${result.id} - ${result.name}`);
                }
            });
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}