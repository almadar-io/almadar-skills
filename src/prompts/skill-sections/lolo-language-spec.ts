/**
 * LOLO Language Specification Sections
 *
 * Provides the LOLO surface syntax reference for LLM skill generation.
 * Mirrors orb-language-spec.ts but for LOLO syntax instead of JSON.
 *
 * Pattern vocabulary is pulled from @almadar/patterns registry dynamically
 * (identical to the orb skill — same atoms + molecules, no organisms).
 *
 * @packageDocumentation
 */

import { getOrbAllowedPatterns, isValidPatternType } from '@almadar/patterns';

/**
 * LOLO structural syntax: orbital, entity, trait, state, emits, listens, page, uses.
 * The grammar of the language without usage opinions.
 */
export function getLoloLanguageSpec(): string {
    return `## LOLO Syntax Reference

LOLO is a Lisp-surface notation that compiles losslessly to .orb JSON.
The output file uses the \`.orb\` extension (the compiler auto-detects LOLO vs JSON).

### Top-Level Structure

\`\`\`lolo
app AppName v1.0.0          # optional app header (sets name + version)

type Status = active | done  # file-scoped type alias (zero or more)

orbital OrbitalName {        # one or more orbitals
  uses Alias from "path"     # imports (optional)
  entity EntityName [...]    # exactly one entity
  trait TraitName -> Entity   # one or more traits
  page "/path" -> Trait       # zero or more pages
}
\`\`\`

### Entity

\`\`\`lolo
entity EntityName [persistent: collection_name] {
  id       : string!                  # required field (! = non-null)
  name     : string                   # optional field
  quantity : number
  status   : Status                   # type alias reference
  tags     : [string]                 # array
  score    : int = derived (+ @base 10) # computed, not stored
}
\`\`\`

**Persistence tags**: \`[persistent]\`, \`[persistent: table]\`, \`[runtime]\`, \`[singleton]\`

**Field types**: string, number, boolean, date, timestamp, datetime, int, enum (via type alias), [T] (array), relation

**Entity inheritance**: \`entity Foo extends Alias.entity { extraField : string }\`

### Trait (inline)

\`\`\`lolo
trait TraitName -> EntityName [interaction] {
  initial: stateName              # optional (defaults to first state)

  state stateName {
    EVENT_KEY -> targetState       # transition
      (effect1 ...)               # effects (one per line)
      (effect2 ...)

    EVENT_KEY -> targetState when (guard ...)  # guarded transition
      (effect ...)
  }

  emits {
    EVENT_NAME scope { field : type }  # broadcast events
  }

  listens {
    SourceTrait EVENT -> LOCAL_EVENT    # receive cross-trait events
  }
}
\`\`\`

**Categories**: \`interaction\`, \`integration\`, \`lifecycle\`, \`temporal\`, \`validation\`, \`notification\`, \`agent\`

### Trait (reference form — from imported behavior)

\`\`\`lolo
trait LocalName = Alias.traits.UpstreamTrait -> EntityName {
  events {
    UPSTREAM_EVENT: LOCAL_EVENT     # rename event keys
  }
  on LOCAL_EVENT {                 # replace transition effects
    (fetch EntityName)
    (render-ui main { type: "data-grid", entity: "EntityName" })
  }
  emitsScope internal              # or external
}
\`\`\`

### Uses Declarations (imports)

\`\`\`lolo
uses Modal from "std/behaviors/std-modal"
uses Browse from "std/behaviors/std-browse"
\`\`\`

Reference imported members: \`Alias.entity\`, \`Alias.traits.TraitName\`, \`Alias.pages.PageName\`

### Emits

\`\`\`lolo
emits {
  ORDER_PLACED external { orderId: string, total: number }
  ITEM_ADDED   internal { itemId: string }
}
\`\`\`

\`internal\` stays within orbital. \`external\` broadcasts on cross-orbital bus (payload required).

### Listens

\`\`\`lolo
listens {
  OrderProcessing ORDER_SHIPPED -> SHOW
    with { message: ?orderId }
  InventoryManager STOCK_UPDATED -> REFRESH
    when (> ?quantity 0)
}
\`\`\`

### Page

\`\`\`lolo
page "/path" -> Trait1, Trait2                          # inline page
page "/path" -> Trait1 [view: list, entity: Entity]     # with hints
page "/path" = Alias.pages.UpstreamPage -> Trait1       # reference page
page "/" -> Dashboard [initial]                         # landing page
\`\`\`

### Sigils (binding context)

| Sigil | Resolves to | Valid in |
|---|---|---|
| \`@field\` | Entity field value | guards, effects, ticks |
| \`@field.sub\` | Nested field | guards, effects |
| \`?field\` | Payload field | guards, effects (NOT ticks) |
| \`@now\` | Current timestamp | guards, effects, ticks |
| \`@state\` | Current state name (bare, no path) | guards, effects |

### Comments

\`\`\`lolo
# single-line comment
;; documentation comment
#= block comment spanning
   multiple lines =#
\`\`\`

### Naming Conventions

- Entity names: \`PascalCase\` (e.g. \`CartItem\`)
- Trait names: \`PascalCase\` (e.g. \`CartItemBrowse\`)
- Field names: \`camelCase\` (e.g. \`itemCount\`)
- Event names: \`UPPER_SNAKE_CASE\` (e.g. \`ADD_ITEM\`)
- State names: \`camelCase\` (e.g. \`browsing\`, \`creating\`)`;
}

/**
 * Effect operators in LOLO S-expression form.
 * Every operator call is a parenthesized list: (op arg1 arg2 ...)
 */
export function getLoloEffectsReference(): string {
    return `## Effect Operators (LOLO S-Expression Form)

Every operator call uses Lisp form: \`(op arg1 arg2 ...)\`. No infix, no method chains.

### Core Effect Operators

| Operator | LOLO Syntax | Description |
|----------|-------------|-------------|
| **set** | \`(set @field value)\` | Assign value to entity field |
| **fetch** | \`(fetch EntityName)\` | Load all entity data |
| **fetch by id** | \`(fetch EntityName { id: ?id })\` | Load single entity |
| **persist create** | \`(persist create EntityName ?data)\` | Create new record |
| **persist update** | \`(persist update EntityName ?id ?data)\` | Update record |
| **persist delete** | \`(persist delete EntityName ?id)\` | Delete record |
| **render-ui** | \`(render-ui slot { type: "pattern", ... })\` | Render UI into slot |
| **render-ui dismiss** | \`(render-ui slot null)\` | Clear/close slot |
| **emit** | \`(emit EVENT_KEY)\` or \`(emit EVENT_KEY { k: v })\` | Broadcast event |
| **notify** | \`(notify "level" "message")\` | Show notification |
| **navigate** | \`(navigate "/path")\` | Navigate to route |

### Slots

\`main\`, \`modal\`, \`drawer\`, \`sidebar\` — no others for standard apps.

### Runtime Operators (inside S-expressions)

\`\`\`lolo
(+ @x @y)                        # arithmetic
(>= @quantity 1)                  # comparison
(and (> @a 0) (< @a 100))        # logical
(not @active)                     # negation
(array/append @items ?item)       # array operations
(array/length @items)
(str/concat @firstName " " @lastName)  # string operations
(math/clamp @score 0 100)        # math operations
(if condition then else)          # conditional
\`\`\`

### Let Bindings (scoped variables)

\`\`\`lolo
(let ((count (array/length @items))
      (name  (str/concat @first " " @last)))
  (set @summary (str/concat name ": " count)))
\`\`\`

### BANNED Operators (do not use)

- \`call-service\` (external integrations only)
- \`log\` (not a valid effect)
- Infix expressions (\`@entity.quantity <= 0\` is INVALID — use \`(<= @quantity 0)\`)`;
}

/**
 * render-ui guide in LOLO syntax with pattern vocabulary from registry.
 * Same patterns as orb skill (atoms + molecules, no organisms).
 */
export function getLoloRenderUIGuide(): string {
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

    return `## render-ui in LOLO

### Syntax

Pattern objects use LOLO inline-object syntax (no quotes on keys):

\`\`\`lolo
(render-ui main {
  type: "stack"
  direction: "vertical"
  gap: "lg"
  children: [
    { type: "typography", variant: "h1", text: "Tasks" }
    { type: "button", label: "New", event: "CREATE", variant: "primary", icon: "plus" }
  ]
})
\`\`\`

### Dismiss a slot

\`\`\`lolo
(render-ui modal null)
\`\`\`

### Rules

1. Single render-ui per transition
2. Root must be a layout pattern: \`stack\`, \`card\`, \`box\`, or \`simple-grid\`
3. Compose from atoms + molecules. No organisms.
4. Every pattern object MUST have a \`type\` field, including children.
5. ALL visual props must use CSS theme variables (\`var(--color-*)\`, \`var(--spacing-*)\`)

### Available Patterns (from registry)

${patternTables}
### BANNED Patterns (NEVER USE)

| Banned Pattern | Use Instead |
|---------------|-------------|
| \`entity-table\` | \`data-grid\` with \`entity\`, \`fields\`, \`itemActions\` |
| \`entity-list\` | \`data-list\` with \`entity\`, \`fields\`, \`itemActions\` |
| \`page-header\` | Compose with \`stack\` (horizontal) + \`typography\` (h1) + \`button\` |
| \`detail-panel\` | Compose with \`stack\` (vertical) + \`typography\` + \`badge\` + \`divider\` |
| \`timeline\` | Compose with \`data-list\` or \`stack\` + timestamp items |
| \`crud-template\` | Compose from \`data-grid\` + \`form-section\` + layout molecules |

### Layout Examples

**Header row** (NOT page-header):
\`\`\`lolo
(render-ui main {
  type: "stack", direction: "horizontal", justify: "between", align: "center"
  children: [
    { type: "typography", variant: "h1", text: "Tasks" }
    { type: "button", label: "New Task", event: "CREATE", variant: "primary", icon: "plus" }
  ]
})
\`\`\`

**Stat cards row**:
\`\`\`lolo
{
  type: "stack", direction: "horizontal", gap: "md", wrap: true
  children: [
    { type: "stat-display", label: "Total", value: @count, icon: "list" }
    { type: "stat-display", label: "Active", value: @activeCount, icon: "activity" }
  ]
}
\`\`\`

**Data view**:
\`\`\`lolo
{
  type: "data-grid", entity: "Task"
  fields: ["title", "status", "priority"]
  itemActions: [
    { event: "VIEW", label: "View" }
    { event: "EDIT", label: "Edit" }
    { event: "DELETE", label: "Delete" }
  ]
}
\`\`\``;
}

/**
 * Complete LOLO example showing a CRUD app with molecule-first composition.
 * Equivalent to the JSON example in orb.ts getTrimmedExample().
 */
export function getLoloExampleSection(): string {
    return `## Complete Example: Task Manager (LOLO)

\`\`\`lolo
app TaskManager v1.0.0

orbital TaskOrbital {
  entity Task [persistent: tasks] {
    id          : string!
    title       : string!
    description : string
    status      : string
    priority    : string
    count       : int = derived (array/length @items)
    activeCount : int = derived (array/length (array/filter @items (== @item.status "active")))
  }

  trait TaskBrowse -> Task [interaction] {
    state browsing {
      INIT -> browsing
        (fetch Task)
        (render-ui main {
          type: "stack", direction: "vertical", gap: "lg"
          children: [
            {
              type: "stack", direction: "horizontal", justify: "between", align: "center"
              children: [
                { type: "typography", variant: "h1", text: "Task Management" }
                { type: "button", label: "New Task", event: "CREATE", variant: "primary", icon: "plus" }
              ]
            }
            {
              type: "stack", direction: "horizontal", gap: "md", wrap: true
              children: [
                { type: "stat-display", label: "Total", value: @count, icon: "list" }
                { type: "stat-display", label: "Active", value: @activeCount, icon: "clock" }
              ]
            }
            {
              type: "data-grid", entity: "Task"
              fields: ["title", "status", "priority"]
              itemActions: [
                { event: "VIEW", label: "View" }
                { event: "EDIT", label: "Edit" }
                { event: "DELETE", label: "Delete" }
              ]
            }
          ]
        })

      CREATE -> creating
      VIEW -> viewing
      EDIT -> editing
      DELETE -> browsing
        (persist delete Task ?id)
        (fetch Task)
    }

    state creating {
      SAVE -> browsing
        (persist create Task ?data)
        (render-ui modal null)
        (fetch Task)
      CANCEL -> browsing
        (render-ui modal null)
      CLOSE -> browsing
        (render-ui modal null)

      INIT -> creating
        (render-ui modal {
          type: "form-section", entity: "Task"
          fields: ["title", "description", "status", "priority"]
          submitEvent: "SAVE", cancelEvent: "CANCEL"
        })
    }

    state viewing {
      CLOSE -> browsing
        (render-ui modal null)
      EDIT -> editing

      INIT -> viewing
        (render-ui modal {
          type: "stack", direction: "vertical", gap: "md"
          children: [
            { type: "typography", variant: "h2", text: @title }
            { type: "badge", text: @status, variant: "primary" }
            { type: "divider" }
            { type: "typography", variant: "body", text: @description }
            {
              type: "stack", direction: "horizontal", gap: "sm"
              children: [
                { type: "button", label: "Edit", event: "EDIT", variant: "secondary" }
                { type: "button", label: "Close", event: "CLOSE", variant: "ghost" }
              ]
            }
          ]
        })
    }

    state editing {
      SAVE -> browsing
        (persist update Task ?id ?data)
        (render-ui modal null)
        (fetch Task)
      CANCEL -> browsing
        (render-ui modal null)

      INIT -> editing
        (render-ui modal {
          type: "form-section", entity: "Task"
          fields: ["title", "description", "status", "priority"]
          submitEvent: "SAVE", cancelEvent: "CANCEL"
          mode: "edit"
        })
    }

    emits {
      INIT internal
    }
  }

  page "/tasks" -> TaskBrowse [view: list, entity: Task, initial]
}
\`\`\`

**Key patterns**:
- Header = \`stack\` + \`typography\` + \`button\` (NOT \`page-header\`)
- Data = \`data-grid\` (NOT \`entity-table\`)
- Detail = \`stack\` + \`typography\` + \`badge\` + \`divider\` (NOT \`detail-panel\`)
- Form = \`form-section\` with \`submitEvent\`/\`cancelEvent\` (NOT \`onSubmit\`)
- Modal dismiss = \`(render-ui modal null)\``;
}
