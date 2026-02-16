/**
 * Theme Variable System Guide
 *
 * Teaches the LLM to use CSS theme variables for all visual properties.
 * Enforces consistent theming across all generated schemas.
 *
 * @packageDocumentation
 */

/**
 * Get the theme variable system guide.
 * Covers colors, spacing, radius, and shadows with mandatory enforcement rules.
 */
export function getThemeGuide(): string {
  return `## Theme Variable System (MANDATORY)

All visual properties MUST use CSS theme variables. Never use hardcoded values.

### ❌ BANNED: Hardcoded Values

| Type | Wrong | Why |
|------|-------|-----|
| Hex colors | "#3b82f6", "#ffffff", "#000000" | Not themeable |
| Named colors | "white", "black", "red", "blue" | Not themeable |
| Pixel values | "16px", "8px", "24px" | Not scalable |
| Rem values | "1rem", "0.5rem" | Inconsistent |
| Arbitrary values | "0 2px 4px rgba(0,0,0,0.1)" | Not themeable |

### ✅ REQUIRED: Theme Variables

### Color Variables

| Variable | Usage | Example Context |
|----------|-------|-----------------|
| \`var(--color-foreground)\` | Primary text | Headlines, body text |
| \`var(--color-muted-foreground)\` | Secondary text | Captions, labels, hints |
| \`var(--color-background)\` | Page background | Main container bg |
| \`var(--color-card)\` | Card backgrounds | Box containers, panels |
| \`var(--color-muted)\` | Subtle sections | Alternating rows, disabled states |
| \`var(--color-primary)\` | Primary actions | Main buttons, active states |
| \`var(--color-primary-foreground)\` | Text on primary | Button labels |
| \`var(--color-secondary)\` | Secondary actions | Secondary buttons |
| \`var(--color-secondary-foreground)\` | Text on secondary | Secondary button labels |
| \`var(--color-success)\` | Success states | Completed badges, success alerts |
| \`var(--color-warning)\` | Warnings | Warning badges, alerts |
| \`var(--color-destructive)\` | Errors, delete | Danger buttons, error states |
| \`var(--color-border)\` | Borders, dividers | Card outlines, separators |
| \`var(--color-input)\` | Input backgrounds | Form field backgrounds |
| \`var(--color-ring)\` | Focus rings | Input focus states |

### Spacing Variables

| Variable | Value | Usage |
|----------|-------|-------|
| \`var(--spacing-xs)\` | 4px | Tight gaps, icon spacing |
| \`var(--spacing-sm)\` | 8px | Small gaps, compact layouts |
| \`var(--spacing-md)\` | 12px | Standard gaps |
| \`var(--spacing-lg)\` | 16px | Large gaps, section padding |
| \`var(--spacing-xl)\` | 24px | Extra large gaps |
| \`var(--spacing-2xl)\` | 32px | Page-level spacing |
| \`var(--spacing-3xl)\` | 48px | Major section spacing |
| \`var(--spacing-4xl)\` | 64px | Hero section spacing |

### Radius Variables

| Variable | Value | Usage |
|----------|-------|-------|
| \`var(--radius-none)\` | 0px | Sharp corners |
| \`var(--radius-sm)\` | 2px | Small elements, tags |
| \`var(--radius-md)\` | 6px | Buttons, inputs, small cards |
| \`var(--radius-lg)\` | 8px | Cards, panels, modals |
| \`var(--radius-xl)\` | 12px | Large containers |
| \`var(--radius-2xl)\` | 16px | Extra large containers |
| \`var(--radius-full)\` | 9999px | Pills, avatars, badges |

### Shadow Variables

| Variable | Usage |
|----------|-------|
| \`var(--shadow-none)\` | Flat design, no elevation |
| \`var(--shadow-sm)\` | Subtle elevation, cards |
| \`var(--shadow-md)\` | Cards, dropdowns, popovers |
| \`var(--shadow-lg)\` | Modals, dialogs |
| \`var(--shadow-xl)\` | High elevation elements |
| \`var(--shadow-2xl)\` | Maximum elevation |

### Pattern-Specific Examples

#### Box / Card Container
\`\`\`json
{
  "type": "box",
  "padding": "lg",
  "bg": "var(--color-card)",
  "border": true,
  "borderColor": "var(--color-border)",
  "rounded": "var(--radius-lg)",
  "shadow": "var(--shadow-sm)"
}
\`\`\`

#### Typography
\`\`\`json
// Page title
{
  "type": "typography",
  "variant": "h1",
  "text": "Page Title",
  "color": "var(--color-foreground)"
}

// Secondary text
{
  "type": "typography",
  "variant": "caption",
  "text": "Label text",
  "color": "var(--color-muted-foreground)"
}

// Success text
{
  "type": "typography",
  "variant": "body",
  "text": "Completed",
  "color": "var(--color-success)"
}
\`\`\`

#### Button (use variant, not manual colors)
\`\`\`json
// Primary action
{
  "type": "button",
  "label": "Save",
  "event": "SAVE",
  "variant": "primary"
}

// Secondary action
{
  "type": "button",
  "label": "Cancel",
  "event": "CANCEL",
  "variant": "secondary"
}

// Danger action
{
  "type": "button",
  "label": "Delete",
  "event": "DELETE",
  "variant": "danger"
}
\`\`\`

#### Badge (variant maps to semantic colors)
\`\`\`json
{
  "type": "badge",
  "text": "Active",
  "variant": "primary"
}

{
  "type": "badge",
  "text": "Completed",
  "variant": "success"
}

{
  "type": "badge",
  "text": "Pending",
  "variant": "warning"
}

{
  "type": "badge",
  "text": "Error",
  "variant": "danger"
}
\`\`\`

#### Stack Layout
\`\`\`json
{
  "type": "stack",
  "direction": "vertical",
  "gap": "lg",
  "align": "stretch",
  "justify": "start"
}
\`\`\`

### Theme Validation Checklist

Before calling \`finish_task\`, verify:

- [ ] No hex colors (#fff, #000, #3b82f6, etc.)
- [ ] No named colors (white, black, red, blue, etc.)
- [ ] No pixel values (16px, 8px, 24px, etc.)
- [ ] No rem values (1rem, 0.5rem, etc.)
- [ ] All colors use var(--color-*)
- [ ] All spacing uses var(--spacing-*)
- [ ] All radius uses var(--radius-*)
- [ ] All shadows use var(--shadow-*)

### Auto-Correction Reference

The system will auto-correct these common mistakes:

| Wrong | Auto-Corrected To |
|-------|-------------------|
| "#fff" or "white" | "var(--color-background)" |
| "#000" or "black" | "var(--color-foreground)" |
| "#3b82f6" | "var(--color-primary)" |
| "#10b981" | "var(--color-success)" |
| "#f59e0b" | "var(--color-warning)" |
| "#ef4444" | "var(--color-destructive)" |
| "16px" | "var(--spacing-lg)" |
| "8px" | "var(--spacing-sm)" |
| "24px" | "var(--spacing-xl)" |
| "8px" (radius) | "var(--radius-md)" |
`;
}

/**
 * Get banned properties that should never be used.
 */
export function getBannedProps(): string {
  return `## BANNED PROPS (NEVER USE)

| Wrong Prop | Correct Prop | Pattern |
|------------|--------------|---------|
| \`onSubmit\` | \`submitEvent\` | form-section |
| \`onCancel\` | \`cancelEvent\` | form-section |
| \`headerActions\` | \`actions\` | detail-panel |
| \`loading\` | \`isLoading\` | all patterns |
| \`fieldNames\` | \`fields\` | detail-panel, form-section |
| \`onConfirm\` | (use event transitions) | confirmation |
| \`placement\` | (remove) | itemActions |
| \`isDestructive\` | (use variant: "danger") | itemActions |

### Banned Value Patterns

| Wrong | Correct |
|-------|---------|
| Hex colors: "#3b82f6" | Theme vars: "var(--color-primary)" |
| Named colors: "white", "red" | Theme vars: "var(--color-background)" |
| Pixel values: "16px" | Theme vars: "var(--spacing-lg)" |
| Events as strings: "INIT" | Event objects: { "key": "INIT", "name": "Init" } |
| Emits as strings: ["INIT"] | Emit objects: [{ "event": "INIT", "scope": "internal" }] |
`;
}
