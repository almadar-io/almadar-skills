/**
 * Bindings Guide
 *
 * Generates binding documentation from the source of truth in @almadar/core.
 * This ensures the skill guidance matches the actual compiler validation.
 *
 * @packageDocumentation
 */

import { BINDING_DOCS, CORE_BINDINGS } from '@almadar/core';

/**
 * Generate binding documentation for skill prompts.
 * Derived from BINDING_DOCS in @almadar/core - single source of truth.
 */
export function getBindingsGuide(): string {
  const lines: string[] = [
    '## Valid Binding References',
    '',
    'Bindings reference runtime values using `@root.path` syntax:',
    '',
    '| Binding | Description | Example |',
    '|---------|-------------|---------|',
  ];

  // Generate table from BINDING_DOCS
  for (const [bindingKey, docs] of Object.entries(BINDING_DOCS)) {
    const example = docs.examples[0] || `@${bindingKey}`;
    lines.push(`| \`@${bindingKey}\` | ${docs.description} | \`${example}\` |`);
  }

  lines.push(
    '',
    '### Binding Rules',
    '',
    '- `@entity.field` - Access entity fields (e.g., `@entity.status`, `@entity.count`)',
    '- `@payload.field` - Access event payload data (read-only)',
    '- `@state` - Current state name (no path)',
    '- `@now` - Current timestamp (no path)',
    '- `@config.field` - Trait configuration values',
    '',
    '### Common Mistakes',
    '',
    '| ❌ Invalid | ✅ Correct |',
    '|------------|------------|',
    '| `@count(tasks)` | Use static text `"Total Tasks"` or add a `taskCount` field to entity |',
    '| `@find(orders, id=@payload.id)` | Use `@payload.data` — the runtime resolves entities |',
    '| `@categories.find(c => c.id === @payload.id)` | Use `@payload.data` — no JavaScript in bindings |',
    '| `@sum(orders, totalAmount)` | Add a `totalAmount` field to the entity |',
    '| `@formatDate(@entity.createdAt, "MMM dd")` | Use `@entity.createdAt` — formatting is UI-side |',
    '| `@length(items)` | Use `@entity.itemCount` — add the field to entity |',
    '| `@filter(...)` | No function-call syntax exists in bindings |',
    '| `@inc(@payload.delta)` | Use `@payload.data` or `@entity.field` |',
    '| `@count` | Use static text or add a count field to entity |',
    '| `@entity.task.title` | `@entity.title` (entity type is implicit) |',
    '| `@payload.field` in `set` effect | `@entity.field` (set modifies entity only) |',
    '| `@entity` (bare, no path) | `@entity.data` or `@entity.fieldName` — path required |',
    '',
    '**ABSOLUTE RULE**: Bindings are ONLY `@root.path` (e.g., `@entity.name`). NO function calls, NO JavaScript expressions, NO query syntax. If you need computed values, add a field to the entity.',
    ''
  );

  return lines.join('\n');
}

/**
 * Get compact binding reference (one-liner for tables).
 */
export function getBindingsCompact(): string {
  const validBindings = CORE_BINDINGS.map(b => `@${b}`).join(', ');
  return `Valid bindings: ${validBindings}`;
}

/**
 * Get binding validation rules for specific contexts.
 */
export function getBindingContextRules(): string {
  return `
## Binding Context Rules

| Context | Allowed Bindings | Notes |
|---------|-----------------|-------|
| Guards | @entity, @payload, @state, @now | Read-only conditions |
| Effects | @entity, @payload, @state, @now | @entity can be modified via set |
| Ticks | @entity, @state, @now | No payload (no event) |
| Render-UI | @entity, @payload, @state, @config | Display values only |

**Critical Rule:** The ".set" effect ONLY modifies @entity fields.
`.trim();
}
