/**
 * .orb Language Specification Sections
 *
 * Pure reference material: syntax, types, operators, composition rules.
 * No examples, no architectural opinions, no pattern recommendations.
 * Used by the generate_orbital subagent when JEPA plan provides guidance.
 *
 * @packageDocumentation
 */

/**
 * render-ui composition rules and available pattern types.
 * Describes what patterns exist and how they nest, not how to use them.
 */
export function getCompositionRules(): string {
    return `## render-ui Composition

### Rules
1. Single render-ui per transition
2. Root must be a layout pattern: stack, card, box, or simple-grid
3. Compose from atoms + molecules. Nest atoms inside layouts.
4. Every pattern object MUST have a "type" field, including children.

### Layout Patterns
| Pattern | Props |
|---------|-------|
| stack | direction (vertical/horizontal), gap (xs/sm/md/lg/xl), align (start/center/end/stretch), justify (start/center/end/between), wrap |
| card | padding, border, rounded, shadow, children |
| box | padding, bg, border, rounded, shadow, children |
| simple-grid | cols, gap, children |

### Atom Patterns
| Pattern | Props |
|---------|-------|
| typography | variant (h1-h6, body, caption), text, color |
| button | label, event, variant (primary/secondary/ghost/destructive), icon |
| icon | name, size, color |
| badge | text, variant (primary/success/warning/error) |
| divider | orientation |
| avatar | src, name, size |
| progress-bar | value, max, label |

### Data Molecule Patterns
| Pattern | Props |
|---------|-------|
| data-grid | entity, fields, itemActions, cols, gap |
| data-list | entity, fields, itemActions |
| form-section | entity, fields, submitEvent, cancelEvent (NOT actions array) |
| search-input | placeholder, event |
| filter-group | filters, event |
| tabs | tabs, activeTab |

### Metric Molecule Patterns
| Pattern | Props |
|---------|-------|
| stat-display | label, value, icon |
| meter | value, max, label |

### State Molecule Patterns
| Pattern | Props |
|---------|-------|
| empty-state | title, description, icon |
| loading-state | message |

### Banned Patterns (do not use)
entity-table, entity-list, entity-cards, page-header, detail-panel, timeline, crud-template, list-template, detail-template`;
}

/**
 * .orb structural syntax: entity, traits, state machine, effects, bindings.
 * The grammar of the language without any usage examples.
 */
export function getOrbSyntaxSpec(): string {
    return `## .orb Syntax

### Structure
An orbital has: name, entity, traits[], pages[], domainContext, design.

### entity
- name: string (PascalCase)
- collection: string (plural lowercase of name)
- persistence: "persistent" | "runtime" | "singleton"
- fields: array of { name, type, required?, default?, values? (for enum), relation? (for relation) }

### Field types
string, number, boolean, enum, timestamp, datetime, date, array, object, relation

### relation field
{ "name": "authorId", "type": "relation", "relation": { "entity": "User", "cardinality": "one" | "many" } }

### traits[]
Each trait has: name, category ("interaction"), linkedEntity, emits[], stateMachine

### emits format
[{ "event": "EVENT_NAME", "scope": "internal" }]
NOT the same as stateMachine.events format.

### stateMachine
- states: [{ "name": "StateName", "isInitial": true }]
- events: [{ "key": "EVENT_KEY", "name": "Display Name", "payload": [{ "name": "data", "type": "object" }] }]
- transitions: [{ "from": "State", "to": "State", "event": "EVENT_KEY", "guard"?: s-expr, "effects": [...] }]

### effects (operators)
| Effect | Syntax |
|--------|--------|
| render-ui | ["render-ui", "slot", { "type": "pattern", ...props, "children": [...] }] |
| render-ui dismiss | ["render-ui", "slot", null] |
| fetch all | ["fetch", "EntityName"] |
| fetch by id | ["fetch", "EntityName", { "id": "@payload.id" }] |
| persist create | ["persist", "create", "Entity", "@payload.data"] |
| persist update | ["persist", "update", "Entity", "@payload.id", "@payload.data"] |
| persist delete | ["persist", "delete", "Entity", "@payload.id"] |
| set field | ["set", "@entity.fieldName", value] |
| emit | ["emit", "EVENT_NAME", { payload }] |

### slots
"main", "modal", "drawer", "sidebar" — no others exist.

### bindings
- @entity.field — entity data
- @payload.field — event payload (read-only)
- @state — current state name (bare, no path)
- @now — timestamp
- @config.field — configuration

No function calls (@count, @sum, @find, @filter do NOT exist).
No concatenation. Each prop gets at most one binding.

### pages[]
{ "name": "PageName", "path": "/path", "viewType": "list"|"detail"|"dashboard", "traits": [{ "ref": "TraitName" }] }
Page trait ref MUST match the trait name exactly.

### domainContext
{ "request": "...", "category": "business", "vocabulary": { "item": "...", "create": "..." } }

### design
{ "style": "modern", "uxHints": { "flowPattern": "...", "listPattern": "...", "formPattern": "..." } }`;
}

/**
 * JEPA plan action dictionary.
 * Maps each action name to what it means in .orb terms.
 */
export function getJepaPlanActionReference(): string {
    return `## JEPA Plan Action Reference

| Action | What to add |
|--------|-------------|
| add_state | A new state in the state machine |
| add_transition | A new transition between states |
| add_event | A new event in stateMachine.events |
| add_render_ui_main | A render-ui effect targeting the "main" slot |
| add_render_ui_modal | A render-ui effect targeting the "modal" slot |
| add_render_ui_drawer | A render-ui effect targeting the "drawer" slot |
| add_persist_create | A persist create effect |
| add_persist_update | A persist update effect |
| add_persist_delete | A persist delete effect |
| add_fetch | A fetch effect |
| add_field_string | A string field on the entity |
| add_field_number | A number field on the entity |
| add_field_enum | An enum field on the entity |
| add_field_relation | A relation field on the entity |
| add_page | A page definition |
| add_listens | A listens entry for cross-orbital events |
| add_emits | An emits entry |
| set_persistence_persistent | Set entity persistence to "persistent" |
| set_app_name | Set the orbital name |`;
}

/**
 * Common .orb validation errors to avoid.
 * Structural errors only, no architectural guidance.
 */
export function getOrbErrorPatterns(): string {
    return `## Errors to Avoid

- Missing entity field at orbital level
- Missing collection on entity
- Empty enum values array
- Modal/drawer state without CANCEL and CLOSE transitions back
- form-section with "actions" array instead of submitEvent/cancelEvent
- @state.field (bare @state only, no paths)
- ["set", "@payload.field", ...] (set targets @entity only)
- Bare @entity without field path
- Entity type as binding root (@Product.name instead of @entity.name)
- Emits using events format ({ key, name } instead of { event, scope })`;
}
