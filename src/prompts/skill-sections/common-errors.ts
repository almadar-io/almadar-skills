/**
 * Common Errors Section
 *
 * Critical mistakes to avoid during orbital generation.
 * Keep this focused on the most frequent errors only.
 *
 * @packageDocumentation
 */

import { PATTERN_TYPES } from "@almadar/core/types";
import { ViewTypeSchema } from "@almadar/core/types";
import {
  getPatternPropsCompact,
  getPatternActionsRef,
} from "@almadar/patterns";

/**
 * Generate pattern categories from PATTERN_TYPES.
 */
function getPatternCategories(): string {
  const categories: Record<string, string[]> = {
    Header: PATTERN_TYPES.filter(
      (p: any) => p.includes("header") || p === "title-only",
    ),
    Display: PATTERN_TYPES.filter(
      (p: any) => p.startsWith("entity-") || p === "stats",
    ),
    Form: PATTERN_TYPES.filter((p) => p.startsWith("form-")),
    Filter: PATTERN_TYPES.filter(
      (p) => p.includes("search") || p.includes("filter"),
    ),
    State: PATTERN_TYPES.filter((p) => p.includes("-state")),
    Navigation: PATTERN_TYPES.filter((p) => ["tabs", "breadcrumb"].includes(p)),
    Layout: PATTERN_TYPES.filter(
      (p) =>
        p.includes("layout") || p.includes("grid") || p === "master-detail",
    ),
    Interaction: PATTERN_TYPES.filter((p: any) => p === "confirmation" || (typeof p === 'string' && p.includes("confirmation"))),
    Game: PATTERN_TYPES.filter(
      (p) =>
        p.startsWith("game-") ||
        [
          "tilemap-renderer",
          "inventory-panel",
          "dialogue-box",
          "level-select",
        ].includes(p),
    ),
  };

  let table = "| Category | Valid Patterns |\n|----------|----------------|\n";
  for (const [cat, patterns] of Object.entries(categories)) {
    if (patterns.length > 0) {
      table += `| ${cat} | ${patterns.map((p) => `\`${p}\``).join(", ")} |\n`;
    }
  }
  return table;
}

/**
 * Get valid viewTypes from schema.
 */
function getValidViewTypes(): string {
  const validTypes = ViewTypeSchema.options;
  return validTypes.map((t) => `\`${t}\``).join(", ");
}

/**
 * Get common errors section.
 * Supports tiered output: 'top6' for generation skill, 'full' for fixing skill.
 */
export function getCommonErrorsSection(level: 'top6' | 'full' = 'full'): string {
  const critical = getCriticalErrors();
  if (level === 'top6') return critical;
  return critical + getEdgeCaseErrors();
}

/**
 * Top 6 critical errors — the mistakes the LLM actually makes repeatedly.
 * ~4,100 chars. Used by the generation skill.
 */
function getCriticalErrors(): string {
  return `## Critical Rules

### 1. INIT Transition Required (CRITICAL)

Every trait MUST have an INIT self-loop transition. The runtime fires \`INIT\` when page loads.
The INIT render-ui MUST be a **single composed stack**, not flat calls:

\`\`\`json
{
  "from": "Browsing",
  "to": "Browsing",
  "event": "INIT",
  "effects": [
    ["render-ui", "main", {
      "type": "stack", "direction": "vertical", "gap": "lg",
      "children": [
        { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
          "children": [
            { "type": "typography", "variant": "h1", "text": "Title" },
            { "type": "button", "label": "Create", "event": "CREATE", "variant": "primary" }
          ]
        },
        { "type": "entity-table", "entity": "EntityName", "columns": ["..."], "searchable": true,
          "itemActions": [{ "label": "View", "event": "VIEW" }] }
      ]
    }]
  ]
}
\`\`\`

Without INIT: Page loads blank, nothing renders, no UI appears.

### 2. NEVER Use @payload in set Effects

The \`set\` effect modifies entity state. **@payload is READ-ONLY**.

\`\`\`json
// WRONG
["set", "@payload.data.status", "active"]

// CORRECT
["set", "@entity.status", "active"]
\`\`\`

**Rule:** \`set\` target MUST start with \`@entity\`, never \`@payload\`.

### 3. Valid Patterns ONLY

**DO NOT invent custom patterns!** Only these patterns exist:

${getPatternCategories()}

**NEVER use**: \`onboarding-welcome\`, \`category-selector\`, \`assessment-question\`, etc.

Valid viewType values: ${getValidViewTypes()}

### 4. Page Structure Required

Every page MUST have \`path\` and \`traits\` properties:

\`\`\`json
{
  "pages": [{
    "name": "TasksPage",
    "path": "/tasks",
    "traits": [{ "ref": "TaskManagement" }]
  }]
}
\`\`\`

Without \`path\`: Validation error \`ORB_P_MISSING_PATH\`
Without \`traits\`: Validation error \`ORB_P_MISSING_TRAITS\`

### 5. Valid Field Types ONLY

Field types MUST be one of: \`string\`, \`number\`, \`boolean\`, \`date\`, \`timestamp\`, \`datetime\`, \`array\`, \`object\`, \`enum\`, \`relation\`

\`\`\`json
// WRONG - using entity name as type:
{ "name": "author", "type": "User" }

// CORRECT - use relation type:
{ "name": "author", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } }
\`\`\`

### 6. Modal/Drawer Exit Transitions (CRITICAL — MOST COMMON ERROR)

**EVERY state that renders to \`"modal"\` or \`"drawer"\` MUST have CANCEL and CLOSE transitions.**
Without these, the validator rejects the schema with \`CIRCUIT_NO_OVERLAY_EXIT\`.

\`\`\`json
// Opening the modal: Browsing → Creating
{ "from": "Browsing", "to": "Creating", "event": "CREATE",
  "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]] },

// REQUIRED: CANCEL exit (form cancel button)
{ "from": "Creating", "to": "Browsing", "event": "CANCEL",
  "effects": [["render-ui", "modal", null]] },

// REQUIRED: CLOSE exit (click outside / press Escape)
{ "from": "Creating", "to": "Browsing", "event": "CLOSE",
  "effects": [["render-ui", "modal", null]] },

// SAVE also dismisses modal
{ "from": "Creating", "to": "Browsing", "event": "SAVE",
  "effects": [["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]] }
\`\`\`

**Checklist for EVERY modal/drawer state:**
- [ ] Has \`CANCEL\` transition → previous state with \`["render-ui", "modal", null]\`
- [ ] Has \`CLOSE\` transition → previous state with \`["render-ui", "modal", null]\`
- [ ] Has \`SAVE\` (or other action) transition that also dismisses with \`["render-ui", "modal", null]\`

**This applies to ALL states**: Creating, Editing, Viewing, Deleting — any state that renders to modal/drawer.
`;
}

/**
 * Edge case errors 7-16 — less frequent, validator catches most of these.
 * ~4,000 chars. Used by the fixing skill.
 */
function getEdgeCaseErrors(): string {
  return `
---

## Additional Errors (Edge Cases)

### 7. Over-Generating Pages
\`\`\`
WRONG: TaskListPage, TaskCreatePage, TaskEditPage, TaskViewPage (4 pages!)
CORRECT: TasksPage with EntityManagement trait (1 page)
\`\`\`

### 8. Duplicate Slot Rendering
\`\`\`
WRONG: Two traits both render to "main" on page load
CORRECT: ONE trait owns each slot
\`\`\`

### 9. Missing submitEvent / Wrong Action Pattern in form-section
\`\`\`
WRONG: { "type": "form-section", "entity": "Task" }
ALSO WRONG: { "type": "form-section", "entity": "Task", "onSubmit": "SAVE" }
ALSO WRONG: { "type": "form-section", "actions": [{"label": "Save", "event": "SAVE"}] }
CORRECT: { "type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL" }
\`\`\`
**form-section does NOT use \`actions\` array** — it uses \`submitEvent\` and \`cancelEvent\` strings.
The \`actions\` prop is for \`page-header\`, \`entity-detail\`, NOT for forms.

### 10. Duplicate Transitions (Same from+event)
\`\`\`
WRONG: Two transitions with same "from" and "event" without guards
CORRECT: Use GUARDS to differentiate transitions
\`\`\`

### 11. Using "render" Instead of "render-ui"
\`\`\`
WRONG: ["render", "main", {...}]
CORRECT: ["render-ui", "main", {...}]
\`\`\`

### 12. Generating Sections Array (Legacy)
\`\`\`
WRONG: { "pages": [{ "sections": [...] }] }
CORRECT: { "pages": [{ "traits": [...] }] } - UI comes from render-ui effects
\`\`\`

### 13. Using form-actions Pattern (DOES NOT EXIST!)
\`\`\`
WRONG: ["render-ui", "main", { "type": "form-actions", "actions": [...] }]
CORRECT: Use form-section with submitEvent/cancelEvent props
\`\`\`
Actions are INSIDE patterns, not separate patterns.

### 14. Forgetting itemActions in entity-table
\`\`\`
WRONG: { "type": "entity-table", "entity": "Task" }
CORRECT: { "type": "entity-table", "entity": "Task", "itemActions": [{"label": "Edit", "event": "EDIT"}] }
\`\`\`

### 15. Duplicate Trait Names Across Orbitals
\`\`\`
WRONG: UserOrbital uses "EntityManagement", TaskOrbital uses "EntityManagement"
CORRECT: UserOrbital uses "UserManagement", TaskOrbital uses "TaskManagement"
\`\`\`
Each trait name MUST be unique. Pattern: \`{Entity}{Purpose}\`

### 16. Hallucinated itemAction Properties
\`\`\`
WRONG: { "label": "View", "event": "VIEW", "condition": "..." }
CORRECT: { "label": "View", "event": "VIEW" }
\`\`\`
Valid itemAction props: \`label\`, \`event\`, \`navigatesTo\`, \`placement\`, \`variant\`, \`showWhen\`

### 17. Event Listeners Structure
Event listeners go INSIDE traits, not at orbital level:
\`\`\`json
"traits": [{ "name": "TaskInteraction",
  "listens": [{ "event": "USER_UPDATED", "handler": "REFRESH_LIST" }] }]
\`\`\`

### 18. Wrong Filtering Pattern (Use Query Singleton)
Use a singleton entity for filter state + \`query\` prop on entity-table:
\`\`\`json
{ "name": "TaskQuery", "entity": { "name": "TaskQuery", "singleton": true, "runtime": true,
    "fields": [{ "name": "status", "type": "string" }, { "name": "search", "type": "string" }] } }
\`\`\`
Reference: \`["render-ui", "main", { "type": "entity-table", "entity": "Task", "query": "@TaskQuery" }]\`
`;
}

/**
 * Get validation error hints section.
 * Quick reference for common validation errors and fixes.
 */
export function getValidationHintsSection(): string {
  return `## Validation Error Quick Fixes

| Error | Fix |
|-------|-----|
| ORB_P_MISSING_PATH | Add \`path\` property starting with "/" to page (e.g., "/tasks") |
| ORB_P_MISSING_TRAITS | Add \`traits\` array to page with at least one trait ref |
| ORB_E_INVALID_FIELD_TYPE | Use valid type: string, number, boolean, date, enum, relation. NOT entity names! |
| ORB_INIT_MISSING | Add INIT self-loop transition with render-ui effects |
| ORB_FORM_SUBMIT | Add submitEvent and cancelEvent to form-section pattern |
| ORB_DUPE_TRANS | Add guards to differentiate same-event transitions |
| ORB_SLOT_CONTENTION | Merge traits or use different slots |
| ORB_DUPE_PAGE_TRAITS | Remove duplicate trait references from page |
| ORB_T_DUPLICATE_NAME | Use unique trait names per entity: UserManagement, TaskManagement |
| ORB_EFF_SET_REQUIRES_ENTITY | Change @payload.field to @entity.field in set effects |
| ORB_RUI_UNKNOWN_ITEM_ACTION_PROP | Remove invalid props (like \`condition\`), use \`showWhen\` |
| ORB_MODAL_NO_CLOSE | Add CLOSE/CANCEL transitions from modal states with \`["render-ui", "modal", null]\` |
`;
}
