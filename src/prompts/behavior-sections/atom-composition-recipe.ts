/**
 * Atom Composition Recipe Section
 *
 * Teaches the analyzer LLM the JSON shape it should emit per orbital
 * when composing atoms. The builder service materialises this recipe
 * via `composeAtoms` (which calls each atom's std factory and merges
 * the results via `@almadar/core/builders`). No `.orb` file is written
 * by the LLM directly — only the recipe.
 *
 * @packageDocumentation
 */

export function getAtomCompositionRecipeSection(): string {
    return `
## Composition Recipe Schema

When you compose atoms (instead of picking a single molecule/organism),
emit a \`composition\` block per orbital. Shape:

\`\`\`ts
interface AtomCompositionRecipe {
  // Custom entity name to bind every atom's linkedEntity to.
  entityName: string;

  // Authoritative field list for the bound entity. Atom factories use
  // this to construct the orbital's entity. Keep field names domain-
  // appropriate; atoms reference fields opaquely, so any names work.
  fields: EntityField[];

  // Atoms to compose (>= 1). Position 0 is the primary.
  atoms: AtomRecipeEntry[];

  // Optional intra-orbital wiring. Same shape as cross-orbital wiring,
  // but used WITHIN a single orbital to connect two atoms (atomA's
  // emit → atomB's trigger). Keep it empty unless atoms need to talk
  // inside the orbital — most simple compositions don't need this.
  wiring?: EventWiringEntry[];
}

interface AtomRecipeEntry {
  // Kebab-case atom name from the catalog (e.g. "std-browse").
  atom: string;

  // Optional rename of the inlined trait. Default: factory's name.
  // Used when two atoms in the recipe would produce a name collision.
  traitName?: string;

  // Per-key event rename map. Keys must be the atom's declared event
  // keys (from the catalog snippet for that atom). Use this when:
  //   - Two atoms in the recipe collide on event keys, OR
  //   - Cross-orbital wiring needs a domain-specific name (e.g.
  //     "ITEM_ADDED" vs the atom's generic "ADDED").
  // Don't rename arbitrarily — every rename complicates the wiring.
  events?: Record<string, string>;

  // Replace the atom's listens array (post-rename event names).
  // Rare; only for advanced flow rewiring.
  listens?: TraitEventListener[];

  // Per-event scope flip. Atom factories declare a default scope per
  // emit; flip to 'external' when an event needs to leave the orbital.
  emitsScope?: 'internal' | 'external';

  // Typed call-site config block — atom-specific. Read the atom's
  // catalog snippet for valid keys.
  config?: Record<string, unknown>;
}
\`\`\`

### Worked example: filterable product list

Prompt: "show users a list of products they can filter by category and
search by name"

\`\`\`json
{
  "name": "ProductBrowseOrbital",
  "entityName": "Product",
  "suggestedBehavior": "std-browse",
  "suggestedBehaviors": ["std-browse", "std-filter", "std-search"],
  "composition": {
    "entityName": "Product",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "name", "type": "string", "required": true },
      { "name": "category", "type": "string" },
      { "name": "price", "type": "number" }
    ],
    "atoms": [
      { "atom": "std-browse" },
      { "atom": "std-filter" },
      { "atom": "std-search" }
    ]
  },
  "fields": [...],
  "questions": [...]
}
\`\`\`

### Worked example: booking flow with confirmation

Prompt: "calendar to pick a slot, modal to fill in patient details,
confirm before booking"

\`\`\`json
{
  "composition": {
    "entityName": "Appointment",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "time", "type": "string", "required": true },
      { "name": "doctor", "type": "string" },
      { "name": "patientName", "type": "string" }
    ],
    "atoms": [
      { "atom": "std-calendar" },
      { "atom": "std-modal" },
      { "atom": "std-confirmation" }
    ]
  }
}
\`\`\`

### Worked example: metrics dashboard

Prompt: "show key server metrics with stat cards and charts"

\`\`\`json
{
  "composition": {
    "entityName": "ServerMetric",
    "fields": [
      { "name": "id", "type": "string", "required": true },
      { "name": "label", "type": "string" },
      { "name": "amount", "type": "number" }
    ],
    "atoms": [
      { "atom": "std-stats" },
      { "atom": "std-graphs" },
      { "atom": "std-browse" }
    ]
  }
}
\`\`\`

(NOT \`std-dashboard\` — that molecule's internal field bindings break
when the consumer entity has different field names. Compose atoms.)
`.trim();
}
