/**
 * Atomic Composition Design Guide
 *
 * Teaches the LLM to compose atoms, molecules, and organisms within
 * VStack/HStack/Box layout primitives to produce rich, unique views.
 *
 * Replaces the old pattern-selection-by-intent approach with atomic
 * design composition — the same approach used by template authors in
 * packages/almadar-ui/components/templates/.
 *
 * @packageDocumentation
 */

import {
  getPatternPropsCompact,
  getPatternActionsRef,
} from "@almadar/patterns";

/**
 * Get the render-ui atomic composition guide.
 * Covers syntax, slot strategy, atomic hierarchy, composition rules, and domain recipes.
 */
export function getRenderUIDesignGuide(): string {
  return `## Render-UI Atomic Composition Guide

### Syntax
\`["render-ui", slot, { "type": pattern, ...props }]\`
Clear slot: \`["render-ui", "modal", null]\`

### Slot Strategy
| Slot | Use For | Composable? |
|------|---------|-------------|
| \`main\` | Primary content | **YES** — use a single composed stack |
| \`modal\` | Forms (create/edit), confirmations | One at a time |
| \`drawer\` | Detail views, quick edits | One at a time |
| \`sidebar\` | Navigation, persistent filters | One at a time |
| \`overlay\` | Confirmations, alerts | One at a time |

---

### MANDATORY: Atomic Composition (NOT Pattern Selection)

Every render-ui effect for \`main\` MUST be a **single composed hierarchy** using layout primitives + atomic components. NEVER use multiple flat \`render-ui\` calls to the same slot.

#### Layout Primitives (Structural Scaffolding)
| Type | JSON | Use For |
|------|------|---------|
| **VStack** | \`{ "type": "stack", "direction": "vertical", "gap": "lg" }\` | Page layout, section stacking |
| **HStack** | \`{ "type": "stack", "direction": "horizontal", "gap": "md" }\` | Side-by-side elements, header rows |
| **Box** | \`{ "type": "box", "padding": "md", "bg": "card" }\` | Visual grouping, cards, panels |
| **Grid** | \`{ "type": "grid", "cols": 3, "gap": "md" }\` | Equal-width columns, dashboard grids |

#### Atoms (Visual Primitives — leaves of the tree)
| Type | Key Props | Use For |
|------|-----------|---------|
| \`typography\` | \`variant\` (h1-h6, body, caption, label), \`text\`, \`color\` | All text content |
| \`badge\` | \`variant\` (default, primary, success, warning, danger), \`text\` | Status labels, tags |
| \`button\` | \`label\`, \`event\`, \`variant\` (primary, secondary, danger, ghost), \`icon\` | User actions |
| \`avatar\` | \`src\`, \`alt\`, \`size\` (sm, md, lg) | User/entity images |
| \`icon\` | \`name\` (lucide icon name) | Decorative icons |
| \`progress-bar\` | \`value\`, \`max\`, \`label\`, \`variant\` | Progress/metrics |
| \`divider\` | \`orientation\` (horizontal, vertical) | Visual separators |

#### Molecules (Compound Components — containers with content)
| Type | Key Props | Use For |
|------|-----------|---------|
| \`card\` | \`title\`, \`subtitle\`, \`actions\`, \`children\` | Grouped content containers |
| \`modal\` | \`title\`, \`closeEvent\`, \`children\` | Dialog overlays |
| \`drawer\` | \`title\`, \`closeEvent\`, \`children\` | Side panels |
| \`tabs\` | \`tabs: [{label, event}]\`, \`activeTab\` | Content organization |
| \`alert\` | \`variant\`, \`title\`, \`message\`, \`dismissEvent\` | Notifications |
| \`accordion\` | \`items: [{title, children}]\` | Collapsible sections |

#### Organisms (Data-Driven Sections — complex, self-contained)
| Type | Key Props | Use For |
|------|-----------|---------|
| \`page-header\` | \`title\`, \`subtitle\`, \`actions: [{label, event, variant}]\` | Page titles with actions |
| \`entity-table\` | \`entity\`, \`columns\`, \`searchable\`, \`itemActions: [{label, event}]\` | Data tables |
| \`entity-cards\` | \`entity\`, \`columns\`, \`itemActions\`, \`layout\` | Card grid views |
| \`form-section\` | \`entity\`, \`fields\`, \`submitEvent\`, \`cancelEvent\` | Forms |
| \`entity-detail\` | \`entity\`, \`fields\`, \`actions: [{label, event}]\` | Detail views |
| \`chart\` | \`chartType\`, \`data\`, \`xAxis\`, \`yAxis\` | Data visualization |
| \`timeline\` | \`items: [{date, title, description}]\` | Chronological events |
| \`stats\` | \`metrics: [{label, value, icon, trend}]\` | KPI metrics |
| \`master-detail\` | Split list + detail | Two-panel views |

---

### Stack Props Reference
| Prop | Values | Default |
|------|--------|---------|
| \`direction\` | \`"vertical"\`, \`"horizontal"\` | \`"vertical"\` |
| \`gap\` | \`"none"\`, \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\` | \`"md"\` |
| \`align\` | \`"start"\`, \`"center"\`, \`"end"\`, \`"stretch"\` | \`"stretch"\` |
| \`justify\` | \`"start"\`, \`"center"\`, \`"end"\`, \`"between"\`, \`"around"\` | \`"start"\` |
| \`wrap\` | \`true\`, \`false\` | \`false\` |

### Box Props Reference
| Prop | Values |
|------|--------|
| \`padding\` / \`paddingX\` / \`paddingY\` | \`"none"\`, \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\` |
| \`bg\` | \`"default"\`, \`"muted"\`, \`"card"\`, \`"primary"\`, \`"secondary"\`, \`"accent"\` |
| \`border\` | \`true\`, \`false\` |
| \`rounded\` | \`"none"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"full"\` |
| \`shadow\` | \`"none"\`, \`"sm"\`, \`"md"\`, \`"lg"\` |

### Grid Props Reference
| Prop | Values |
|------|--------|
| \`cols\` | \`1\`–\`12\` or \`{ sm: 1, md: 2, lg: 3 }\` |
| \`gap\` | \`"none"\`, \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\` |

---

### COMPOSITION RULE (MANDATORY)

Every INIT transition rendering to \`main\` MUST produce a **single render-ui call** with a top-level \`stack\` containing composed \`children\`:

\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    // 1. Header section — HStack with title + primary action
    { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
      "children": [
        { "type": "typography", "variant": "h1", "text": "Page Title" },
        { "type": "button", "label": "Primary Action", "event": "CREATE", "variant": "primary" }
      ]
    },
    // 2. Metrics section — HStack of stat cards (Box + atoms)
    { "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
      "children": [
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [
            { "type": "typography", "variant": "caption", "text": "Metric Label" },
            { "type": "typography", "variant": "h2", "text": "@count" }
          ]
        }
        // ... more stat cards
      ]
    },
    // 3. Data section — organism (entity-table, entity-cards, etc.)
    { "type": "entity-table", "entity": "EntityName", "columns": [...], "searchable": true,
      "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }] }
  ]
}]
\`\`\`

**DO NOT** do this (flat sequential calls — WRONG):
\`\`\`json
["render-ui", "main", { "type": "page-header", ... }],
["render-ui", "main", { "type": "entity-table", ... }]
\`\`\`

---

### Domain-Specific Composition Recipes

**Healthcare / Medical:**
\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
      "children": [
        { "type": "typography", "variant": "h1", "text": "Patients" },
        { "type": "button", "label": "Register Patient", "event": "CREATE", "variant": "primary" }
      ]
    },
    { "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
      "children": [
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Total Patients" }, { "type": "typography", "variant": "h2", "text": "@count" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "New This Week" }, { "type": "typography", "variant": "h2", "text": "@count:createdAt>7d" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Critical" }, { "type": "badge", "variant": "danger", "text": "@count:status=critical" }] }
      ]
    },
    { "type": "entity-table", "entity": "Patient", "columns": ["name", "dob", "insurance", "status"],
      "searchable": true, "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE" }] }
  ]
}]
\`\`\`

**E-commerce / Catalog:**
\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
      "children": [
        { "type": "typography", "variant": "h1", "text": "Products" },
        { "type": "button", "label": "Add Product", "event": "CREATE", "variant": "primary" }
      ]
    },
    { "type": "grid", "cols": { "sm": 2, "md": 4 }, "gap": "md",
      "children": [
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Revenue" }, { "type": "typography", "variant": "h2", "text": "@sum:price" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Products" }, { "type": "typography", "variant": "h2", "text": "@count" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Low Stock" }, { "type": "badge", "variant": "warning", "text": "@count:stock<10" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Avg Rating" }, { "type": "typography", "variant": "h2", "text": "@avg:rating" }] }
      ]
    },
    { "type": "tabs", "tabs": [{ "label": "All", "event": "FILTER_ALL" }, { "label": "Active", "event": "FILTER_ACTIVE" }, { "label": "Draft", "event": "FILTER_DRAFT" }] },
    { "type": "entity-cards", "entity": "Product", "columns": ["name", "price", "stock", "status"],
      "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }] }
  ]
}]
\`\`\`

**Project Management / Workflow:**
\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
      "children": [
        { "type": "typography", "variant": "h1", "text": "Projects" },
        { "type": "button", "label": "New Project", "event": "CREATE", "variant": "primary" }
      ]
    },
    { "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
      "children": [
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Total" }, { "type": "typography", "variant": "h2", "text": "@count" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "In Progress" }, { "type": "badge", "variant": "primary", "text": "@count:status=active" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Overdue" }, { "type": "badge", "variant": "danger", "text": "@count:dueDate<@now" }] },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "typography", "variant": "caption", "text": "Completed" }, { "type": "badge", "variant": "success", "text": "@count:status=done" }] }
      ]
    },
    { "type": "entity-table", "entity": "Project", "columns": ["name", "status", "priority", "dueDate", "assignee"],
      "searchable": true, "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE" }] }
  ]
}]
\`\`\`

### Detail View Composition (drawer)
\`\`\`json
["render-ui", "drawer", {
  "type": "stack", "direction": "vertical", "gap": "md",
  "children": [
    { "type": "entity-detail", "entity": "EntityName", "actions": [{ "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE", "variant": "danger" }] },
    { "type": "tabs", "tabs": [{ "label": "History", "event": "TAB_HISTORY" }, { "label": "Notes", "event": "TAB_NOTES" }] }
  ]
}]
\`\`\`

---

### BANNED PROPS (NEVER USE)

| Wrong | Correct | Pattern |
|-------|---------|---------|
| \`onSubmit\` | \`submitEvent\` | \`form-section\` |
| \`onCancel\` | \`cancelEvent\` | \`form-section\` |
| \`headerActions\` | \`actions\` | \`entity-detail\` |
| \`loading\` | \`isLoading\` | all patterns |
| \`fieldNames\` | \`fields\` | \`entity-detail\`, \`form-section\` |
| \`onConfirm\` | (use event transitions) | \`confirmation\` |

### Event Format (MANDATORY)
Events MUST be flat strings, NOT objects:
\`\`\`json
// CORRECT:
"events": ["INIT", "CREATE", "VIEW", "EDIT", "DELETE", "SAVE", "CANCEL"]

// WRONG — do NOT use objects:
"events": [{ "key": "INIT" }, { "key": "CREATE" }]
\`\`\`

Events with payloads use this format:
\`\`\`json
"events": ["INIT", "CREATE", { "key": "VIEW", "payload": [{ "name": "id", "type": "string" }] }]
\`\`\`
Only use objects when the event has a payload declaration. Simple events are always strings.

---

### Pattern Props Reference
${getPatternPropsCompact()}

${getPatternActionsRef()}
`;
}
