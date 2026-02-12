/**
 * Pattern Design Guide Section
 *
 * Replaces the 380-char getRenderUIQuickRef() with actionable guidance
 * on pattern selection, composition recipes, and slot strategy.
 *
 * Target: ~2,500 chars — focused entirely on helping the LLM produce
 * rich, varied render-ui effects instead of defaulting to entity-table.
 *
 * @packageDocumentation
 */

import {
  getPatternPropsCompact,
  getPatternActionsRef,
} from "@almadar/patterns";

/**
 * Get the render-ui design guide.
 * Covers syntax, slot strategy, pattern-by-intent, and composition recipes.
 */
export function getRenderUIDesignGuide(): string {
  return `## Render-UI Design Guide

### Syntax
\`["render-ui", slot, { "type": pattern, ...props }]\`
Clear slot: \`["render-ui", "modal", null]\`

### Slot Strategy
| Slot | Use For | Composable? |
|------|---------|-------------|
| \`main\` | Primary content | **YES** — stack multiple render-ui calls |
| \`modal\` | Forms (create/edit), confirmations | One at a time |
| \`drawer\` | Detail views, quick edits | One at a time |
| \`sidebar\` | Navigation, persistent filters | One at a time |
| \`overlay\` | Confirmations, alerts | One at a time |

### Pattern Selection by Intent
| Intent | Patterns | Key Props |
|--------|----------|-----------|
| List/browse data | \`entity-table\`, \`entity-cards\`, \`entity-list\` | columns, itemActions, searchable |
| Show metrics/KPIs | \`stats\` | metrics: [{label, value, icon, trend}] |
| Filter/search | \`filter-group\`, \`search-input\` | filters (from entity enum fields) |
| Create/edit form | \`form-section\` | fields, submitEvent, cancelEvent |
| View details | \`entity-detail\`, \`detail-panel\` | fields/fieldNames, actions |
| Organize content | \`tabs\` | tabs: [{label, content}] |
| Dashboard layout | \`dashboard-grid\` | columns (number) |
| Charts | \`chart\` | chartType, data, xAxis, yAxis |
| Progress | \`progress-bar\`, \`meter\` | value, max, label |
| Timeline | \`timeline\` | items: [{date, title, description}] |
| Page heading | \`page-header\` | title, subtitle, actions |
| Confirmation | \`confirmation\` | title, message, onConfirm, onCancel |
| Master/detail | \`master-detail\` | Split list + detail |
| Cards grid | \`entity-cards\` | columns, itemActions, layout |

### Composition Recipes

**CRUD Browsing INIT** (most common — compose ALL of these in main slot):
\`\`\`json
["render-ui", "main", { "type": "page-header", "title": "Tasks", "subtitle": "Manage your tasks", "actions": [{ "label": "New Task", "event": "CREATE", "variant": "primary" }] }],
["render-ui", "main", { "type": "stats", "entity": "Task", "metrics": [{ "label": "Total", "value": "@count", "icon": "clipboard" }, { "label": "Active", "value": "@count:status=active", "icon": "clock" }, { "label": "Done", "value": "@count:status=done", "icon": "check-circle" }] }],
["render-ui", "main", { "type": "entity-table", "entity": "Task", "columns": ["title", "status", "createdAt"], "searchable": true, "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE" }] }]
\`\`\`

**Dashboard INIT**:
\`\`\`
main: page-header → title + date range actions
main: dashboard-grid → columns: 3
main: stats → computed KPIs from entity counts
main: chart → primary data visualization
main: entity-cards → recent items (limit: 6)
\`\`\`

**Detail View (drawer)**:
\`\`\`
drawer: entity-detail → all fields + [Edit, Delete] actions
drawer: tabs → related collections (if entity has relation fields)
\`\`\`

**Wizard Flow**:
\`\`\`
main: wizard-progress → steps array + currentStep
main: wizard-container → current step content
main: wizard-navigation → Back/Next/Submit buttons
\`\`\`

### Layout Composition (stack, box, grid)

Layout patterns wrap other patterns via \`children\` arrays for rich, structured views.

**VStack** (vertical stack): \`{ "type": "stack", "direction": "vertical", ... }\`
**HStack** (horizontal stack): \`{ "type": "stack", "direction": "horizontal", ... }\`
**Box** (styled container): \`{ "type": "box", ... }\`

#### Stack Props
| Prop | Values | Default |
|------|--------|---------|
| \`direction\` | \`"vertical"\`, \`"horizontal"\` | \`"vertical"\` |
| \`gap\` | \`"none"\`, \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\` | \`"md"\` |
| \`align\` | \`"start"\`, \`"center"\`, \`"end"\`, \`"stretch"\` | \`"stretch"\` |
| \`justify\` | \`"start"\`, \`"center"\`, \`"end"\`, \`"between"\`, \`"around"\` | \`"start"\` |
| \`wrap\` | \`true\`, \`false\` | \`false\` |

#### Box Props
| Prop | Values |
|------|--------|
| \`padding\` / \`paddingX\` / \`paddingY\` | \`"none"\`, \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\` |
| \`bg\` | \`"default"\`, \`"muted"\`, \`"card"\`, \`"primary"\`, \`"secondary"\`, \`"accent"\` |
| \`border\` | \`true\`, \`false\` |
| \`rounded\` | \`"none"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"full"\` |
| \`shadow\` | \`"none"\`, \`"sm"\`, \`"md"\`, \`"lg"\` |

#### Grid Props
| Prop | Values |
|------|--------|
| \`cols\` | \`1\`–\`12\` or \`{ sm: 1, md: 2, lg: 3 }\` |
| \`gap\` | \`"none"\`, \`"xs"\`, \`"sm"\`, \`"md"\`, \`"lg"\`, \`"xl"\` |

#### Nesting Example — Page Header + Stats Row + Table
\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
      "children": [
        { "type": "typography", "variant": "h1", "text": "Orders" },
        { "type": "button", "label": "New Order", "event": "CREATE", "variant": "primary" }
      ]
    },
    { "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
      "children": [
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "stats", "metrics": [{ "label": "Total", "value": "@count" }] }]
        },
        { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
          "children": [{ "type": "stats", "metrics": [{ "label": "Pending", "value": "@count:status=pending" }] }]
        }
      ]
    },
    { "type": "entity-table", "entity": "Order", "columns": ["customer", "total", "status"], "searchable": true }
  ]
}]
\`\`\`

#### When to Use Layout Patterns
- **VStack**: Default page layout — stack header, content sections, tables vertically
- **HStack**: Side-by-side elements — stat cards, action buttons, header with controls
- **Box**: Visual grouping — cards, panels, highlighted sections with borders/backgrounds
- **Grid**: Equal-width columns — dashboard cards, stat grids, gallery layouts

> **Tip**: A single \`render-ui\` call with a top-level \`stack\` containing nested children produces a more cohesive layout than multiple flat \`render-ui\` calls to the same slot.

### Domain-Aware Pattern Selection
| Domain | List Pattern | Extras |
|--------|-------------|--------|
| business/admin | \`entity-table\` (searchable) | \`stats\`, \`filter-group\` |
| ecommerce | \`entity-cards\` | \`stats\` (revenue), \`chart\` |
| content/CMS | \`entity-cards\` | \`tabs\`, \`media-gallery\` |
| dashboard | \`dashboard-grid\` | \`stats\`, \`chart\`, \`meter\`, \`timeline\` |
| workflow | \`entity-table\` | \`progress-bar\`, \`timeline\` |

${getPatternPropsCompact()}

${getPatternActionsRef()}
`;
}
