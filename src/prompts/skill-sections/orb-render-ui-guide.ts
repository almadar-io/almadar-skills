/**
 * .orb Render-UI Composition Guide
 *
 * Teaches the LLM to compose render-ui trees using ONLY atoms and molecules
 * (plus allowed exceptions: data-list, data-grid, search-input, form-section, meter).
 *
 * Pattern list is derived dynamically from @almadar/patterns registry.
 * No hardcoded pattern lists. When patterns are added/removed from the registry,
 * this guide updates automatically.
 *
 * @packageDocumentation
 */

import { getOrbAllowedPatternsCompact } from '@almadar/patterns';
import { getBindingsGuide } from './bindings-guide.js';

/**
 * Get the .orb render-ui composition guide.
 * Uses only atoms/molecules from the registry, reflecting golden behavior patterns.
 */
export function getOrbRenderUIGuide(): string {
  const patternsRef = getOrbAllowedPatternsCompact();

  return `## .orb Render-UI Composition Guide

### Golden Behavior Pattern

Every render-ui tree in .orb follows the same structure observed across all 107 golden behaviors:

\`\`\`
stack (vertical, gap: lg)            ← root wrapper, ALWAYS
  ├── stack (horizontal)             ← header row (icon + title + actions)
  │     ├── icon
  │     ├── typography (h2/h3)
  │     └── button (primary action)
  ├── divider                        ← visual separation
  ├── stat-display / badge row       ← optional summary stats
  └── data-list / data-grid          ← main content
        OR form-section              ← for create/edit states
\`\`\`

The most-used patterns (by frequency across all behaviors):
1. \`stack\` (2820) - ALL layout
2. \`typography\` (1332) - ALL text
3. \`divider\` (803) - section separation
4. \`icon\` (796) - decorative/semantic icons
5. \`button\` (782) - ALL actions
6. \`badge\` (697) - status indicators
7. \`stat-display\` (691) - metric cards
8. \`data-list\` (178) - list views
9. \`progress-bar\` (131) - progress indicators
10. \`card\` (108) - content grouping

---

### Composition Rules

| Rule | Requirement |
|------|-------------|
| **1** | Root element MUST be \`stack\` (vertical) or \`box\` |
| **2** | Use ONLY atoms, molecules, and allowed exceptions (see pattern list below) |
| **3** | Single \`render-ui\` per transition (compose children, never multiple flat calls) |
| **4** | ALL visual props use CSS theme variables (no hex colors, no pixels) |
| **5** | Every action button's \`event\` must match a state machine event key |

**Allowed exceptions** (entity-aware but standard in .orb):
\`data-list\`, \`data-grid\`, \`search-input\`, \`form-section\`, \`meter\`

**BANNED from .orb render-ui** (organisms, resolved by compiler/runtime):
\`entity-table\`, \`entity-list\`, \`entity-cards\`, \`page-header\`, \`detail-panel\`,
\`stats\`, \`dashboard-grid\`, \`header\`, \`sidebar\`, \`navigation\`, \`master-detail\`

---

### Layout Reference

**Stack** (use for ALL layout):
\`\`\`json
{
  "type": "stack",
  "direction": "vertical" | "horizontal",
  "gap": "xs" | "sm" | "md" | "lg" | "xl",
  "align": "start" | "center" | "end" | "stretch",
  "justify": "start" | "center" | "end" | "between"
}
\`\`\`

**Box** (styled container):
\`\`\`json
{
  "type": "box",
  "padding": "sm" | "md" | "lg",
  "bg": "var(--color-card)",
  "border": true,
  "borderColor": "var(--color-border)",
  "rounded": "var(--radius-md)",
  "shadow": "var(--shadow-sm)"
}
\`\`\`

---

### Theme Variables (MANDATORY)

| Property | Use | Never |
|----------|-----|-------|
| Colors | \`var(--color-primary)\` | \`#3b82f6\` |
| Backgrounds | \`var(--color-card)\` | \`white\` |
| Text | \`var(--color-foreground)\` | \`black\` |
| Muted text | \`var(--color-muted-foreground)\` | \`gray\` |
| Borders | \`var(--color-border)\` | \`#e5e7eb\` |
| Radius | \`var(--radius-md)\` | \`8px\` |
| Shadows | \`var(--shadow-sm)\` | \`0 2px 4px...\` |

---

### Example: Browsing State (from golden behaviors)

\`\`\`json
["render-ui", "main", {
  "type": "stack", "direction": "vertical", "gap": "lg",
  "children": [
    {
      "type": "stack", "direction": "horizontal", "gap": "md",
      "justify": "between", "align": "center",
      "children": [
        {
          "type": "stack", "direction": "horizontal", "gap": "sm", "align": "center",
          "children": [
            { "type": "icon", "name": "list", "size": "lg" },
            { "type": "typography", "variant": "h2", "content": "Items" }
          ]
        },
        { "type": "button", "label": "Create", "event": "CREATE", "variant": "primary" }
      ]
    },
    { "type": "divider" },
    {
      "type": "stack", "direction": "horizontal", "gap": "md",
      "children": [
        { "type": "stat-display", "label": "Total", "value": "--" },
        { "type": "stat-display", "label": "Active", "value": "--" }
      ]
    },
    {
      "type": "data-list", "entity": "Item",
      "emptyIcon": "inbox",
      "itemActions": [
        { "label": "Edit", "event": "EDIT" },
        { "label": "Delete", "event": "DELETE", "variant": "danger" }
      ]
    }
  ]
}]
\`\`\`

### Example: Modal Form (from golden behaviors)

\`\`\`json
["render-ui", "modal", {
  "type": "stack", "direction": "vertical", "gap": "md",
  "children": [
    {
      "type": "stack", "direction": "horizontal", "gap": "sm", "align": "center",
      "children": [
        { "type": "icon", "name": "plus-circle", "size": "md" },
        { "type": "typography", "variant": "h3", "content": "Create Item" }
      ]
    },
    { "type": "divider" },
    {
      "type": "form-section", "entity": "Item",
      "mode": "create",
      "submitEvent": "SAVE",
      "cancelEvent": "CANCEL"
    }
  ]
}]
\`\`\`

---

${getBindingsGuide()}

---

### Available Patterns (derived from registry)

${patternsRef}

---

### BANNED Patterns

| Wrong | Correct |
|-------|---------|
| \`entity-table\` | \`data-list\` or \`data-grid\` |
| \`page-header\` | \`stack\` with \`icon\` + \`typography\` + \`button\` |
| \`detail-panel\` | \`stack\` with field \`typography\` rows |
| \`stats\` | \`stat-display\` atoms in a \`stack\` |
| Multiple flat render-ui calls | Single composed render-ui |
| Hex colors / pixels | Theme CSS variables |
| \`onSubmit\` / \`onCancel\` | \`submitEvent\` / \`cancelEvent\` |
`;
}
