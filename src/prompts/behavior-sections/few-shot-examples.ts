/**
 * Few-shot Composition Examples (Phase 7.4)
 *
 * Worked `.orb` compositions showing the exact shape the LLM should
 * emit. Every example uses real behaviors from the catalog and is
 * authored to be `orb validate`-clean. Each example is short enough
 * that the LLM can internalize the structure, not just the surface.
 *
 * @packageDocumentation
 */

/**
 * Render the few-shot examples block.
 *
 * Examples cover the three most common composition shapes:
 *   1. list + search (two atoms, event remap)
 *   2. master + detail (browse atom + drawer atom, event remap)
 *   3. filtered list (three atoms, internal shared bus)
 */
export function getFewShotExamplesSection(): string {
    return `## Few-shot Composition Examples

Each example shows the complete \`.orb\` shape the LLM is expected to emit. Copy the structure (\`uses\` + \`orbitals[].entity\` + \`orbitals[].traits[]\`); adapt names, fields, and event remaps to the task.

### Example 1 — list + search (ProductCatalog)

Two atoms share an orbital. The search trait emits \`SEARCH_SUBMIT\` externally; the browse trait listens for \`APPLY_QUERY\`. We remap \`SEARCH_SUBMIT\` -> \`APPLY_QUERY\` at the search trait's call site so both sides agree on the internal event name.

\`\`\`json
{
  "name": "ProductCatalog",
  "orbitals": [{
    "name": "ProductOrbital",
    "uses": [
      { "from": "std/behaviors/std-browse", "as": "Browse" },
      { "from": "std/behaviors/std-search", "as": "Search" }
    ],
    "entity": {
      "name": "Product",
      "fields": [
        { "name": "id",    "type": "string", "required": true },
        { "name": "title", "type": "string", "required": true },
        { "name": "price", "type": "number" }
      ]
    },
    "traits": [
      { "ref": "Browse.traits.BrowseItemBrowse", "linkedEntity": "Product" },
      { "ref": "Search.traits.SearchResultSearch", "linkedEntity": "Product",
        "events": { "SEARCH_SUBMIT": "APPLY_QUERY" } }
    ]
  }]
}
\`\`\`

### Example 2 — master + detail (ClientDirectory)

A browse atom drives a drawer atom. The browse trait emits \`SELECT\` externally; the drawer listens for \`OPEN\`. Remap \`SELECT\` -> \`OPEN\` so the click on a row opens the drawer.

\`\`\`json
{
  "name": "ClientDirectory",
  "orbitals": [{
    "name": "ClientOrbital",
    "uses": [
      { "from": "std/behaviors/std-browse", "as": "Browse" },
      { "from": "std/behaviors/std-drawer", "as": "Drawer" }
    ],
    "entity": {
      "name": "Client",
      "fields": [
        { "name": "id",    "type": "string", "required": true },
        { "name": "name",  "type": "string", "required": true },
        { "name": "email", "type": "string" }
      ]
    },
    "traits": [
      { "ref": "Browse.traits.BrowseItemBrowse", "linkedEntity": "Client",
        "events": { "SELECT": "OPEN" } },
      { "ref": "Drawer.traits.DrawerItemDrawer", "linkedEntity": "Client" }
    ]
  }]
}
\`\`\`

### Example 3 — filtered list (PhotoGallery)

Three atoms share one orbital. \`std-filter\` emits \`APPLY_QUERY\` internally (on the shared bus), \`std-browse\` listens for \`APPLY_QUERY\` internally, and \`std-gallery\` is the presentation atom. No event remapping is needed — internal bus does the wiring.

\`\`\`json
{
  "name": "PhotoGallery",
  "orbitals": [{
    "name": "PhotoOrbital",
    "uses": [
      { "from": "std/behaviors/std-browse",  "as": "Browse" },
      { "from": "std/behaviors/std-filter",  "as": "Filter" },
      { "from": "std/behaviors/std-gallery", "as": "Gallery" }
    ],
    "entity": {
      "name": "Photo",
      "fields": [
        { "name": "id",       "type": "string", "required": true },
        { "name": "url",      "type": "string", "required": true },
        { "name": "category", "type": "string" }
      ]
    },
    "traits": [
      { "ref": "Filter.traits.FilterItemFilter",   "linkedEntity": "Photo" },
      { "ref": "Browse.traits.BrowseItemBrowse",   "linkedEntity": "Photo" },
      { "ref": "Gallery.traits.GalleryItemGallery", "linkedEntity": "Photo" }
    ]
  }]
}
\`\`\`
`;
}

/**
 * Common composition patterns (replaces the retired domain-behavior
 * mapping in Phase 7.5). Points the LLM at the canonical multi-atom
 * shapes rather than the one-molecule-per-entity anti-pattern.
 */
export function getCommonCompositionsSection(): string {
    return `## Common Compositions

Select a composition pattern based on how the user wants to interact with the entity. Every pattern below is a real, \`orb validate\`-clean shape — use it as a starting point, not a template to echo verbatim.

| Pattern | Composed from | Remaps |
|---------|---------------|--------|
| **List + search**     | \`std-browse\` + \`std-search\` | \`{ SEARCH_SUBMIT: 'APPLY_QUERY' }\` on the search trait |
| **Master-detail**     | \`std-browse\` + \`std-drawer\` | \`{ SELECT: 'OPEN' }\` on the browse trait |
| **Gallery + filter**  | \`std-gallery\` + \`std-filter\` + \`std-browse\` | none (internal bus wiring) |
| **CRUD flow**         | \`std-browse\` + \`std-modal\` + \`std-confirmation\` | \`{ OPEN: 'EDIT_ITEM' }\` on the modal, \`{ REQUEST: 'DELETE_ITEM' }\` on the confirmation |
| **Form wizard**       | \`std-wizard\` + \`std-form-advanced\` | none |
| **Tabbed workspace**  | \`std-tabs\` + (one inner trait per tab) | \`{ ACTIVATE: 'SWITCH_TAB' }\` on each inner trait |

### Selection strategy

1. Identify the user's primary interaction shape (browse, inspect, create, filter, step-through).
2. Pick the pattern whose external events match that shape.
3. If a molecule's declared external surface already matches, import the molecule — otherwise compose from the underlying atoms.
4. Always wire matching \`external\` emits to \`external\` listens via \`events:\` remaps; leave \`internal\`-scoped events alone.
`;
}
