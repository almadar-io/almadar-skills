/**
 * KFlow Design Skill Generator
 *
 * Generates the kflow-design skill for render-ui authoring.
 * This is a focused ~10K skill that operates at the transition level,
 * producing rich render-ui effects using the full pattern catalog.
 *
 * Unlike kflow-orbitals (which focuses on structure), this skill
 * focuses entirely on UI design decisions: pattern selection,
 * slot composition, layout nesting, and domain-aware styling.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import { getRenderUIDesignGuide } from '../prompts/skill-sections/pattern-design-guide.js';
import { getSExprQuickRef } from '../prompts/type-references.js';
import {
  getCommonErrorsSection,
} from '../prompts/skill-sections/common-errors.js';

// ============================================================================
// Design Skill Content
// ============================================================================

/**
 * Get the transition context guide.
 * Teaches the LLM how to interpret the transition context it receives.
 */
function getTransitionContextGuide(): string {
  return `## Transition Context

You receive a single transition to design. Use these inputs to make UI decisions:

### Input Fields
| Field | What It Tells You |
|-------|-------------------|
| \`from\` | Current state (e.g., "Browsing", "Creating") |
| \`to\` | Target state (e.g., "Browsing", "Viewing") |
| \`event\` | What the user did (e.g., "INIT", "CREATE", "VIEW") |
| \`currentSlot\` | Which slot to render into (\`main\`, \`modal\`, \`drawer\`) |
| \`entity\` | Entity name + fields (drives column/field selection) |
| \`designHints\` | Style + UX hints from decomposition |
| \`domainContext\` | Category + vocabulary (drives pattern choice) |
| \`existingEffects\` | Current render-ui effects (if enhancing) |

### Decision Flow

\`\`\`
1. What EVENT is this?
   ├─ INIT → Compose full page layout (header + content + data)
   ├─ CREATE/EDIT → Form in modal or drawer
   ├─ VIEW → Detail in drawer or inline
   ├─ DELETE → Confirmation in overlay
   └─ SAVE/CANCEL → Clear slot (return null)

2. What SLOT?
   ├─ main → Compose multiple patterns (stack them)
   ├─ modal → Single form or confirmation
   ├─ drawer → Detail view or quick edit form
   └─ overlay → Confirmation dialog

3. What DOMAIN?
   ├─ business → entity-table + stats + filter-group
   ├─ dashboard → dashboard-grid + chart + stats
   ├─ e-commerce → entity-cards + stats (revenue)
   ├─ content → entity-cards + tabs + media
   └─ workflow → timeline + progress-bar

4. What ENTITY FIELDS suggest?
   ├─ enum fields → filter-group, badge columns
   ├─ date fields → timeline, date columns
   ├─ number fields → stats, chart, meter
   ├─ relation fields → tabs for related collections
   └─ image/url fields → entity-cards (visual)
\`\`\``;
}

/**
 * Get layout composition patterns.
 * Detailed guidance on nesting patterns with stack/box/grid.
 */
function getLayoutCompositionGuide(): string {
  return `## Layout Composition

Use layout patterns to create structured, visually rich views.

### Stack (VStack / HStack)
\`{ "type": "stack", "direction": "vertical"|"horizontal", "gap": "sm"|"md"|"lg", "children": [...] }\`

### Box (Styled Container)
\`{ "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md", "children": [...] }\`

### Grid (Multi-Column)
\`{ "type": "grid", "cols": 3, "gap": "md", "children": [...] }\`

### Composition Patterns

**Page Layout** — VStack wrapping all content:
\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    { "type": "page-header", "title": "...", "actions": [...] },
    { "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
      "children": [
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "stats", "metrics": [...] }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "stats", "metrics": [...] }] }
      ]
    },
    { "type": "entity-table", "entity": "...", "columns": [...], "searchable": true }
  ]
}]
\`\`\`

**Dashboard Layout** — Grid of cards:
\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    { "type": "page-header", "title": "Dashboard" },
    { "type": "grid", "cols": { "sm": 1, "md": 2, "lg": 3 }, "gap": "md",
      "children": [
        { "type": "box", "padding": "lg", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "stats", "metrics": [...] }] },
        { "type": "box", "padding": "lg", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "chart", "chartType": "line", "data": [...] }] },
        { "type": "box", "padding": "lg", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "entity-cards", "entity": "...", "columns": 1 }] }
      ]
    }
  ]
}]
\`\`\`

**Detail Drawer** — Stacked sections:
\`\`\`json
["render-ui", "drawer", {
  "type": "stack", "direction": "vertical", "gap": "md",
  "children": [
    { "type": "entity-detail", "entity": "...", "actions": [{ "label": "Edit", "event": "EDIT" }] },
    { "type": "tabs", "tabs": [
      { "label": "Related Items", "content": { "type": "entity-table", "entity": "..." } },
      { "label": "Activity", "content": { "type": "timeline", "items": [...] } }
    ]}
  ]
}]
\`\`\`

### When to Use Layout vs Flat
- **Flat** (multiple render-ui calls): Simple pages, 2-3 patterns stacked vertically
- **Nested** (single render-ui with layout): Complex pages, side-by-side elements, cards with backgrounds, dashboard grids`;
}

/**
 * Get the output format specification.
 * Defines what the design tool returns.
 */
function getOutputFormatSection(): string {
  return `## Output Format

Return ONLY a JSON array of render-ui effect tuples. No explanation, no markdown.

### Simple (multiple flat effects):
\`\`\`json
[
  ["render-ui", "main", { "type": "page-header", "title": "...", "actions": [...] }],
  ["render-ui", "main", { "type": "stats", "entity": "...", "metrics": [...] }],
  ["render-ui", "main", { "type": "entity-table", "entity": "...", "columns": [...] }]
]
\`\`\`

### Composed (single effect with layout nesting):
\`\`\`json
[
  ["render-ui", "main", { "type": "stack", "direction": "vertical", "gap": "lg", "children": [...] }]
]
\`\`\`

### Clear slot:
\`\`\`json
[
  ["render-ui", "modal", null]
]
\`\`\`

### Rules
1. Return valid JSON array — nothing else
2. Every effect must be \`["render-ui", slot, config]\`
3. Use entity fields from the input for columns, form fields, stats
4. Match domain vocabulary for labels (e.g., "Place Order" not "Create")
5. Include \`itemActions\` on tables/cards with appropriate events
6. Use \`searchable: true\` on tables for business domains
7. For INIT transitions, ALWAYS compose multiple patterns (never just a table)
8. For CREATE/EDIT, always include \`submitEvent\` and \`cancelEvent\` on form-section`;
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate the kflow-design skill.
 *
 * Produces a focused ~10K skill for render-ui authoring.
 * Used by the design_transition tool to produce rich UI effects.
 */
export function generateKflowDesignSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'kflow-design',
    description: 'Design rich render-ui effects for orbital schema transitions. Focused on pattern selection, layout composition, and domain-aware UI authoring.',
    allowedTools: ['Read', 'Write', 'Edit'],
    version: '1.0.0',
  };

  const content = `# Render-UI Design Skill

> Design rich, polished render-ui effects for orbital schema transitions.

You are a UI design specialist for KFlow orbital schemas. Your job is to take a
transition context (state, event, entity, domain) and produce the best possible
render-ui effects using the full pattern catalog.

**Your goal**: Every transition should produce UI that is visually rich, functionally
complete, and domain-appropriate. Never default to just "entity-table" — compose
layouts with headers, stats, filters, and appropriate patterns.

---

${getTransitionContextGuide()}

---

${getRenderUIDesignGuide()}

---

${getLayoutCompositionGuide()}

---

${getSExprQuickRef()}

---

${getCommonErrorsSection('top6')}

---

${getOutputFormatSection()}
`;

  return {
    name: 'kflow-design',
    frontmatter,
    content,
  };
}

/**
 * Get design skill metadata.
 */
export function getDesignSkillMetadata() {
  return {
    name: 'kflow-design',
    description: 'Design rich render-ui effects for orbital schema transitions',
    version: '1.0.0',
  };
}

/**
 * Get design skill stats for comparison.
 */
export function getDesignSkillStats(): { lines: number; chars: number } {
  const skill = generateKflowDesignSkill();
  return {
    lines: skill.content.split('\n').length,
    chars: skill.content.length,
  };
}
