# Processing All CoE PDFs with Claude Code Sub-Agents

Now that we've successfully processed the DevOps CoE PDF, here's how to process all remaining PDFs using Claude Code's native PDF reading capability.

## ✅ Completed
- [x] DevOps CoE.pdf → `coe_devops.json`

## 📋 Remaining PDFs to Process

### Cloud CoEs
1. **Security CoE (Part 1 & 2)**
   ```
   Use Task tool:
   description: "Extract Security CoE data"
   subagent_type: "general-purpose"
   prompt: "Read both Security CoE PDFs at info/Centers of Excellence/Cloud/Security CoE - Part 1.pdf and Part 2.pdf. Combine information from both parts to create coe_security.json with all security frameworks, tools, compliance standards, and services. Save to data/coes/coe_security.json"
   ```

### Data CoEs
2. **Data Analytics CoE**
   ```
   Use Task tool:
   description: "Extract Data Analytics CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Data Analytics CoE.pdf and create coe_data_analytics.json with all analytics capabilities, tools, and services. Save to data/coes/"
   ```

3. **Data Governance CoE**
   ```
   Use Task tool:
   description: "Extract Data Governance CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Data Governance CoE.pdf and create coe_data_governance.json. Save to data/coes/"
   ```

4. **Data Mesh CoE**
   ```
   Use Task tool:
   description: "Extract Data Mesh CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Data Mesh CoE.pdf and create coe_data_mesh.json. Save to data/coes/"
   ```

5. **Data ROI CoE**
   ```
   Use Task tool:
   description: "Extract Data ROI CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Data ROI CoE.pdf and create coe_data_roi.json. Save to data/coes/"
   ```

6. **Data Streaming CoE**
   ```
   Use Task tool:
   description: "Extract Data Streaming CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Data Streaming CoE.pdf and create coe_data_streaming.json. Save to data/coes/"
   ```

7. **Data Transformation CoE**
   ```
   Use Task tool:
   description: "Extract Data Transformation CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Data Transformation CoE.pdf and create coe_data_transformation.json. Save to data/coes/"
   ```

8. **Databricks CoE**
   ```
   Use Task tool:
   description: "Extract Databricks CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Databricks CoE.pdf and create coe_databricks.json. Save to data/coes/"
   ```

9. **Financial Analytics CoE**
   ```
   Use Task tool:
   description: "Extract Financial Analytics CoE"
   subagent_type: "general-purpose"
   prompt: "Read info/Centers of Excellence/Data/Financial Analytics CoE.pdf and create coe_financial_analytics.json. Save to data/coes/"
   ```

10. **MDM CoE**
    ```
    Use Task tool:
    description: "Extract MDM CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Data/MDM CoE.pdf and create coe_mdm.json. Save to data/coes/"
    ```

11. **Medical Imaging CoE**
    ```
    Use Task tool:
    description: "Extract Medical Imaging CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Data/Medical Imaging CoE.pdf and create coe_medical_imaging.json. Save to data/coes/"
    ```

12. **Snowflake CoE**
    ```
    Use Task tool:
    description: "Extract Snowflake CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Data/Snowflake CoE.pdf and create coe_snowflake.json. Save to data/coes/"
    ```

### Product Engineering CoEs
13. **Architecture CoE**
    ```
    Use Task tool:
    description: "Extract Architecture CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/Architecture CoE.pdf and create coe_architecture.json. Save to data/coes/"
    ```

14. **Blockchain CoE**
    ```
    Use Task tool:
    description: "Extract Blockchain CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/Blockchain CoE.pdf and create coe_blockchain.json. Save to data/coes/"
    ```

15. **ECommerce CoE**
    ```
    Use Task tool:
    description: "Extract ECommerce CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/ECommerce CoE.pdf and create coe_ecommerce.json. Save to data/coes/"
    ```

16. **IoT CoE**
    ```
    Use Task tool:
    description: "Extract IoT CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/IoT CoE.pdf and create coe_iot.json. Save to data/coes/"
    ```

17. **Portfolio Rationalization CoE**
    ```
    Use Task tool:
    description: "Extract Portfolio Rationalization CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/Portfolio Rationalization CoE.pdf and create coe_portfolio_rationalization.json. Save to data/coes/"
    ```

18. **Reengineering CoE**
    ```
    Use Task tool:
    description: "Extract Reengineering CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/Reengineering CoE.pdf and create coe_reengineering.json. Save to data/coes/"
    ```

19. **Testing CoE**
    ```
    Use Task tool:
    description: "Extract Testing CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Prod Engg/Testing CoE.pdf and create coe_testing.json. Save to data/coes/"
    ```

20. **UX CoE (Part 1 & 2)**
    ```
    Use Task tool:
    description: "Extract UX CoE data"
    subagent_type: "general-purpose"
    prompt: "Read both UX CoE PDFs at info/Centers of Excellence/Prod Engg/UX CoE - Part 1.pdf and Part 2.pdf. Combine information to create coe_ux.json. Save to data/coes/"
    ```

### Enterprise Automation CoEs
21. **ServiceNow CoE**
    ```
    Use Task tool:
    description: "Extract ServiceNow CoE"
    subagent_type: "general-purpose"
    prompt: "Read info/Centers of Excellence/Enterprise Automation/Service Now CoE.pdf and create coe_servicenow.json. Save to data/coes/"
    ```

## Batch Processing Option

You can also process multiple PDFs in a single sub-agent task:

```
Use Task tool:
description: "Process all Data CoE PDFs"
subagent_type: "general-purpose"
prompt: "Process all PDFs in info/Centers of Excellence/Data/ directory. For each PDF, read the content (text and visuals), extract CoE information, and create corresponding JSON files in data/coes/. Include all technologies, services, competencies, and relationships."
```

## Important Notes

1. **Each sub-agent can directly read PDFs** - no need for text extraction scripts
2. **Visual content is automatically analyzed** - diagrams, charts, and images are processed
3. **Sub-agents run autonomously** - they have full access to Read, Write, and other tools
4. **JSON structure is consistent** - use the coe_devops.json as a reference template

## Validation

After processing all PDFs, run a validation sub-agent:

```
Use Task tool:
description: "Validate all CoE JSON files"
subagent_type: "general-purpose"
prompt: "Check all JSON files in data/coes/ for: valid JSON syntax, required fields present, proper ID naming (coe_*), valid relationships, and no duplicates. Report any issues."
```

## Category Mapping

Based on directory structure:
- **Cloud**: DevOps, Security → `pillar_cloud`
- **Data**: All data-related CoEs → `pillar_data`
- **Product Engineering**: Architecture, Testing, UX, etc. → `pillar_product_engineering`
- **Enterprise Automation**: ServiceNow → `pillar_enterprise_automation`