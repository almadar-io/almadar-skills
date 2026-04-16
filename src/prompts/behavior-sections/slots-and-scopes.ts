/**
 * Slot + Scope Vocabulary Sections (Phase 7.2)
 *
 * Two small fixed-vocabulary sections that tell the LLM which tokens
 * are legal in `render-ui` effects and in `emit` / `listen` declarations.
 *
 *   - `getSlotVocabularySection()` — every canonical `UISlot` value.
 *     Sourced live from `@almadar/core`'s `UI_SLOTS` so the prompt
 *     stays in sync with the type whenever core bumps.
 *   - `getScopeVocabularySection()` — the two `EventScope` values and
 *     the composer rule COMP-7 (only external-scoped events are
 *     remappable via a trait-reference's `events:` override).
 *
 * @packageDocumentation
 */

import { UI_SLOTS } from '@almadar/core';

/**
 * Canonical list of `UISlot` values the LLM may pass as the second
 * argument to a `render-ui` effect. Do not invent others — slots
 * outside this list will fail schema validation in `orb validate`.
 *
 * Shipped from `@almadar/core/types/effect` (`UI_SLOTS` const).
 */
export function getSlotVocabularySection(): string {
    const lines: string[] = [];
    lines.push('## UI Slot Vocabulary');
    lines.push('');
    lines.push(
        '`render-ui` effects take a slot as their second argument: `["render-ui", <slot>, <pattern-config>]`. Use only the slots below — new slot names are NOT allowed and will be rejected by `orb validate`.',
    );
    lines.push('');
    lines.push('Sourced from `@almadar/core/types/effect.UI_SLOTS` — the type authority.');
    lines.push('');

    // Group the slots for readability without truncating.
    const appSlots = UI_SLOTS.filter((s) => !s.startsWith('hud') && !s.startsWith('overlay.'));
    const hudSlots = UI_SLOTS.filter((s) => s === 'hud' || s.startsWith('hud-') || s.startsWith('hud.'));
    const overlaySlots = UI_SLOTS.filter((s) => s.startsWith('overlay.'));

    lines.push('**App slots:**');
    lines.push(appSlots.map((s) => `\`${s}\``).join(', '));
    lines.push('');
    lines.push('**Game HUD slots:**');
    lines.push(hudSlots.map((s) => `\`${s}\``).join(', '));
    lines.push('');
    lines.push('**Game overlay slots:**');
    lines.push(overlaySlots.map((s) => `\`${s}\``).join(', '));
    lines.push('');
    lines.push(`Total: ${UI_SLOTS.length} slots.`);

    return lines.join('\n');
}

/**
 * Explain the two-valued `EventScope` and the composer rules the LLM
 * must follow when remapping events via trait-reference overrides.
 * Reference: `@almadar/core/types/trait.EventScope` + composer rule
 * COMP-7 (external-only remap).
 */
export function getScopeVocabularySection(): string {
    return `## Event Scope Vocabulary

Every \`emits\` and \`listens\` entry on a trait carries a \`scope\`. There are exactly two values:

- **\`scope: 'internal'\`** — "a sibling trait in the same orbital emits (or listens for) this event." Internal events ride the per-orbital event bus and never cross the orbital boundary.
- **\`scope: 'external'\`** — "the event crosses the orbital boundary. It is emitted by (or heard from) another orbital, a UI action, or a service subscriber."

Default when omitted: \`internal\`.

### Composer rule (COMP-7)

You may remap ONLY **external-scoped** events at a trait-reference call site:

\`\`\`json
{
  "ref": "Search.traits.SearchTrait",
  "events": { "SEARCH_SUBMIT": "APPLY_QUERY" }
}
\`\`\`

Attempting to remap an \`internal\`-scoped event will be rejected by \`orb validate\` (the sibling emitter has no way of knowing the new name, so the wiring would silently break).

### Consequence for composition

When you want to wire two behaviors together, inspect the catalog's \`Emits\` / \`Listens\` lines:

  - match an **external emit** of one trait to an **external listen** of another (cross-orbital wiring)
  - match an **internal emit** of one sibling trait to an **internal listen** of another sibling in the SAME orbital (shared event bus)

If a molecule's sought-after event is declared \`internal\`, you cannot pull that string outward by remapping — compose from the underlying atoms directly instead.`;
}
