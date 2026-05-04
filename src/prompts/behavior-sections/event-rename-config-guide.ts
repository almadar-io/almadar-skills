/**
 * Event-rename and Config Guide
 *
 * Tells the analyzer LLM when to set the override fields on each
 * AtomRecipeEntry — `events`, `config`, `emitsScope`. Defaults are
 * usually correct; overrides should be the exception, not the rule.
 *
 * @packageDocumentation
 */

export function getEventRenameAndConfigGuide(): string {
    return `
## Override Surface Rules

Each \`AtomRecipeEntry\` accepts these optional override fields. Don't
set them speculatively — defaults are designed to work for the common
case. Use overrides only when one of the rules below applies.

### \`events: { OLD: NEW }\` — rename event keys

When to set:
- **Collision avoidance**: two atoms in the recipe declare the same
  event key, and you need to disambiguate. Example: both \`std-browse\`
  and \`std-related\` emit \`SELECTED\` — rename one to keep them
  distinguishable.
- **Cross-orbital wiring**: the wiring entry needs a domain-specific
  event name (\`ITEM_ADDED\` vs the atom's generic \`ADDED\`).

When NOT to set:
- "I want a more descriptive name." Don't. The event key is the atom's
  contract; renaming for cosmetics breaks the trace + makes the
  intra-orbital wiring harder to read.
- "The atom emits 5 events and I only need 1." Don't rename — just
  don't wire the unused ones.

### \`config: { ... }\` — atom-specific tunables

When to set:
- The atom's catalog snippet declares a config key relevant to the
  consumer's domain (e.g. \`std-browse.pageSize\`,
  \`std-pagination.pageSize\`, \`std-stats.aggregations\`).
- The default value is wrong for the prompt (e.g. user asked for a
  per-page count of 50 but the atom defaults to 10).

When NOT to set:
- The atom doesn't declare the config key — making one up either gets
  silently dropped or breaks validation. Read the atom's catalog
  snippet for valid keys.
- Default works fine. \`config\` is the parameterization escape hatch,
  not a required field.

### \`emitsScope: 'internal' | 'external'\`

When to set:
- A normally-internal event needs to leave the orbital (cross-orbital
  wiring needs to listen for it). Flip to \`'external'\`.
- A normally-external event should stay private (you don't want other
  orbitals subscribing). Flip to \`'internal'\`.

When NOT to set:
- The atom's default scope already matches the wiring you want. Most
  atoms get this right — check the catalog snippet's Emits/Listens
  scope annotations before overriding.

### \`traitName: string\` — rename the inlined trait

When to set:
- Two atoms in the recipe would produce traits with the same name (the
  composer auto-suffixes collisions, but explicit renames are clearer).
- Domain reasons: \`BrowseItemBrowse\` is the std default; you want
  \`CustomerListBrowse\` for clarity.

When NOT to set: most cases. Default factory names are descriptive.

### Safest path

For the canonical recipes in the cookbook, you can usually emit just
\`atoms: [{ atom: "std-browse" }, { atom: "std-filter" }, ...]\` with
no per-atom overrides. The atom factories handle the entity binding
(via \`linkedEntity\`, set automatically from
\`composition.entityName\`), and the default events / scope are wired
to work together.

Reach for overrides only when:
1. Two atoms collide (same event key OR same trait name).
2. The cookbook recipe says "set config: X" for the pattern you're
   using (most don't).
3. Cross-orbital wiring needs a renamed event for clarity.

Keep recipes minimal. The LLM's job is to pick atoms; overrides are
the last 5% of expressiveness.
`.trim();
}
