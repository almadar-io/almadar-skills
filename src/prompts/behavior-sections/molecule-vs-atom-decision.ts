/**
 * Molecule-vs-Atom Decision Rule
 *
 * The single hardest call the analyzer LLM has to make per orbital: pick
 * a molecule (or organism) when its declared external surface is a
 * perfect drop-in, OR compose atoms via a `composition` recipe.
 *
 * Picking a molecule when the consumer's entity fields don't match the
 * molecule's internal `@entity.X` references is the failure mode that
 * burns tokens (fixer-loop chasing 15 binding errors that can't be
 * resolved). Atoms only need `id`; they treat domain fields as opaque
 * payload — they survive any rebind.
 *
 * @packageDocumentation
 */

export function getMoleculeVsAtomDecisionRule(): string {
    return `
## Tier Decision Rule (per orbital)

Per-orbital choice — apps mix tiers across orbitals freely.

### Pick an organism (single \`suggestedBehavior\`)
When the prompt names a complete domain — an entire app pattern — and an
organism in the catalog covers it end-to-end:
- "build a marketplace" → \`std-ecommerce\`
- "build a clinic booking system" → \`std-booking-system\`
- "build an internal CMS" → \`std-cms\`
- "build a CRM" → \`std-crm\`
- "build an LMS" → \`std-lms\`
- "build a helpdesk" → \`std-helpdesk\`
- "build a project manager" → \`std-project-manager\`

The organism owns multiple inner orbitals + cross-orbital wiring. You
write ONE \`suggestedBehavior\` and skip \`composition\`.

### Pick a molecule (single \`suggestedBehavior\`)
ONLY when the molecule's catalog **external** Emits/Listens surface is a
perfect drop-in for the consumer's interaction shape. The catalog's
Emits/Listens lines (scope: external) are the molecule's public API; if
they match what the orbital needs without renaming, the molecule is
safe. Examples that work:
- "shopping cart with add/remove/checkout" → \`std-cart\`
- "multi-step form with review" → \`std-wizard-form\`

Don't pick a molecule whose name *sounds* right but whose internal
state machine references field names different from the consumer's
entity. Field names like \`@entity.value\` or \`@entity.threshold\` baked
into the molecule's trait body do NOT auto-rewrite when you set
\`linkedEntity\`. That's the field-binding hazard. When in doubt,
compose atoms.

### Compose atoms (emit a \`composition\` recipe)
For everything else. Atoms are field-agnostic — they only reference
\`@entity.id\` (universal) and treat domain fields as opaque payload
flowing through events. Multi-atom compositions reproduce molecule-like
flows without the field hazard. Always use \`composition\` when:
- The prompt asks for an interaction shape but no molecule is a perfect
  fit ("metrics dashboard", "tabbed orders view", "master/detail with
  drawer", "kanban-style board", "live activity feed").
- The prompt mixes 2+ primitives ("filterable list", "search +
  multi-select", "calendar + booking modal + confirm").
- The molecule's external surface needs renaming or the consumer's
  fields don't match the molecule's bindings.

A \`composition\` recipe is JSON the analyzer emits per orbital, listing
the atoms to compose, the custom entity to bind them to, per-atom
config + event renames, and any intra-orbital wiring. The builder
service materialises it via \`composeAtoms\` from
\`@almadar/core/builders\` — no LLM is asked to write the resulting
\`.orb\`.

### Apps mix tiers
A single app can have one orbital that's an organism, another a
molecule drop-in, and a third a custom atom recipe. Cross-orbital
\`wiring\` connects different-tier orbitals. Decide tier per orbital,
not per app.
`.trim();
}
