/**
 * Type References
 *
 * Auto-generated type reference sections from @almadar packages.
 * Used to compose generation prompts.
 *
 * @packageDocumentation
 */

import { getAllPatternTypes, getPatternPropsCompact } from '@almadar/patterns';
import { UI_SLOTS } from '@almadar/core/types';

// `OPERATORS` was retired from @almadar/core when the operators registry was
// folded into `@almadar/std/modules/core` (April 2026). For the S-expression
// quick-ref sample below we use a fixed set of representative operator names —
// the prompt only needs ~15 examples for the LLM to grok the form.
const OPERATOR_SAMPLE = [
  'set', 'fetch', 'persist', 'render-ui', 'emit', 'navigate', 'notify',
  'if', 'when', 'let', 'do', '+', '-', '*', '/',
] as const;

/**
 * Get minimal type reference for orbital schemas.
 * Covers entities, traits, pages, and basic structure.
 */
export function getMinimalTypeReference(): string {
  return `
## Orbital Schema Structure

\`\`\`typescript
interface OrbitalDefinition {
  name: string;              // Entity name (PascalCase)
  entity: Entity;            // Data model
  traits: TraitRef[];        // State machines (names or definitions)
  pages: Page[];             // Routes and views
  emits?: string[];          // Events this orbital emits
  listens?: EventListener[]; // Events this orbital listens to
}
\`\`\`

### Entity Fields

\`\`\`typescript
{ name: "title", type: "string", required: true }
{ name: "count", type: "number", default: 0 }
{ name: "status", type: "enum", values: ["pending", "active", "done"] }
{ name: "dueDate", type: "date" }
\`\`\`

### Trait State Machine

\`\`\`typescript
{
  states: [{ name: "Idle", isInitial: true }, { name: "Active" }],
  events: ["INIT", "ACTIVATE", "COMPLETE"],
  transitions: [
    { from: "Idle", to: "Active", event: "ACTIVATE",
      guards: [["condition"]],
      effects: [["action"]] }
  ]
}
\`\`\`
`.trim();
}

/**
 * Get compact pattern types listing.
 */
export function getPatternTypesCompact(): string {
  const patterns = getAllPatternTypes();
  return `
## Available Pattern Types

${patterns.map(p => `- \`${p}\``).join('\n')}

${getPatternPropsCompact()}
`.trim();
}

/**
 * Get S-Expression quick reference.
 */
export function getSExprQuickRef(): string {
  const operators = OPERATOR_SAMPLE.slice(0, 15);

  return `
## S-Expression Quick Reference

### Guard Expressions (Conditions)

\`\`\`typescript
["=", "@entity.status", "active"]        // Equality
[">", "@entity.count", 0]                 // Greater than
["and", ["cond1"], ["cond2"]]            // Logical AND
["or", ["cond1"], ["cond2"]]             // Logical OR
["not", ["condition"]]                    // Logical NOT
\`\`\`

### Effect Expressions (Actions)

\`\`\`typescript
["set", "@entity.field", value]          // Update field
["emit", "EVENT_NAME", payload]          // Emit event
["navigate", "/path"]                     // Navigate to route
["render-ui", "main", { type, props }]   // Render pattern
["persist", "create", "Entity", data]    // Database operation
\`\`\`

### Available Operators

${operators.map(op => `- \`${op}\``).join('\n')}
`.trim();
}

/**
 * Get render-ui quick reference.
 */
export function getRenderUIQuickRef(): string {
  const slots = UI_SLOTS;

  return `
## Render-UI Effect Reference

### Syntax

\`\`\`typescript
["render-ui", slot, patternConfig | null]
\`\`\`

### UI Slots

${slots.map(slot => `- \`${slot}\``).join('\n')}

### Example

\`\`\`typescript
["render-ui", "main", {
  type: "entity-table",
  entity: "Task",
  columns: ["title", "status"],
  itemActions: [{ label: "Edit", event: "EDIT" }]
}]
\`\`\`

Clear slot: \`["render-ui", "modal", null]\`
`.trim();
}

/**
 * Get field types compact reference.
 */
export function getFieldTypesCompact(): string {
  return `
## Field Types

| Type | Example | Notes |
|------|---------|-------|
| \`string\` | \`{ name: "title", type: "string" }\` | Text |
| \`number\` | \`{ name: "count", type: "number" }\` | Integer or float |
| \`boolean\` | \`{ name: "active", type: "boolean" }\` | true/false |
| \`date\` | \`{ name: "birthday", type: "date" }\` | Date only |
| \`timestamp\` | \`{ name: "createdAt", type: "timestamp" }\` | Date + time |
| \`enum\` | \`{ name: "status", type: "enum", values: ["a", "b"] }\` | Fixed options |
| \`array\` | \`{ name: "tags", type: "array", items: "string" }\` | List |
| \`relation\` | \`{ name: "user", type: "relation", relation: { entity: "User", cardinality: "one" } }\` | Foreign key |

### Field Properties

- \`required: true\` - Must have value
- \`default: value\` - Default value
- \`unique: true\` - Must be unique
`.trim();
}
