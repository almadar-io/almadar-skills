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
    '| `@count` | `@entity.count` or compute via trait state |',
    '| `@count:status=pending` | Filter in entity query or use computed field |',
    '| `@entity.task.title` | `@entity.title` (entity type is implicit) |',
    '| `@payload.field` in `set` effect | `@entity.field` (set modifies entity only) |',
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
