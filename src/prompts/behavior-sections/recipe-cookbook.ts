/**
 * Recipe Cookbook
 *
 * Canonical atom-composition recipes for common interaction shapes,
 * scoped to verified `core/` atoms only. Each entry pairs a prompt
 * phrasing with the recipe shape that should land on disk after
 * `composeAtoms` runs.
 *
 * Atoms used (all from `core/atoms/`, all field-agnostic):
 *   std-browse, std-calendar, std-confirmation, std-drawer, std-filter,
 *   std-gallery, std-graphs, std-modal, std-pagination, std-push,
 *   std-related, std-search, std-selection, std-stats, std-tabs.
 *
 * Excluded:
 *   - std-display (deprecated; use std-stats + std-graphs)
 *   - std-dashboard (broken internal field bindings; compose atoms)
 *   - All non-core atoms (agent / game / service / probes — separate cookbook)
 *
 * @packageDocumentation
 */

export function getRecipeCookbook(): string {
    return `
## Recipe Cookbook (canonical atom compositions)

Each recipe pairs a prompt phrasing with the atoms to compose. Use
these as templates when the prompt matches the pattern; adapt the
\`entityName\` and \`fields\` to the consumer's domain.

### 1. Filterable list
**Prompt shape:** "browse X with filters by Y", "list of X I can filter".
**Atoms:** \`std-browse\` + \`std-filter\` + \`std-search\`
**Why:** browse paints the list, filter narrows by chosen field, search
matches by text. Field-agnostic — works for products, users, tickets,
photos, anything.

### 2. Metrics dashboard
**Prompt shape:** "show key numbers", "metrics dashboard", "stat cards
with charts".
**Atoms:** \`std-stats\` + \`std-graphs\` + \`std-browse\`
**Why:** stats render aggregate numbers (count/sum/avg/min/max), graphs
render bar/line/pie/area/donut charts, browse shows recent activity.
NEVER use \`std-dashboard\` — its internal field bindings break.

### 3. Master/detail with side drawer
**Prompt shape:** "click an item to see details", "list with a side
panel".
**Atoms:** \`std-browse\` + \`std-drawer\`
**Why:** browse selection emits SELECT, drawer listens to OPEN. Use
intra-orbital \`wiring\` to connect them.

### 4. Booking flow
**Prompt shape:** "calendar to pick a time", "schedule an appointment",
"book a slot".
**Atoms:** \`std-calendar\` + \`std-modal\` + \`std-confirmation\`
**Why:** calendar surfaces slots, modal collects details when a slot is
picked, confirmation gates the save.

### 5. Photo gallery with lightbox
**Prompt shape:** "photo grid", "thumbnails I can click to enlarge",
"gallery with album filter".
**Atoms:** \`std-gallery\` + \`std-modal\` + \`std-filter\`
**Why:** gallery is a thumbnail grid with PHOTO_SELECTED emit, modal
opens for the lightbox view, filter narrows by album.

### 6. Paginated browse
**Prompt shape:** "long list with page navigation", "browse with pages".
**Atoms:** \`std-browse\` + \`std-pagination\`

### 7. Search with multi-select
**Prompt shape:** "search results I can multi-select for batch ops".
**Atoms:** \`std-search\` + \`std-browse\` + \`std-selection\`

### 8. Tabbed browse
**Prompt shape:** "tabs across X categories", "switch between views of X".
**Atoms:** \`std-tabs\` + \`std-browse\` + \`std-related\`
**Why:** tabs partition the view, browse renders per-tab content,
related surfaces linked entities.

### 9. Confirm-before-delete
**Prompt shape:** "delete with confirmation", "confirm before destructive
action".
**Atoms:** \`std-browse\` + \`std-confirmation\`
**Why:** browse emits DELETE_REQUESTED, confirmation gates the actual
delete. Use intra-orbital \`wiring\` to connect them.

### 10. Live activity feed
**Prompt shape:** "live event feed", "stream of activity with toasts".
**Atoms:** \`std-browse\` + \`std-push\`
**Why:** browse renders the feed, push surfaces toast notifications
when new events arrive.

### 11. Single-atom orbital
**Prompt shape:** "just show a list of X" (no filters, no detail view).
**Atoms:** \`std-browse\` (alone)
**Why:** trivial single-purpose orbital. The recipe path also handles
1-atom cases identically to multi-atom — emit \`composition\` even if
\`atoms.length === 1\` for consistency.

### Beyond core atoms
This cookbook covers the \`core/\` atom set. For agent / game / service
domains, look at the catalog's per-tier reference for atoms in those
topics. The recipe shape is identical regardless of topic.
`.trim();
}
