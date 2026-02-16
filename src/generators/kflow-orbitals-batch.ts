/**
 * KFlow Orbitals Batch Skill Generator
 *
 * Generates the kflow-orbitals-batch skill for efficient multi-orbital generation.
 * Uses batch generation for 2x-3x speedup on complex applications.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import { generateLeanOrbitalSkill } from '../orbitals-skills-generators/lean-orbital-skill-generator.js';

/**
 * Generate the kflow-orbitals-batch skill.
 *
 * This skill is optimized for generating multiple orbitals efficiently
 * using batch generation instead of individual tool calls.
 *
 * Key differences from kflow-orbitals:
 * - Uses generate_orbitals_batch tool for 2x+ speedup
 * - Automatically handles parallelization
 * - Optimized for 3+ orbital applications
 */
export function generateKflowOrbitalsBatchSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'kflow-orbitals-batch',
    description:
      'Generate KFlow schemas using optimized batch generation. 2x-3x faster than sequential generation for multi-orbital applications. Automatically parallelizes orbital generation with smart concurrency.',
    allowedTools: [
      'Read',
      'Write',
      'Edit',
      'generate_orbitals_batch',
      'finish_task',
      'query_schema_structure',
      'extract_chunk',
      'apply_chunk',
    ],
    version: '1.0.0',
  };

  // Use lean skill base with batch-specific modifications
  const baseContent = generateLeanOrbitalSkill({
    includeExample: true,
    includeToolWorkflow: false, // We'll add our own workflow
    includeStdStateMachines: false,
    includeSchemaUpdates: false,
    includeCustomTraits: false,
    errorLevel: 'top6',
    includeDesignGuide: true,
  });

  // Replace the workflow section with batch-specific workflow
  const batchWorkflow = getBatchToolWorkflowSection();

  const content = baseContent.replace(
    /## Tool Workflow[\s\S]*?(?=---\n\n## |$)/,
    batchWorkflow
  );

  return {
    name: 'kflow-orbitals-batch',
    frontmatter,
    content,
  };
}

/**
 * Get batch-specific tool workflow section.
 */
function getBatchToolWorkflowSection(): string {
  return `---

## Tool Workflow

### Phase 1: DECOMPOSE
Break requirements into OrbitalUnits (pure reasoning, no tools).

Identify:
- Entities and their relationships
- Traits needed for each entity
- Cross-orbital events (emits/listens)
- Shared domain vocabulary

### Phase 2: BATCH GENERATE (NEW - Much Faster!)
Call \`generate_orbitals_batch\` with ALL orbitals at once:

\`\`\`
generate_orbitals_batch({
  orbitals: [
    { name: "Products", entity: {...}, traits: [...] },
    { name: "Orders", entity: {...}, traits: [...] },
    { name: "Customers", entity: {...}, traits: [...] },
    // ... all orbitals
  ],
  options: {
    mode: "adaptive",  // Let system choose best strategy
    preserveRelationships: true  // Keep related orbitals together
  }
})
\`\`\`

**Why Batch Generation?**
- **2x-3x faster** than calling generate_orbital multiple times
- Automatic parallelization (up to 3 concurrent for Anthropic)
- Smart batching preserves cross-orbital relationships
- Single LLM call can generate 3 orbitals simultaneously

**Batch Size Guidelines:**
| Provider | Max per Batch | Concurrency |
|----------|---------------|-------------|
| Anthropic | 3 | 3 |
| OpenAI | 5 | 5 |
| DeepSeek | 3 | 3 |

### Phase 3: COMBINE
Call \`finish_task\` to auto-combine and validate:

\`\`\`
finish_task({ appName: "App" })
# Reads generated orbitals → schema.json → orbital validate
\`\`\`

### Phase 4: VERIFY COMPOSITION QUALITY

Before calling \`finish_task\`, verify each INIT transition:

1. **Uses a single \`render-ui\` call** with top-level \`stack\` and \`children\`
2. **Has 3+ composed sections**: header, metrics, data
3. **Uses domain-appropriate atoms**: \`badge\`, \`typography\`, \`button\`
4. **Props are correct**: \`submitEvent\` not \`onSubmit\`

---

## Comparison: Sequential vs Batch

### Sequential (Old Way)
```
Main Agent
  → generate_orbital(Products) → Wait (50s)
  → generate_orbital(Orders) → Wait (50s)
  → generate_orbital(Customers) → Wait (50s)
  → generate_orbital(Dashboard) → Wait (50s)
Total: ~200s (3.3 minutes)
```

### Batch (New Way)
```
Main Agent
  → generate_orbitals_batch([Products, Orders, Customers, Dashboard])
      → Parallel generation (max 3 concurrent)
      → Batch 1: [Products, Orders, Customers] (60s)
      → Batch 2: [Dashboard] (50s)
Total: ~110s (1.8 minutes) - **1.8x faster!**
```

---

## When to Use Batch Mode

**Always use batch for 3+ orbitals.**

| # Orbitals | Recommended | Expected Speedup |
|------------|-------------|------------------|
| 1 | Sequential | 1x (baseline) |
| 2 | Sequential | 1x |
| 3+ | **Batch** | **1.8x - 2.5x** |
| 6+ | **Batch** | **2.5x - 3x** |

---

`;
}

/**
 * Get batch-specific usage example.
 */
export function getBatchExample(): string {
  return `---

## Example: E-commerce (Batch Generation)

This example shows the batch workflow for a 4-orbital e-commerce app:

\`\`\`json
{
  "name": "ShopAdmin",
  "version": "1.0.0",
  "orbitals": [
    // All 4 orbitals generated in 1-2 batch calls
    {
      "name": "Product Management",
      "entity": {
        "name": "Product",
        "persistence": "persistent",
        "fields": [
          { "name": "name", "type": "string", "required": true },
          { "name": "price", "type": "number", "required": true },
          { "name": "stock", "type": "number", "default": 0 }
        ]
      },
      "traits": ["List", "Detail", "Form"],
      "patterns": ["entity-table", "entity-detail", "form-section"]
    },
    {
      "name": "Order Management",
      "entity": {
        "name": "Order",
        "persistence": "persistent",
        "fields": [
          { "name": "customerId", "type": "relation", "required": true },
          { "name": "total", "type": "number", "required": true },
          { "name": "status", "type": "enum", "values": ["pending", "paid", "shipped"] }
        ]
      },
      "traits": ["List", "Detail"],
      "patterns": ["entity-table", "entity-detail"],
      "listens": [{ "event": "PRODUCT_PURCHASED", "triggers": "UPDATE_STOCK" }]
    },
    {
      "name": "Customer Management",
      "entity": {
        "name": "Customer",
        "persistence": "persistent",
        "fields": [
          { "name": "name", "type": "string", "required": true },
          { "name": "email", "type": "string", "required": true },
          { "name": "phone", "type": "string" }
        ]
      },
      "traits": ["List", "Detail", "Form"],
      "patterns": ["entity-table", "entity-detail", "form-section"]
    },
    {
      "name": "Dashboard",
      "entity": {
        "name": "Dashboard",
        "persistence": "runtime",
        "singleton": true,
        "fields": [
          { "name": "totalSales", "type": "number", "default": 0 },
          { "name": "totalOrders", "type": "number", "default": 0 },
          { "name": "recentOrders", "type": "array", "items": "object" }
        ]
      },
      "traits": ["DashboardView"],
      "patterns": ["stats-grid", "recent-list"],
      "listens": [
        { "event": "ORDER_CREATED", "triggers": "UPDATE_STATS" },
        { "event": "ORDER_PAID", "triggers": "UPDATE_SALES" }
      ]
    }
  ]
}
\`\`\`

**Generation Strategy:**
- Batch 1: Product, Order, Customer (3 orbitals, ~60s)
- Batch 2: Dashboard (1 orbital with complex listeners, ~50s)
- **Total: ~110s** vs ~200s sequential

---
`;
}
