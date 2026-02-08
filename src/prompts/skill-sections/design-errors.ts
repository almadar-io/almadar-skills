/**
 * Design-Specific Errors Section
 *
 * Common errors specific to the design skill that transforms
 * wireframe schemas into polished applications.
 *
 * @packageDocumentation
 */

/**
 * Get design-specific common errors section.
 * These are the most frequent mistakes when beautifying schemas.
 */
export function getDesignErrorsSection(): string {
  return `## ❌ Design-Specific Errors

| Error | Wrong | Correct |
|-------|-------|---------|
| Entity binding | \`@entity.task.title\` | \`@entity.title\` |
| Toast effect | \`["toast", "success", "msg"]\` | \`["notify", "in_app", "msg"]\` |
| Select missing options | \`{ "type": "select" }\` | Add \`"options": [{ "value": "x", "label": "X" }]\` |
| Undefined trait | \`{ "ref": "NewTrait" }\` | Define trait in \`traits[]\` FIRST |
| Missing action | \`{ "type": "button" }\` | \`{ "type": "button", "action": "SAVE" }\` |

### Entity Bindings (CRITICAL)

\`@entity\` already knows the entity type. Access fields directly:

\`\`\`
✅ @entity.title        - Direct field access
✅ @entity.address.city - Nested object field (address is an object)
❌ @entity.task.title   - Wrong! "task" is the entity type, not a field
\`\`\`

### Notification Effects

Use \`notify\` effect, NOT \`toast\`:

\`\`\`json
["notify", "in_app", "Saved!", "success"]  // ✅ Correct
["toast", "success", "Saved!"]              // ❌ Invalid effect
\`\`\`

Variants: \`success\`, \`error\`, \`warning\`, \`info\`

### Form Select Fields

Select fields REQUIRE options array:

\`\`\`json
// ❌ Wrong - missing options
{ "name": "status", "type": "select" }

// ✅ Correct - options provided
{
  "name": "status",
  "type": "select",
  "options": [
    { "value": "todo", "label": "To Do" },
    { "value": "done", "label": "Done" }
  ]
}
\`\`\`
`;
}

/**
 * Get compact design errors for lean skill.
 */
export function getDesignErrorsCompact(): string {
  return `## ❌ Design Errors

| Wrong | Correct |
|-------|---------|
| \`@entity.task.title\` | \`@entity.title\` |
| \`["toast", "success", "msg"]\` | \`["notify", "in_app", "msg"]\` |
| \`{ "type": "select" }\` | Add \`options: [{value, label}]\` |
| \`{ "ref": "NewTrait" }\` | Define in \`traits[]\` first |
`;
}

/**
 * Get icon library reference.
 */
export function getIconLibrarySection(): string {
  return `### Icons (Lucide)

Use kebab-case icon names from Lucide:

| Category | Icons |
|----------|-------|
| Actions | \`plus\`, \`pencil\`, \`trash\`, \`eye\`, \`check\`, \`x\`, \`save\` |
| Navigation | \`chevron-left\`, \`chevron-right\`, \`arrow-left\`, \`home\`, \`menu\` |
| Status | \`check-circle\`, \`x-circle\`, \`alert-circle\`, \`clock\`, \`loader\` |
| Content | \`file\`, \`folder\`, \`image\`, \`list\`, \`grid\`, \`clipboard\` |
| UI | \`search\`, \`filter\`, \`settings\`, \`more-horizontal\`, \`bell\` |

\`\`\`json
{ "type": "button", "icon": "plus", "label": "Add" }
{ "label": "Delete", "icon": "trash", "event": "DELETE" }
\`\`\`
`;
}

/**
 * Get compact icon reference.
 */
export function getIconLibraryCompact(): string {
  return `**Icons (Lucide)**: \`plus\`, \`pencil\`, \`trash\`, \`check-circle\`, \`x-circle\`, \`eye\`, \`settings\`, \`search\`, \`filter\``;
}
