/**
 * Schema Update Guidance
 *
 * Provides guidance for modifying existing orbital schemas.
 *
 * @packageDocumentation
 */

/**
 * Get the full schema update section.
 */
export function getSchemaUpdateSection(): string {
  return `## Updating Existing Schemas

When modifying an existing orbital schema, follow this systematic approach:

### Step 1: Locate the Target

Use grep/search to find the right location:

\`\`\`bash
# Find entity by name
grep -n '"entity"' schema.orb -A 5 | grep "TaskEntity"

# Find trait by name
grep -n '"traits"' schema.orb | head -10

# Find specific trait definition
grep -n '"TaskInteraction"' schema.orb

# Find state machine transitions
grep -n '"transitions"' schema.orb -A 30 | head -50

# Find all events
grep -n '"events"' schema.orb

# Find all pages
grep -n '"pages"' schema.orb -A 10
\`\`\`

### Step 2: Identify What to Modify

| Change Type | Location to Find | What to Modify |
|-------------|------------------|----------------|
| Add field | \`"fields": [\` | Add to entity.fields array |
| Add event | \`"events": [\` | Add to stateMachine.events |
| Add state | \`"states": [\` | Add to stateMachine.states |
| Add transition | \`"transitions": [\` | Add to stateMachine.transitions |
| Add action button | \`"page-header"\` or \`"itemActions"\` | Add to pattern props |
| Add page | \`"pages": [\` | Add to orbital.pages array |
| Modify UI | \`"render-ui"\` | Find transition with target slot |

### Step 3: Common Modifications

**Add a new field to entity:**
\`\`\`json
// Find: "fields": [
// Add before the closing bracket:
{ "name": "priority", "type": "enum", "values": ["low", "medium", "high"] }
\`\`\`

**Add a new action button to page-header:**
\`\`\`json
// Find: INIT transition's page-header
// Add to actions array:
{ "label": "Export", "event": "EXPORT", "variant": "secondary" }
\`\`\`

**Add a new event:**
\`\`\`json
// Find: "events": [
// Add the event:
{ "key": "EXPORT", "name": "Export Data" }
\`\`\`

**Add a new transition:**
\`\`\`json
// Find: "transitions": [
// Add after existing transitions:
{
  "from": "Browsing",
  "to": "Exporting",
  "event": "EXPORT",
  "effects": [
    ["render-ui", "modal", { "type": "confirmation", "title": "Export?", "onConfirm": "CONFIRM_EXPORT", "onCancel": "CANCEL" }]
  ]
}
\`\`\`

**Add itemActions to entity-table:**
\`\`\`json
// Find: "entity-table" in INIT transition
// Add itemActions prop:
"itemActions": [
  { "label": "View", "event": "VIEW" },
  { "label": "Edit", "event": "EDIT" },
  { "label": "Delete", "event": "DELETE", "isDestructive": true }
]
\`\`\`

### Step 4: Ensure Completeness

After any modification, verify:

1. **New events have matching transitions** - Every event must have at least one transition that uses it
2. **New states are reachable** - Every state must have a transition leading to it
3. **New states have exit transitions** - Every state (except browsing) needs a way back
4. **UI slots are cleared** - Modals/drawers opened must be closed with \`["render-ui", "modal", null]\`

### Quick Reference: Finding Traits

Traits are defined in two places:

1. **Inline in orbital** (most common):
\`\`\`json
"orbitals": [{
  "traits": [{
    "name": "TaskInteraction",
    "stateMachine": { ... }  // <-- trait definition here
  }]
}]
\`\`\`

2. **Referenced from library**:
\`\`\`json
"orbitals": [{
  "traits": [{
    "ref": "std/crud"  // <-- references external trait
  }]
}]
\`\`\`

For inline traits, grep for the trait name. For library traits, find the library file.

---

## Large Schema Handling (40KB+)

For schemas exceeding 40KB, use the **chunking tools** instead of direct editing:

### Available Tools

| Tool | Purpose |
|------|---------|
| \`query_schema_structure\` | Get lightweight map (~500 bytes): orbitals, traits, sizes |
| \`extract_chunk\` | Extract orbital/trait to \`.chunks/chunk-{id}.json\` |
| \`apply_chunk\` | Merge edited chunk back into schema |

**Note**: These tools work with \`schema.orb\` files. Changes are auto-persisted.

### Chunking Workflow

\`\`\`
1. DISCOVER: query_schema_structure("schema.orb")
   → Returns structure map with orbital/trait names

2. EXTRACT: extract_chunk({ file: "schema.orb", type: "orbital", name: "Task Management" })
   → Creates .chunks/chunk-{id}.json (2-5KB, easy to edit)

3. EDIT: Use edit_file on chunk file (NOT full schema)
   → Much smaller = reliable edits

4. APPLY: apply_chunk({ chunkId: "..." })
   → Merges changes back into schema.orb, auto-persists to database
\`\`\`

### Chunk Types

| Type | When to Use |
|------|-------------|
| \`orbital\` | Adding fields, modifying inline traits |
| \`inline-trait\` | Editing trait inside an orbital (requires \`parentOrbital\`) |

**Note**: There is no schema-level \`traits[]\` array. All traits belong inside orbitals.

### When to Use Chunking

| Schema Size | Strategy |
|-------------|----------|
| < 15KB | Direct edit (works fine) |
| 15-40KB | Targeted edit_file |
| > 40KB | **Use chunking tools** |`;
}

/**
 * Get compact schema update guidance (shorter version).
 */
export function getSchemaUpdateCompact(): string {
  return `## Schema Updates Quick Reference

**Find location:**
\`\`\`bash
grep -n '"entity"' schema.orb -A 5     # Find entities
grep -n '"traits"' schema.orb          # Find traits
grep -n '"transitions"' schema.orb     # Find transitions
\`\`\`

**Common changes:**
| Change | Find | Add to |
|--------|------|--------|
| Field | \`"fields": [\` | Entity fields array |
| Event | \`"events": [\` | StateMachine events |
| State | \`"states": [\` | StateMachine states |
| Transition | \`"transitions": [\` | StateMachine transitions |
| Button | \`"page-header"\` | actions array |
| Row action | \`"entity-table"\` | itemActions array |

**After changes, verify:**
- New events have transitions using them
- New states are reachable and have exits
- Modals/drawers are closed on completion`;
}
