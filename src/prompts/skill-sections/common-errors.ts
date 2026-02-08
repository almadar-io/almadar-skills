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
 * These are the most frequent mistakes made during generation.
 */
export function getCommonErrorsSection(): string {
  return `## Critical Rules

### NEVER Use @payload in set Effects (CRITICAL)

The \`set\` effect modifies entity state. **@payload is READ-ONLY** - it contains event data.

\`\`\`json
// WRONG - @payload is read-only!
["set", "@payload.data.createdAt", "@now"]
["set", "@payload.data.status", "active"]

// CORRECT - Use @entity to modify state
["set", "@entity.createdAt", "@now"]
["set", "@entity.status", "active"]
\`\`\`

**Rule:** \`set\` target MUST start with \`@entity\`, never \`@payload\`.

### INIT Transition Required (CRITICAL)

Every trait MUST have an INIT self-loop transition. The runtime fires \`INIT\` when page loads.

\`\`\`json
// REQUIRED in EVERY trait:
{
  "from": "Browsing",
  "to": "Browsing",
  "event": "INIT",  // ← Runtime fires this on page load
  "effects": [
    ["render-ui", "main", { "type": "page-header", ... }],
    ["render-ui", "main", { "type": "entity-table", ... }]
  ]
}
\`\`\`

Without INIT: Page loads blank, nothing renders, no UI appears.

### Valid Patterns ONLY (CRITICAL)

**DO NOT invent custom patterns!** Only these patterns exist:

${getPatternCategories()}

**NEVER use**: \`onboarding-welcome\`, \`category-selector\`, \`assessment-question\`, etc. - these DO NOT exist!

### Valid viewType Values

Pages must use valid viewType values: ${getValidViewTypes()}

Invalid values like \`form\`, \`wizard\`, \`onboarding\` will cause validation errors.

${getPatternPropsCompact()}

${getPatternActionsRef()}

### Page Structure Required (CRITICAL)

Every page MUST have \`path\` and \`traits\` properties:

\`\`\`json
// WRONG - missing path and traits:
{
  "pages": [{
    "name": "TasksPage",
    "entity": "Task"  // ❌ Missing path and traits!
  }]
}

// CORRECT - complete page definition:
{
  "pages": [{
    "name": "TasksPage",
    "path": "/tasks",           // ← REQUIRED: starts with /
    "traits": [{ "ref": "TaskManagement" }]  // ← REQUIRED: trait-driven UI
  }]
}
\`\`\`

Without \`path\`: Validation error \`ORB_P_MISSING_PATH\`
Without \`traits\`: Validation error \`ORB_P_MISSING_TRAITS\`

### Valid Field Types ONLY (CRITICAL)

Field types MUST be one of: \`string\`, \`number\`, \`boolean\`, \`date\`, \`timestamp\`, \`datetime\`, \`array\`, \`object\`, \`enum\`, \`relation\`

\`\`\`json
// WRONG - using entity name as type:
{ "name": "author", "type": "User" }           // ❌ "User" is not a valid type!
{ "name": "post", "type": "BlogPost" }         // ❌ Invalid!

// CORRECT - use relation type with entity reference:
{ "name": "author", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } }
{ "name": "post", "type": "relation", "relation": { "entity": "BlogPost", "cardinality": "one" } }

// CORRECT for arrays of primitives:
{ "name": "tags", "type": "array", "items": { "type": "string" } }

// CORRECT for enums:
{ "name": "status", "type": "enum", "values": ["pending", "active", "done"] }
\`\`\`

### Event Listeners Structure

Event listeners go INSIDE traits, not at orbital level:

\`\`\`json
// WRONG - at orbital level:
{
  "name": "Task Management",
  "listens": ["SOME_EVENT"]  // ❌ Wrong location, wrong format
}

// CORRECT - inside trait:
{
  "traits": [{
    "name": "TaskInteraction",
    "listens": [
      { "event": "USER_UPDATED", "handler": "REFRESH_LIST" }  // ✅ Object format
    ]
  }]
}
\`\`\`

---

## Common Errors (AVOID)

### 1. Missing INIT Transition
\`\`\`
WRONG: No INIT transition → Page loads blank
CORRECT: { "from": "browsing", "to": "browsing", "event": "INIT", "effects": [...render-ui...] }
\`\`\`

### 2. Over-Generating Pages
\`\`\`
WRONG: TaskListPage, TaskCreatePage, TaskEditPage, TaskViewPage (4 pages!)
CORRECT: TasksPage with EntityManagement trait (1 page)
\`\`\`

### 3. Duplicate Slot Rendering
\`\`\`
WRONG: Two traits both render to "main" on page load
CORRECT: ONE trait owns each slot
\`\`\`

### 4. Missing onSubmit in form-section
\`\`\`
WRONG: { "type": "form-section", "entity": "Task" }
CORRECT: { "type": "form-section", "entity": "Task", "onSubmit": "SAVE" }
\`\`\`

### 5. Duplicate Transitions (Same from+event)
\`\`\`
WRONG: Two transitions with same "from" and "event" without guards
CORRECT: Use GUARDS to differentiate transitions
\`\`\`

### 6. Using "render" Instead of "render-ui"
\`\`\`
WRONG: ["render", "main", {...}]
CORRECT: ["render-ui", "main", {...}]
\`\`\`

### 7. Generating Sections Array (Legacy)
\`\`\`
WRONG: { "pages": [{ "sections": [...] }] }
CORRECT: { "pages": [{ "traits": [...] }] } - UI comes from render-ui effects
\`\`\`

### 8. Using form-actions Pattern (DOES NOT EXIST!)
\`\`\`
WRONG: ["render-ui", "main", { "type": "form-actions", "actions": [...] }]
CORRECT: Use form-section with onSubmit/onCancel props:
         { "type": "form-section", "entity": "Task", "fields": [...], "onSubmit": "SAVE", "onCancel": "CANCEL" }
\`\`\`
Actions are INSIDE patterns, not separate patterns. The form-section pattern includes submit/cancel buttons.

### 9. Forgetting itemActions in entity-table
\`\`\`
WRONG: { "type": "entity-table", "entity": "Task" }  // No row actions
CORRECT: { "type": "entity-table", "entity": "Task", "itemActions": [{"label": "Edit", "event": "EDIT"}, {"label": "Delete", "event": "DELETE"}] }
\`\`\`

### 10. Duplicate Trait Names Across Orbitals
\`\`\`
WRONG: UserOrbital uses "EntityManagement", TaskOrbital uses "EntityManagement"
CORRECT: UserOrbital uses "UserManagement", TaskOrbital uses "TaskManagement"
\`\`\`
Each trait name MUST be unique. Pattern: \`{Entity}{Purpose}\`

### 11. Using @payload in set Effect
\`\`\`
WRONG: ["set", "@payload.acceptedAt", "@now"]  // @payload is read-only!
CORRECT: ["set", "@entity.acceptedAt", "@now"]  // set modifies entity state
\`\`\`
\`set\` effect MUST use \`@entity.field\` binding. \`@payload\` is read-only event data.

### 12. Hallucinated itemAction Properties
\`\`\`
WRONG: { "label": "View", "event": "VIEW", "condition": "@entity.status === 'active'" }
CORRECT: { "label": "View", "event": "VIEW", "showWhen": ["=", "@entity.status", "active"] }
\`\`\`
Valid itemAction props: \`label\`, \`event\`, \`navigatesTo\`, \`placement\`, \`variant\`, \`showWhen\`
Note: \`showWhen\` is defined but NOT yet implemented - actions always visible.

### 14. Missing Page Path
\`\`\`
WRONG: { "pages": [{ "name": "TasksPage", "entity": "Task" }] }
CORRECT: { "pages": [{ "name": "TasksPage", "path": "/tasks", "traits": [...] }] }
\`\`\`

### 15. Using Entity Name as Field Type
\`\`\`
WRONG: { "name": "author", "type": "User" }
CORRECT: { "name": "author", "type": "relation", "relation": { "entity": "User", "cardinality": "one" } }
\`\`\`

### 16. Missing Traits Array on Page
\`\`\`
WRONG: { "pages": [{ "name": "TasksPage", "path": "/tasks" }] }
CORRECT: { "pages": [{ "name": "TasksPage", "path": "/tasks", "traits": [{ "ref": "TaskManagement" }] }] }
\`\`\`

### 13. Modal State Machine Pattern (CRITICAL)

When a transition opens a modal (renders to \`modal\` or \`drawer\` slot), the target state MUST have:
1. A **CLOSE** transition to clear the modal and return to browsing state
2. A **CANCEL** transition (for forms with cancel buttons)
3. The CLOSE/CANCEL effects MUST include \`["render-ui", "modal", null]\` to clear the slot

\`\`\`json
// WRONG - Modal opens but no way to close it!
{
  "from": "browsing", "to": "creating", "event": "CREATE",
  "effects": [["render-ui", "modal", { "type": "form-section", ... }]]
}
// No CLOSE or CANCEL transition from "creating" → Page gets stuck!

// CORRECT - Full modal open/close cycle:
{
  "from": "browsing", "to": "creating", "event": "CREATE",
  "effects": [["render-ui", "modal", { "type": "form-section", "cancelEvent": "CANCEL", ... }]]
},
{
  "from": "creating", "to": "browsing", "event": "CANCEL",
  "effects": [["render-ui", "modal", null]]
},
{
  "from": "creating", "to": "browsing", "event": "CLOSE",
  "effects": [["render-ui", "modal", null]]
},
{
  "from": "creating", "to": "browsing", "event": "SAVE",
  "effects": [
    ["persist", "create", "Entity", "@payload.data"],
    ["render-ui", "modal", null],  // ← IMPORTANT: Clear modal on save too!
    ["fetch", "Entity", {}]
  ]
}
\`\`\`

**Why CLOSE is needed:** The UI sends \`CLOSE\` when user clicks outside the modal or presses Escape.
**Why CANCEL is needed:** Forms emit \`CANCEL\` when user clicks the Cancel button.
**Both are needed** for complete modal behavior. Without them, the modal cannot be dismissed and reopened.

### 14. Wrong Filtering Pattern (Use Query Singleton)
\`\`\`
WRONG: Individual filter buttons with manual FILTER events
       { "type": "button", "label": "Active", "action": "FILTER", "data": { "status": "active" } }

CORRECT: Use Query Singleton entity + filter-group pattern:
\`\`\`

**Query Singleton Pattern for Filtering:**

1. Define a singleton entity to hold filter state:
\`\`\`json
{
  "name": "TaskQuery",
  "entity": {
    "name": "TaskQuery",
    "singleton": true,
    "runtime": true,
    "fields": [
      { "name": "status", "type": "string" },
      { "name": "search", "type": "string" }
    ]
  }
}
\`\`\`

2. Use \`set\` effects to update filter state:
\`\`\`json
{
  "from": "Browsing", "to": "Browsing", "event": "FILTER",
  "effects": [["set", "@TaskQuery.status", "@payload.status"]]
}
\`\`\`

3. Reference query in patterns:
\`\`\`json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "query": "@TaskQuery"
}]
\`\`\`
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
| ORB_FORM_SUBMIT | Add onSubmit event name to form-section pattern |
| ORB_DUPE_TRANS | Add guards to differentiate same-event transitions |
| ORB_SLOT_CONTENTION | Merge traits or use different slots |
| ORB_DUPE_PAGE_TRAITS | Remove duplicate trait references from page |
| ORB_T_DUPLICATE_NAME | Use unique trait names per entity: UserManagement, TaskManagement |
| ORB_EFF_SET_REQUIRES_ENTITY | Change @payload.field to @entity.field in set effects |
| ORB_RUI_UNKNOWN_ITEM_ACTION_PROP | Remove invalid props (like \`condition\`), use \`showWhen\` |
| ORB_MODAL_NO_CLOSE | Add CLOSE/CANCEL transitions from modal states with \`["render-ui", "modal", null]\` |
`;
}
