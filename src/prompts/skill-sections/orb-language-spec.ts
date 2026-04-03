/**
 * .orb Language Specification Sections
 *
 * Pure reference material: syntax, types, operators, composition rules.
 * Pattern vocabulary is pulled from @almadar/patterns registry dynamically.
 * No examples, no architectural opinions, no pattern recommendations.
 *
 * @packageDocumentation
 */

import { getOrbAllowedPatterns, isValidPatternType } from '@almadar/patterns';

/**
 * render-ui composition rules + pattern vocabulary from registry.
 * Describes what patterns exist and how they nest, not how to use them.
 */
export function getCompositionRules(): string {
    const groups = getOrbAllowedPatterns() as Record<string, Array<{ name: string; keyProps?: string[] }>>;

    let patternTables = '';
    for (const [category, patterns] of Object.entries(groups)) {
        if (!patterns.length) continue;
        patternTables += `#### ${category}\n`;
        patternTables += '| Pattern | Props |\n|---------|-------|\n';
        for (const p of patterns) {
            if (!isValidPatternType(p.name)) continue;
            const props = (p.keyProps ?? []).slice(0, 6).join(', ');
            patternTables += `| \`${p.name}\` | ${props} |\n`;
        }
        patternTables += '\n';
    }

    return `## render-ui Composition

### Rules
1. Single render-ui per transition
2. Root must be a layout pattern: stack, card, box, or simple-grid
3. Compose from atoms + molecules. Nest atoms inside layouts.
4. Every pattern object MUST have a "type" field, including children.

### Available Patterns (from registry)

${patternTables}
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
    return `## Critical Structural Rules

### INIT transition (REQUIRED — #1 cause of blank pages)
The initial state MUST have a self-loop INIT transition with render-ui and fetch effects.
Without it, the page loads completely blank — nothing renders.
- The initial state (isInitial: true) must have: { "from": "InitialState", "to": "InitialState", "event": "INIT", "effects": [["fetch", "Entity"], ["render-ui", "main", { ... }]] }
- INIT must be declared in stateMachine.events: { "key": "INIT", "name": "Initialize" }
- INIT must be in the trait emits: [{ "event": "INIT", "scope": "internal" }]

### Modal/drawer exits (REQUIRED — every modal state needs these)
Every state that renders to "modal" or "drawer" MUST have:
- A CANCEL transition back: { "from": "ModalState", "to": "PreviousState", "event": "CANCEL", "effects": [["render-ui", "modal", null]] }
- A CLOSE transition back: same as CANCEL but with event "CLOSE"
- The SAVE/action transition must also dismiss: ["render-ui", "modal", null]

### Reachable states (every state must have at least one incoming transition)
If a state exists in states[], there must be at least one transition with "to": that state.
Otherwise the validator rejects it as unreachable.

### Payload declarations
If a transition uses @payload.id or @payload.data, the event MUST declare the payload:
{ "key": "EDIT", "name": "Edit", "payload": [{ "name": "id", "type": "string" }] }

### Pattern props
Only use props listed in the Available Patterns table. Common mistake: "padding" on card — card accepts title, subtitle, image, actions, children. Use box for padding.

## Other Errors to Avoid

- Missing entity field at orbital level
- Missing collection on entity (must be plural lowercase: "tasks" for Task)
- Empty enum values array (values must have at least one entry)
- form-section: use submitEvent/cancelEvent strings, NOT an "actions" array
- @state is bare (no paths): never @state.field, just @state
- set effect targets @entity.field only: never ["set", "@payload.field", ...]
- Bare @entity without field path: use @entity.fieldName
- Entity type as binding root: use @entity.name not @Product.name
- Emits format: [{ "event": "X", "scope": "internal" }] NOT [{ "key": "X", "name": "..." }]`;
}
