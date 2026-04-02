/**
 * Orb Skill Generator
 *
 * Generates the "orb" skill for .orb program generation.
 * This skill restricts the LLM to atoms and molecules only (no organisms).
 *
 * The 104 standard behaviors demonstrate that atoms + molecules cover every
 * domain (CRUD, dashboards, finance, healthcare, IoT, games, social, education).
 * Organisms are rigid and don't compose well. Molecules compose freely.
 *
 * Used by the Masar pipeline and builder agents for schema generation.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
    getArchitectureSection,
    getCommonErrorsSection,
    getDecompositionCompact,
    getConnectivityCompact,
    getBannedProps,
    getFlowPatternSection,
    getPortableOrbitalOutputSection,
    getContextUsageCompact,
} from '../prompts/skill-sections/index.js';
import {
    getSExprQuickRef,
} from '../orbitals-skills-generators/helpers.js';
import { getBindingsGuide } from '../prompts/skill-sections/bindings-guide.js';

/**
 * Generate the "orb" skill.
 *
 * Molecule-first pattern vocabulary derived from 104 standard behaviors.
 * No organisms. Atoms and molecules compose to build any UI.
 */
export function generateOrbSkill(): GeneratedSkill {
    const frontmatter = {
        name: 'orb',
        description: 'Generate .orb programs using molecule-first composition. Atoms + molecules only, no organisms.',
        allowedTools: ['Read', 'Write', 'Edit', 'generate_orbital', 'generate_schema_orchestrated', 'finish_task', 'query_schema_structure', 'extract_chunk', 'apply_chunk'],
        version: '1.0.0',
    };

    const content = generateOrbSkillContent();

    return {
        name: 'orb',
        frontmatter,
        content,
    };
}

/**
 * Generate the coordinator skill for the main agent.
 *
 * Slim prompt: only architecture, decomposition, flow patterns, connectivity.
 * No pattern vocabulary, composition rules, bindings, or error catalogs.
 * Those belong in the subagent (generate_orbital).
 */
export function generateOrbCoordinatorSkill(): GeneratedSkill {
    const frontmatter = {
        name: 'orb-coordinator',
        description: 'Coordinate .orb generation: decompose, dispatch to subagents, manage quality loop.',
        allowedTools: ['scaffold', 'generate_orbital', 'combine_and_write', 'validate', 'compile', 'verify', 'jepa_predict', 'jepa_gap', 'jepa_plan', 'jepa_repair', 'read_file', 'edit_file', 'write_file'],
        version: '1.0.0',
    };

    const content = `# Orb Coordinator

> Decompose requirements into orbitals, dispatch generation to subagents, manage the quality loop.
> You do NOT write .orb code directly. You coordinate.

${getArchitectureSection()}

---

${getFlowPatternSection()}

---

${getDecompositionCompact()}

---

${getConnectivityCompact()}
`;

    return { name: 'orb-coordinator', frontmatter, content };
}

function generateOrbSkillContent(): string {
    return `# Orb Generation Skill (Molecule-First)

> Generate .orb programs using Orbital Units: Entity x Traits x Patterns
> Pattern vocabulary: atoms + molecules only. No organisms.

${getArchitectureSection()}

---

${getSExprQuickRef()}

---

${getMoleculeFirstDesignGuide()}

---

${getBannedProps()}

---

${getFlowPatternSection()}

---

${getDecompositionCompact()}

---

${getPortableOrbitalOutputSection()}

---

${getConnectivityCompact()}

---

${getContextUsageCompact()}

---

${getCommonErrorsSection('top6')}

${getCriticalOutputRequirements()}

${getTrimmedExample()}
`;
}

/**
 * Molecule-first design guide. Replaces the organism-based pattern-design-guide.
 * All patterns listed here are used in the 104 standard behaviors.
 */
function getMoleculeFirstDesignGuide(): string {
    return `## Render-UI Molecule-First Design Guide

### The Five Rules of Composition (MANDATORY)

| Rule | Requirement |
|------|-------------|
| **1** | **Single Render-UI** per transition |
| **2** | **Two Levels**: Atoms (2+) + Molecules (1+) |
| **3** | **Layout Wrapper**: Root must be \`stack\`, \`card\`, \`box\`, or \`simple-grid\` |
| **4** | **Theme Variables**: ALL visual props use CSS vars |
| **5** | **Composable**: Build from small pieces, never use rigid organisms |

---

### Pattern Vocabulary

These are the ONLY patterns you may use. They are derived from 104 production behaviors across 18 domains.

#### Atoms (Basic UI Elements)

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`typography\` | All text content | \`variant\` (h1-h6, body, caption), \`text\`, \`color\` |
| \`button\` | User actions | \`label\`, \`event\`, \`variant\` (primary, secondary, ghost, destructive) |
| \`icon\` | Lucide icons | \`name\`, \`size\`, \`color\` |
| \`badge\` | Status indicators | \`text\`, \`variant\` (primary, success, warning, error) |
| \`divider\` | Visual separation | \`orientation\` |
| \`avatar\` | User/entity images | \`src\`, \`name\`, \`size\` |
| \`progress-bar\` | Progress indicators | \`value\`, \`max\`, \`label\` |
| \`status-dot\` | Status indicator dots | \`status\`, \`label\` |
| \`star-rating\` | Rating display | \`value\`, \`max\` |

#### Layout Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`stack\` | Flex layout (V/H) | \`direction\` (vertical/horizontal), \`gap\`, \`align\`, \`justify\`, \`wrap\` |
| \`card\` | Content grouping | \`padding\`, \`border\`, \`rounded\`, \`shadow\`, \`children\` |
| \`box\` | Visual container | \`padding\`, \`bg\`, \`border\`, \`rounded\`, \`shadow\`, \`children\` |
| \`simple-grid\` | Grid layout | \`cols\`, \`gap\`, \`children\` |

#### Data Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`data-grid\` | Tabular data display | \`entity\`, \`fields\`, \`itemActions\`, \`cols\`, \`gap\` |
| \`data-list\` | Vertical list display | \`entity\`, \`fields\`, \`itemActions\` |
| \`form-section\` | Form input groups | \`entity\`, \`fields\`, \`submitEvent\`, \`cancelEvent\` |
| \`search-input\` | Search fields | \`placeholder\`, \`event\` |
| \`filter-group\` | Filter controls | \`filters\`, \`event\` |
| \`tabs\` | Tabbed content | \`tabs\`, \`activeTab\` |

#### Metric/Chart Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`stat-display\` | Single KPI display | \`label\`, \`value\`, \`icon\` |
| \`stat-badge\` | Stat with badge | \`label\`, \`value\`, \`variant\` |
| \`meter\` | Metric gauge | \`value\`, \`max\`, \`label\` |
| \`trend-indicator\` | Trend up/down | \`value\`, \`direction\` |
| \`score-display\` | Score/count | \`value\`, \`label\` |

#### State Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`empty-state\` | No data fallback | \`title\`, \`description\`, \`icon\` |
| \`loading-state\` | Loading spinner | \`message\` |

#### Form Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`textarea\` | Multi-line input | \`placeholder\`, \`rows\` |
| \`range-slider\` | Range input | \`min\`, \`max\`, \`step\`, \`value\` |
| \`upload-drop-zone\` | File upload | \`accept\`, \`maxSize\` |
| \`calendar-grid\` | Date picker grid | \`selectedDate\`, \`event\` |

#### Navigation Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`wizard-progress\` | Multi-step progress | \`steps\`, \`currentStep\` |
| \`wizard-navigation\` | Step navigation | \`steps\`, \`currentStep\` |
| \`action-buttons\` | Action button group | \`actions\` |

#### Specialty Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`lightbox\` | Image/media viewer | \`src\`, \`alt\` |
| \`map-view\` | Map display | \`center\`, \`zoom\`, \`markers\` |
| \`health-bar\` | Health/HP bar | \`value\`, \`max\` |
| \`d-pad\` | Directional pad | \`events\` |
| \`combat-log\` | Event log | \`entries\` |
| \`dialogue-box\` | Dialogue/chat | \`speaker\`, \`text\` |

#### Game Canvas Molecules

| Pattern | Purpose | Key Props |
|---------|---------|-----------|
| \`isometric-canvas\` | 3D isometric canvas | \`tiles\`, \`units\` |
| \`platformer-canvas\` | 2D platformer | \`entities\`, \`viewport\` |
| \`simulation-canvas\` | Simulation display | \`entities\`, \`viewport\` |
| \`canvas-effect\` | Canvas visual effects | \`effect\`, \`duration\` |
| \`game-hud\` | Game HUD overlay | \`stats\`, \`actions\` |
| \`game-menu\` | Game menu | \`items\` |
| \`game-over-screen\` | End screen | \`score\`, \`message\` |
| \`inventory-panel\` | Inventory display | \`items\`, \`slots\` |

---

### BANNED Patterns (NEVER USE)

These organism-level patterns are deprecated. Use the molecule equivalents:

| Banned Pattern | Use Instead |
|---------------|-------------|
| \`entity-table\` | \`data-grid\` with \`entity\`, \`fields\`, \`itemActions\` |
| \`entity-list\` | \`data-list\` with \`entity\`, \`fields\`, \`itemActions\` |
| \`entity-cards\` | \`data-grid\` with \`cols: 3\`, or compose with \`card\` children in a \`simple-grid\` |
| \`page-header\` | Compose with \`stack\` (horizontal) + \`typography\` (h1) + \`button\` |
| \`detail-panel\` | Compose with \`stack\` (vertical) + \`typography\` + \`badge\` + \`divider\` |
| \`timeline\` | Compose with \`data-list\` or \`stack\` + timestamp items |
| \`crud-template\` | Compose from \`data-grid\` + \`form-section\` + layout molecules |
| \`list-template\` | Compose from \`data-list\` + \`search-input\` + layout molecules |
| \`detail-template\` | Compose from \`stack\` + \`typography\` + \`badge\` + \`button\` |

---

### Layout-First Structure (Rule 3)

Root element MUST be a layout molecule:

\`\`\`json
{ "type": "stack", "direction": "vertical", "gap": "lg", "children": [...] }
{ "type": "stack", "direction": "horizontal", "gap": "md", "children": [...] }
{ "type": "box", "padding": "lg", "bg": "var(--color-card)", "children": [...] }
{ "type": "simple-grid", "cols": 3, "gap": "md", "children": [...] }
\`\`\`

#### Layout Props Reference

**Stack (VStack/HStack)**
\`\`\`json
{
  "type": "stack",
  "direction": "vertical" | "horizontal",
  "gap": "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl",
  "align": "start" | "center" | "end" | "stretch",
  "justify": "start" | "center" | "end" | "between" | "around",
  "wrap": true | false
}
\`\`\`

**Box**
\`\`\`json
{
  "type": "box",
  "padding": "none" | "xs" | "sm" | "md" | "lg" | "xl",
  "bg": "var(--color-card)" | "var(--color-muted)" | "var(--color-primary)",
  "border": true | false,
  "rounded": "var(--radius-md)" | "var(--radius-lg)",
  "shadow": "var(--shadow-sm)" | "var(--shadow-md)"
}
\`\`\`

---

### Composition Pattern: Header Row

Instead of \`page-header\`, compose with atoms:

\`\`\`json
{
  "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
  "children": [
    { "type": "typography", "variant": "h1", "text": "Tasks" },
    { "type": "button", "label": "New Task", "event": "CREATE", "variant": "primary", "icon": "plus" }
  ]
}
\`\`\`

### Composition Pattern: Stat Cards

\`\`\`json
{
  "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
  "children": [
    { "type": "stat-display", "label": "Total", "value": "@entity.count", "icon": "list" },
    { "type": "stat-display", "label": "Active", "value": "@entity.activeCount", "icon": "activity" },
    { "type": "stat-display", "label": "Done", "value": "@entity.doneCount", "icon": "check-circle" }
  ]
}
\`\`\`

### Composition Pattern: Data View with Actions

\`\`\`json
{
  "type": "data-grid", "entity": "Task", "fields": ["title", "status", "priority"],
  "itemActions": [
    { "event": "VIEW", "label": "View" },
    { "event": "EDIT", "label": "Edit" },
    { "event": "DELETE", "label": "Delete" }
  ]
}
\`\`\`

---

### Critical Validation Rules

| Element | Correct Format | Wrong Format | Error |
|---------|----------------|--------------|-------|
| **Events** | \`{ "key": "INIT", "name": "Init" }\` | \`"INIT"\` | ORB_T_EVT_INVALID_FORMAT |
| **Emits** | \`[{ "event": "INIT", "scope": "internal" }]\` | \`["INIT"]\` | ORB_T_UNDEFINED_TRAIT |
| **Payload events** | \`{ "key": "SAVE", "payload": [...] }\` | No payload | ORB_BINDING_PAYLOAD_FIELD_UNDECLARED |
| **Page traits** | \`{ "ref": "TraitName" }\` | With linkedEntity | ORB_P_INVALID_TRAIT_REF |
| **Category** | \`"category": "interaction"\` | Missing | ORB_T_MISSING_CATEGORY |
| **Page traits array** | \`"traits": [{ "ref": "TraitName" }]\` | Missing traits | Page renders blank |
| **Entity names** | \`"Task"\`, \`"CartItem"\` | \`"Form"\`, \`"Button"\`, \`"Card"\` | Name collision with UI component |

### Effect Operators (Use ONLY These)

| Operator | Purpose | Example |
|----------|---------|---------|
| \`set\` | Set entity field | \`["set", "@entity.status", "active"]\` |
| \`fetch\` | Load entity data | \`["fetch", "Task"]\` |
| \`persist\` | Create/update/delete | \`["persist", "create", "Task", "@payload.data"]\` |
| \`notify\` | Show notification | \`["notify", "Saved!", "success"]\` |

**BANNED**: \`call-service\` (external integrations only), \`emit\` (handled separately), \`log\`, \`navigate\`

### Binding Rules for Prop Values

- Each prop value can have at most ONE binding: \`"value": "@entity.price"\`
- NEVER concatenate bindings: \`"@entity.price @entity.currency"\` is INVALID
- NEVER use inline expressions: \`"@entity.quantity <= 0"\` is INVALID
- For conditional logic, use guards on transitions, not prop expressions

---

### Composition Quality Checklist

Before calling \`finish_task\`, verify:

\`\`\`
[] Single render-ui per transition
[] Root element is layout (stack/box/simple-grid)
[] Contains 2+ atoms (typography, badge, button, icon)
[] Contains 1+ data molecules (data-grid, data-list, form-section, stats)
[] NO organism patterns (entity-table, entity-list, page-header, etc.)
[] Uses theme variables for ALL visual properties
[] Matches production quality from standard behaviors
[] Passes orbital validate with zero errors and zero warnings
\`\`\`

---

### BANNED Patterns (Additional)

| Wrong | Correct |
|-------|---------|
| Multiple flat render-ui calls | Single composed render-ui |
| Root organism without layout | Layout wrapper required |
| Hex colors | Theme CSS variables |
| Pixel values | Theme spacing variables |
| Events as strings \`"INIT"\` | Event objects \`{ "key": "INIT" }\` |
| Emits as strings \`["INIT"]\` | Emit objects \`[{ "event": "INIT" }]\` |
| \`onSubmit\` / \`onCancel\` | \`submitEvent\` / \`cancelEvent\` |
| \`headerActions\` | \`actions\` |
| \`entity-table\` | \`data-grid\` |
| \`entity-list\` | \`data-list\` |
| \`page-header\` | \`stack\` + \`typography\` + \`button\` |

---

${getBindingsGuide()}
`;
}

function getToolWorkflowSection(): string {
    return `---

## Tool Workflow

### Phase 1: DECOMPOSE
Break requirements into OrbitalUnits (pure reasoning, no tools).

### Phase 2: GENERATE

**Option A: Orchestrated Generation (RECOMMENDED for 3+ orbitals)**
Use \`generate_schema_orchestrated\` for automatic complexity-based routing:

\`\`\`
generate_schema_orchestrated({ prompt: "Full app description with all entities and features" })
\`\`\`

**Option B: Per-Orbital Generation (for simple cases or fine-grained control)**
Call \`generate_orbital\` for each orbital:

\`\`\`
generate_orbital({ orbital: {...}, orbitalIndex: 0, totalOrbitals: N })
\`\`\`

### Phase 3: COMBINE
Call \`finish_task\` to auto-combine orbitals into schema.orb:

\`\`\`
finish_task({ appName: "App" })
\`\`\`

### Phase 4: VALIDATE (CRITICAL)
After combining, validate the schema:

\`\`\`
validate_schema()
\`\`\`

### Phase 5: VERIFY COMPOSITION QUALITY

Before calling \`finish_task\`, verify each INIT transition:

1. **Uses a single \`render-ui\` call** with top-level \`stack\` and \`children\`
2. **Has 3+ composed sections**: header (HStack: title + action), metrics (stat-display/stats), data (data-grid/data-list)
3. **Uses domain-appropriate atoms**: \`badge\` for status, \`typography\` for labels/values, \`button\` for actions
4. **NO organisms**: Never \`entity-table\`, \`entity-list\`, \`page-header\`, \`detail-panel\`
5. **Props are correct**: \`submitEvent\` not \`onSubmit\`, \`fields\` not \`fieldNames\`
`;
}

function getCriticalOutputRequirements(): string {
    return `---

## CRITICAL: Output Requirements

Every orbital MUST include:

### 1. domainContext (REQUIRED)
\`\`\`json
"domainContext": {
  "request": "<original user request>",
  "requestFragment": "<what part produced THIS orbital>",
  "category": "business",
  "vocabulary": { "item": "Task", "create": "Add", "delete": "Remove" }
}
\`\`\`

### 2. design (REQUIRED)
\`\`\`json
"design": {
  "style": "modern",
  "uxHints": {
    "flowPattern": "crud-cycle",
    "listPattern": "data-grid",
    "formPattern": "modal"
  }
}
\`\`\`

### 3. Business Rule Guards on SAVE (when rules exist)
If the user specifies validation constraints, add S-expression guards:
\`\`\`json
{
  "from": "Creating", "to": "Browsing", "event": "SAVE",
  "guard": ["<=", "@payload.data.score", 100],
  "effects": [["persist", "create", "Entry", "@payload.data"], ...]
}
\`\`\`

### 4. ONE Orbital Per Entity

### 5. Entity Field is REQUIRED (CRITICAL)
Every orbital MUST have an entity field. No exceptions.`;
}

function getTrimmedExample(): string {
    return `---

## Example: INIT Transition (Molecule-First Composition)

The INIT transition is the most important: it defines the main view. This shows the correct composition pattern.

\`\`\`json
{
  "from": "Browsing", "to": "Browsing", "event": "INIT",
  "effects": [
    ["fetch", "Task"],
    ["render-ui", "main", {
      "type": "stack", "direction": "vertical", "gap": "lg",
      "children": [
        {
          "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
          "children": [
            { "type": "typography", "variant": "h1", "text": "Task Management" },
            { "type": "button", "label": "New Task", "event": "CREATE", "variant": "primary", "icon": "plus" }
          ]
        },
        {
          "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
          "children": [
            { "type": "stat-display", "label": "Total", "value": "@entity.count", "icon": "list" },
            { "type": "stat-display", "label": "Active", "value": "@entity.activeCount", "icon": "clock" }
          ]
        },
        {
          "type": "data-grid", "entity": "Task",
          "fields": ["title", "status", "priority"],
          "itemActions": [
            { "event": "VIEW", "label": "View" },
            { "event": "EDIT", "label": "Edit" },
            { "event": "DELETE", "label": "Delete" }
          ]
        }
      ]
    }]
  ]
}
\`\`\`

**Other key transitions** (brief):
- **CREATE -> modal**: \`["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": [...], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]\`
- **SAVE -> close modal**: \`["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["fetch", "Task"]\`
- **VIEW -> modal detail**: compose with \`stack\` + \`typography\` + \`badge\` + \`divider\` + \`button\` (NOT \`detail-panel\`)
- **CANCEL/CLOSE**: \`["render-ui", "modal", null]\`
- **DELETE**: \`["persist", "delete", "Task", "@payload.id"], ["fetch", "Task"]\`

**Key rules**: header = \`stack\` + \`typography\` + \`button\` (NOT \`page-header\`). Data = \`data-grid\` (NOT \`entity-table\`). Forms = \`form-section\` with \`submitEvent\`/\`cancelEvent\`.
`;
}
