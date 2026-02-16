/**
 * Atomic Composition Design Guide (v5.0)
 *
 * Teaches the LLM to compose sophisticated views using atomic design principles.
 * Every render-ui effect must satisfy the Five Rules of Sophisticated Composition.
 *
 * v5.0: Added mandatory composition rules, validation checklist, and theme enforcement.
 *
 * @packageDocumentation
 */

import {
  getPatternPropsCompact,
  getPatternActionsRef,
} from "@almadar/patterns";

/**
 * Get the render-ui atomic composition guide with mandatory rules.
 */
export function getRenderUIDesignGuide(): string {
  return `## Render-UI Atomic Composition Guide (v5.0)

### The Five Rules of Sophisticated Composition (MANDATORY)

Every render-ui effect MUST satisfy ALL five rules:

| Rule | Requirement | Validation |
|------|-------------|------------|
| **1** | **Single Render-UI** per transition | One render-ui effect only |
| **2** | **Three Atomic Levels** | Atoms (2+) + Molecules (1+) + Organisms (1+) |
| **3** | **Layout Wrapper** | Root must be stack/box/container/grid |
| **4** | **Theme Variables** | ALL visual props use CSS vars |
| **5** | **Template Quality** | Match CrudTemplate/ListTemplate sophistication |

---

### Rule 1: Single Render-UI Per Transition

Each transition executes exactly ONE render-ui effect with composed children:

\`\`\`json
// ✅ CORRECT: Single render-ui with composed children
{
  "from": "Browsing",
  "to": "Browsing",
  "event": "INIT",
  "effects": [
    ["render-ui", "main", {
      "type": "stack",
      "direction": "vertical",
      "gap": "lg",
      "children": [
        { "type": "page-header", "title": "...", "actions": [...] },
        { "type": "entity-table", "entity": "...", ... }
      ]
    }]
  ]
}

// ❌ WRONG: Multiple flat render-ui calls
{
  "effects": [
    ["render-ui", "main", { "type": "page-header", ... }],
    ["render-ui", "main", { "type": "entity-table", ... }]
  ]
}
\`\`\`

---

### Rule 2: Three Atomic Levels Required

Every composition MUST contain ALL three levels:

#### Level 1: Atoms (Minimum 2 distinct types)

| Type | Purpose | Example Usage |
|------|---------|---------------|
| \`typography\` | All text content | Headlines, labels, body text |
| \`badge\` | Status indicators | Active, Pending, Completed |
| \`button\` | User actions | Create, Edit, Delete |
| \`avatar\` | User/entity images | Profile pictures |
| \`icon\` | Decorative icons | Plus, Edit, Trash |
| \`progress-bar\` | Progress indicators | Upload progress |
| \`divider\` | Visual separation | Section dividers |

#### Level 2: Molecules (Minimum 1)

| Type | Purpose | Example Usage |
|------|---------|---------------|
| \`box\` | Visual containers | Stat cards, panels |
| \`card\` | Content grouping | Feature cards |
| \`modal\` | Dialog overlays | Create/edit forms |
| \`drawer\` | Side panels | Detail views |
| \`tabs\` | Content organization | Filter tabs |
| \`alert\` | Notifications | Success/error messages |
| \`accordion\` | Collapsible sections | FAQ, settings |

#### Level 3: Organisms (Minimum 1 for data views)

| Type | Purpose | Example Usage |
|------|---------|---------------|
| \`entity-table\` | Data tables | List views |
| \`form-section\` | Forms | Create/edit |
| \`entity-detail\` | Detail views | View record |
| \`page-header\` | Page headers | Title + actions |
| \`chart\` | Data visualization | Analytics |
| \`timeline\` | Chronological events | Activity history |
| \`stats\` | KPI metrics | Dashboard stats |

---

### Rule 3: Layout-First Structure

Root element MUST be a layout primitive:

\`\`\`json
// ✅ CORRECT: Layout wrappers
{ "type": "stack", "direction": "vertical", "gap": "lg", "children": [...] }
{ "type": "stack", "direction": "horizontal", "gap": "md", "children": [...] }
{ "type": "box", "padding": "lg", "bg": "var(--color-card)", "children": [...] }
{ "type": "container", "size": "xl", "padding": "lg", "children": [...] }
{ "type": "grid", "cols": 3, "gap": "md", "children": [...] }

// ❌ WRONG: No layout wrapper
{ "type": "page-header", "title": "..." }
{ "type": "entity-table", "entity": "..." }
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
  "borderColor": "var(--color-border)",
  "rounded": "var(--radius-none)" | "var(--radius-sm)" | "var(--radius-md)" | "var(--radius-lg)" | "var(--radius-xl)",
  "shadow": "var(--shadow-none)" | "var(--shadow-sm)" | "var(--shadow-md)" | "var(--shadow-lg)"
}
\`\`\`

**Container**
\`\`\`json
{
  "type": "container",
  "size": "sm" | "md" | "lg" | "xl" | "full",
  "padding": "none" | "xs" | "sm" | "md" | "lg" | "xl"
}
\`\`\`

**Grid**
\`\`\`json
{
  "type": "grid",
  "cols": 1 | 2 | 3 | 4 | 6 | 12 | { "sm": 1, "md": 2, "lg": 3 },
  "gap": "none" | "xs" | "sm" | "md" | "lg" | "xl"
}
\`\`\`

---

### Rule 4: Theme Variable Enforcement

ALL visual properties MUST use CSS theme variables:

| Property | ✅ CORRECT | ❌ WRONG |
|----------|-----------|----------|
| Colors | "var(--color-primary)" | "#3b82f6", "blue", "white" |
| Backgrounds | "var(--color-card)" | "#ffffff", "white" |
| Text colors | "var(--color-foreground)" | "#000000", "black" |
| Spacing | "var(--spacing-lg)" | "16px", "1rem" |
| Radius | "var(--radius-md)" | "8px", "0.5rem" |
| Shadows | "var(--shadow-sm)" | "0 2px 4px rgba(0,0,0,0.1)" |

---

### Rule 5: Template-Quality Composition

Match the sophistication of reference templates in \`packages/almadar-ui/components/templates/\`.

#### CrudTemplate Structure
\`\`\`
Container (size: xl, padding: lg)
  └── VStack (gap: lg)
      ├── PageHeader (title + actions)
      ├── Alert (error state)
      ├── EntityTable (searchable, sortable, actions)
      └── Modal (form-section for create/edit)
\`\`\`

#### ListTemplate Structure
\`\`\`
Container (size: md, padding: lg)
  └── VStack (gap: lg)
      ├── Typography (h2 title)
      ├── Input (search)
      ├── HStack (filter buttons)
      └── VStack (list items)
\`\`\`

#### Dashboard Structure
\`\`\`
Container (size: full, padding: lg)
  └── Grid (cols: { sm: 1, md: 2, lg: 4 })
      ├── Box (stat card 1)
      ├── Box (stat card 2)
      ├── Box (stat card 3)
      └── Box (stat card 4)
\`\`\`

---

### Validated Example: Task Management

This example has been validated with \`npx @almadar/cli validate\`:

\`\`\`json
{
  "name": "Taskly",
  "version": "1.0.0",
  "orbitals": [{
    "name": "Task Management",
    "entity": {
      "name": "Task",
      "collection": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["pending", "active", "done"] },
        { "name": "priority", "type": "enum", "values": ["low", "medium", "high"] }
      ]
    },
    "traits": [{
      "name": "TaskInteraction",
      "category": "interaction",
      "linkedEntity": "Task",
      "emits": [{ "event": "INIT", "scope": "internal" }],
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "CREATE", "name": "Create" },
          { "key": "SAVE", "name": "Save", "payload": [{ "name": "data", "type": "object" }] },
          { "key": "CANCEL", "name": "Cancel" }
        ],
        "transitions": [
          {
            "from": "Browsing",
            "to": "Browsing",
            "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "stack",
                "direction": "vertical",
                "gap": "lg",
                "children": [
                  {
                    "type": "page-header",
                    "title": "Task Management",
                    "actions": [{ "label": "Create Task", "event": "CREATE", "variant": "primary" }]
                  },
                  {
                    "type": "entity-table",
                    "entity": "Task",
                    "columns": ["title", "status", "priority"],
                    "searchable": true,
                    "itemActions": [
                      { "label": "Edit", "event": "EDIT" },
                      { "label": "Delete", "event": "DELETE" }
                    ]
                  }
                ]
              }]
            ]
          },
          {
            "from": "Browsing",
            "to": "Creating",
            "event": "CREATE",
            "effects": [
              ["render-ui", "modal", {
                "type": "form-section",
                "entity": "Task",
                "fields": ["title", "status", "priority"],
                "submitEvent": "SAVE",
                "cancelEvent": "CANCEL"
              }]
            ]
          },
          {
            "from": "Creating",
            "to": "Browsing",
            "event": "SAVE",
            "effects": [
              ["persist", "create", "Task", "@payload.data"],
              ["render-ui", "modal", null],
              ["emit", "INIT"]
            ]
          },
          {
            "from": "Creating",
            "to": "Browsing",
            "event": "CANCEL",
            "effects": [
              ["render-ui", "modal", null]
            ]
          }
        ]
      }
    }],
    "pages": [{
      "name": "TasksPage",
      "path": "/tasks",
      "viewType": "list",
      "isInitial": true,
      "entity": "Task",
      "traits": [{ "ref": "TaskInteraction" }]
    }],
    "emits": [],
    "listens": []
  }]
}
\`\`\`

---

### Critical Validation Rules

| Element | Correct Format | Wrong Format | Error |
|---------|----------------|--------------|-------|
| **Events** | \`{ "key": "INIT", "name": "Init" }\` | \`"INIT"\` | ORB_T_EVT_INVALID_FORMAT |
| **Emits** | \`[{ "event": "INIT", "scope": "internal" }}]\` | \`["INIT"]\` | ORB_T_UNDEFINED_TRAIT |
| **Payload events** | \`{ "key": "SAVE", "payload": [...] }\` | No payload | ORB_BINDING_PAYLOAD_FIELD_UNDECLARED |
| **Page traits** | \`{ "ref": "TraitName" }\` | With linkedEntity | ORB_P_INVALID_TRAIT_REF |
| **Category** | \`"category": "interaction"\` | Missing | ORB_T_MISSING_CATEGORY |

---

### Composition Quality Checklist

Before calling \`finish_task\`, verify:

\`\`\`
□ Single render-ui per transition
□ Root element is layout (stack/box/container/grid)
□ Contains 2+ atoms (typography, badge, button, etc.)
□ Contains 1+ molecules (box, card, tabs, alert)
□ Contains 1+ organisms (entity-table, form-section, page-header)
□ Uses theme variables for ALL visual properties
□ Has 3+ distinct sections (header, content, actions)
□ Matches template quality from almadar-ui/components/templates/
□ Passes npx @almadar/cli validate with zero errors
\`\`\`

---

### BANNED Patterns

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

---

${getPatternPropsCompact()}

${getPatternActionsRef()}
`;
}
