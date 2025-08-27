# PDF Parsing Scripts for Center of Excellence (CoE) Data

This directory contains scripts to parse PDF files from the `info/Centers of Excellence/` directory and convert them into JSON configuration files that match the application's data structure.

## Overview

The PDF parsing solution consists of two main scripts:

1. **`parse-coe-pdfs.js`** - Core PDF parsing utility for individual files
2. **`process-all-pdfs.js`** - Batch processing script for all PDFs

## Quick Start

### Prerequisites

Install the required dependency:
```bash
npm install
```

### Parse All PDFs

To process all PDF files in the `info/Centers of Excellence/` directory:

```bash
npm run parse-pdfs
```

This command will:
- Scan all subdirectories for PDF files
- Parse each PDF and extract CoE information
- Generate JSON files in `public/data/coes/` directory
- Create pillar relationship mappings
- Generate processing logs and summary

### Parse Single PDF

To parse a single PDF file:

```bash
npm run parse-single-pdf "path/to/your/file.pdf"
```

Example:
```bash
npm run parse-single-pdf "../info/Centers of Excellence/Cloud/DevOps CoE.pdf"
```

## Script Details

### parse-coe-pdfs.js

**Purpose**: Core PDF parsing utility that extracts structured information from CoE PDF files.

**Key Features**:
- Extracts CoE name, description, and key competencies
- Identifies services and deliverables
- Generates proper JSON structure matching existing data format
- Handles various PDF formatting styles
- Supports multi-page documents

**Usage**:
```javascript
const CoEPDFParser = require('./parse-coe-pdfs');
const parser = new CoEPDFParser();

// Parse single PDF
const result = await parser.parsePDF('path/to/file.pdf');

// Parse multiple PDFs
const results = await parser.parseMultiplePDFs(['file1.pdf', 'file2.pdf']);
```

### process-all-pdfs.js

**Purpose**: Batch processing script that handles all PDFs in the CoE directory structure.

**Key Features**:
- Recursive directory scanning
- Error handling and logging
- Progress tracking
- Pillar relationship mapping
- Processing summary generation
- Automatic output directory management

**Usage**:
```javascript
const BatchPDFProcessor = require('./process-all-pdfs');
const processor = new BatchPDFProcessor();

const summary = await processor.run();
```

## Generated Files

### JSON Structure

Each parsed PDF generates a JSON file with the following structure:

```json
{
  "id": "coe_devops",
  "name": "DevOps CoE",
  "description": "Accelerates software delivery through DevOps, DevSecOps, and SRE practices",
  "order": 3,
  "keyCompetencies": [
    "CI/CD Pipeline",
    "Infrastructure as Code",
    "DevSecOps",
    "Site Reliability Engineering"
  ],
  "services": [
    {
      "name": "DevOps Transformation",
      "description": "End-to-end DevOps transformation and implementation",
      "deliverables": [
        "DevOps Assessment",
        "Pipeline Implementation", 
        "Training & Enablement"
      ]
    }
  ],
  "content": {
    "type": "file",
    "source": "content/coe/devops.md"
  },
  "type": "coe",
  "tags": ["CI/CD Pipeline", "Infrastructure as Code", "DevSecOps", "Site Reliability Engineering"],
  "relationships": {
    "outgoing": [
      {
        "to": "pillar_automation",
        "type": "BELONGS_TO"
      }
    ],
    "incoming": []
  }
}
```

### Output Files

After processing, you'll find:

- **`public/data/coes/*.json`** - Individual CoE JSON files
- **`public/data/pillar-coe-mapping.json`** - Pillar relationship mappings
- **`scripts/processing-log.txt`** - Detailed processing log
- **`scripts/processing-summary.json`** - Processing summary and statistics

## Parsing Logic

### Name Extraction

The parser identifies CoE names using these patterns:
- `Accion [Name] CoE`
- `[Name] Center of Excellence`
- `[Name] Capabilities`
- Falls back to filename if no pattern matches

### Description Extraction

Descriptions are extracted from sections containing:
- "Key Goals" or "Objectives"
- "Overview" sections
- General CoE capability descriptions
- Limited to ~200 characters for consistency

### Key Competencies

Competencies are identified through:
- Technology keywords (DevOps, CI/CD, Kubernetes, etc.)
- Practice patterns (Site Reliability Engineering, etc.)
- Bullet point lists
- Industry-specific terms

### Services Extraction

Services are parsed from:
- "Services" or "Solutions" sections
- "Our Solution" headings
- Structured lists with deliverables
- Default services generated if none found

## Configuration

### File Skipping Rules

Files are automatically skipped if:
- File size < 10KB (likely not content files)
- Filename contains "mapping" (processed separately)
- File is unreadable or corrupted

### Category Mapping

CoEs are categorized based on their directory structure:
- `Cloud/` → Cloud-related CoEs
- `Data/` → Data-related CoEs  
- `Enterprise Automation/` → Automation CoEs
- `Prod Engg/` → Product Engineering CoEs

### Order Assignment

CoEs are assigned order values for UI display:
- DevOps → 1
- Data → 2
- Analytics → 3
- Cloud → 4
- Security → 5
- Architecture → 6
- (Other categories get default order: 99)

## Error Handling

The scripts include comprehensive error handling:

- **File Access Errors**: Logged and skipped
- **PDF Parsing Errors**: Individual files fail without stopping batch processing
- **JSON Generation Errors**: Detailed error messages with file context
- **Directory Issues**: Automatic directory creation and permission handling

## Troubleshooting

### Common Issues

1. **"PDF file is corrupted"**
   - Check if the PDF opens normally in a PDF viewer
   - Try re-downloading or re-creating the PDF

2. **"No text extracted from PDF"**
   - PDF might be image-based (scanned)
   - Consider OCR preprocessing for image PDFs

3. **"Permission denied" errors**
   - Check file permissions on input/output directories
   - Ensure Node.js has read/write access

4. **Missing dependencies**
   ```bash
   npm install pdf-parse
   ```

### Debugging

Enable detailed logging by setting environment variables:

```bash
DEBUG=true npm run parse-pdfs
```

Check the processing log for detailed information:
```bash
cat scripts/processing-log.txt
```

## Manual Corrections

After automated parsing, you may need to manually adjust:

1. **Relationship mappings** - Verify pillar assignments
2. **Service descriptions** - Enhance generated descriptions
3. **Key competencies** - Add domain-specific competencies
4. **Content references** - Update markdown file paths if needed

## Integration

The generated JSON files integrate with the existing application by:

1. **Matching data structure** - Uses exact same schema as existing CoE files
2. **Relationship compatibility** - Generates proper relationship objects
3. **Type safety** - Follows TypeScript interfaces defined in `src/types/`
4. **Content system** - References markdown files in `public/content/coe/`

## Performance

Processing performance varies by:
- **PDF size and complexity** - Larger, complex PDFs take longer
- **Number of files** - Batch processing includes small delays between files
- **System resources** - PDF parsing is CPU-intensive

Typical processing time: ~2-5 seconds per PDF file.

## Maintenance

### Adding New Patterns

To support new PDF formats, update the parsing patterns in `parse-coe-pdfs.js`:

```javascript
const patterns = [
    /new-pattern-here/i,
    // existing patterns...
];
```

### Updating Output Schema

When the CoE data schema changes:
1. Update the parsing logic in `parseCoEContent()`
2. Ensure compatibility with TypeScript interfaces
3. Test with existing data files

### Adding New Relationship Types

Update the relationship mapping logic in `updateCoERelationships()` to support new relationship types as defined in `src/types/base-entities.ts`.