/**
 * Lean Orbital Skill Generator
 *
 * Generates kflow-lean-orbitals SKILL.md that:
 * 1. Outputs Domain Language text with S-Expression effects
 * 2. Uses minimal token count (~5x fewer than JSON)
 * 3. Imports from @almadar/* packages for schema knowledge
 *
 * @packageDocumentation
 */

// Inline lean prompts for domain language output
const LEAN_CORE_INSTRUCTIONS = `
## Core Instructions

Generate orbital schemas using **Domain Language** - a natural, readable format.

**Output Format**: Domain Language text (NOT JSON)
**Token Efficiency**: ~5x fewer tokens than JSON format
`;

const LEAN_OUTPUT_FORMAT = `
## Output Format

Output ONLY domain language text. No JSON, no code blocks, no explanations.

Example Output:
\`\`\`
A Task is a persistent entity that:
  - has title as text (required)
  - has status as enum [pending, active, done]
  - has dueDate as date

TasksPage at /tasks:
  - shows Task using List behavior
  - view type: list
\`\`\`
`;

const LEAN_VALIDATION_RULES = `
## Validation

- Every entity needs at least one field
- Pages must reference valid entities
- Use standard behaviors from std library
- S-expressions for guards/effects
`;

const LEAN_DECOMPOSITION_PROTOCOL = `
## Decomposition

1. Identify entities from requirements
2. Define fields for each entity
3. Create pages for each entity (list, create, edit)
4. Apply std behaviors (List, Detail, Form)
`;

const ODL_SYNTAX_REFERENCE = `
## Domain Language Syntax

**Entity**:
\`\`\`
A [Name] is a [persistent/runtime/singleton] entity that:
  - has [field] as [type] (required)
  - belongs to [Related]
  - has many [Related]s
\`\`\`

**Page**:
\`\`\`
[PageName] at /[path]:
  - shows [Entity] using [Behavior]
  - view type: [list|detail|create|edit]
\`\`\`
`;

const LEAN_STD_LIST_BEHAVIOR = `
## List Behavior

Use std/behaviors/crud List behavior for entity browsing.
`;

const LEAN_EFFECT_GUARD_SYNTAX = `
## S-Expressions

Use S-expressions for guards and effects:
- Guards: \`[">", "@entity.count", 0]\`
- Effects: \`["set", "@entity.field", value]\`
`;

const LEAN_CRITICAL_RULES = `
## Critical Rules

1. Use domain language format (NOT JSON)
2. One page per entity (list view)
3. Use std behaviors
`;

const LEAN_COMMON_ERRORS = `
## Common Errors

- Don't generate JSON
- Don't create separate create/edit/view pages
- Use std behaviors
`;

const ODL_PATTERNS = `
## Patterns

Entity patterns: entity-table, entity-list, entity-cards
Form patterns: form-section
`;

const ODL_TO_SCHEMA_MAPPING = `
## Mapping

Domain language is converted to OrbitalSchema JSON by the compiler.
`;

const LEAN_ERROR_HANDLING = `
## Error Handling

Output corrected domain language when errors occur.
`;

/**
 * Generate the kflow-lean-orbitals SKILL.md content
 */
export function generateLeanOrbitalSkill(): string {
    return `---
name: kflow-lean-orbitals
description: Generate OrbitalSchema applications using Domain Language with S-Expression effects.
allowed-tools: Read, generate_orbital_domain
version: 2.1.0
---

# kflow-lean-orbitals

> Generate OrbitalSchema applications using Domain Language
>
> **Output**: Domain Language text with S-Expression effects
> **Tools**: \`generate_orbital_domain\` (per-orbital generation with auto-persist)

---

${LEAN_CORE_INSTRUCTIONS}

---

${LEAN_DECOMPOSITION_PROTOCOL}

---

${LEAN_STD_LIST_BEHAVIOR}

---

${LEAN_OUTPUT_FORMAT}

---

${ODL_SYNTAX_REFERENCE}

---

${LEAN_EFFECT_GUARD_SYNTAX}

---

${LEAN_CRITICAL_RULES}

---

${LEAN_COMMON_ERRORS}

---

${ODL_PATTERNS}

---

${ODL_TO_SCHEMA_MAPPING}

---

${LEAN_VALIDATION_RULES}

---

${LEAN_ERROR_HANDLING}

---

## Workflow Summary (MANDATORY TOOL USAGE)

⚠️ **CRITICAL: You MUST use \`generate_orbital_domain\` for EACH orbital.**
⚠️ **NEVER use Write/Edit to create domain language directly - always use the tools.**

The tools handle proper prompting, caching, and S-Expression syntax. Writing directly will fail.

### Phase 1: Decomposition (CRITICAL - NO tool calls yet)

**You MUST decompose the application into orbitals BEFORE calling any tools.**

1. **Classify domain** - business, game, form, dashboard, content
2. **Identify entities** - List ALL data objects with:
   - Fields (name, type, required, default)
   - Relationships (belongs_to, has_many)
   - Persistence type (persistent, runtime, singleton)
3. **Resolve cross-references** - Ensure every "belongs to X" has entity X planned
4. **Plan orbitals** - Create a spec for each:

\`\`\`json
{
  "name": "Task Management",
  "entity": {
    "name": "Task",
    "persistence": "persistent",
    "fields": [
      { "name": "title", "type": "text", "required": true },
      { "name": "status", "type": "enum [todo, done]", "default": "todo" }
    ],
    "relations": [
      { "entity": "User", "type": "belongs_to" }
    ]
  },
  "pages": [
    { "name": "TasksPage", "path": "/tasks", "viewType": "list", "isInitial": true }
  ],
  "traits": ["TaskManager"],
  "patterns": ["page-header", "entity-table", "form-section", "entity-detail"]
}
\`\`\`

### Phase 2: Chunked Generation (generate_orbital_domain)

For EACH orbital spec, call the \`generate_orbital_domain\` tool:

\`\`\`json
{
  "sessionId": "my-app-session",
  "orbital": { ... orbital spec from Phase 1 ... },
  "orbitalIndex": 0,
  "totalOrbitals": 3
}
\`\`\`

This tool:
- Uses LLM with proper prompts (S-Expression syntax, patterns, CRUD template)
- Caches results by fingerprint
- **Auto-persists**: Each orbital is immediately converted to OrbitalSchema and saved

### Phase 3: Finish

After ALL orbitals are generated, call \`finish_task\` to complete the workflow.

No manual merging needed - the schema is built incrementally as each orbital is generated.

---

## Tool Reference

### generate_orbital_domain

Generate domain language for ONE orbital using LLM with proper prompts.

**Input:**
- \`sessionId\`: Unique session ID for this batch
- \`orbital\`: Orbital spec (entity, pages, traits, patterns)
- \`orbitalIndex\`: Position in batch (0-based)
- \`totalOrbitals\`: Total orbitals being generated

**Output:**
- \`success\`: Whether generation succeeded
- \`domainText\`: Generated domain language
- \`cached\`: Whether result was from cache
- \`usage\`: Token usage
- \`schema\`: The orbital converted to OrbitalSchema (auto-persisted)

---

## Complete Example

**User**: Create a task management app

**Assistant** writes domain.txt:
\`\`\`
# Entities

A Task is a persistent entity that:
  - has title as text (required)
  - has description as long text
  - has status as enum [todo, in_progress, done] with default "todo"
  - has priority as enum [low, medium, high] with default "medium"
  - has dueDate as date

# Pages

TasksPage at /tasks:
  - shows Task using TaskManager
  - view type: list
  - is initial page

# Behaviors

TaskManager behavior:
  Entity: Task
  States: Browsing, Creating, Viewing, Editing, Deleting
  Initial: Browsing

  Transitions:
    - From Browsing to Browsing on INIT
      then ["render-ui", "main", {"type": "page-header", "title": "Tasks", "actions": [{"label": "New Task", "event": "CREATE", "variant": "primary"}]}]
      then ["render-ui", "center", {"type": "entity-table", "entity": "Task", "columns": ["title", "status", "priority", "dueDate"], "itemActions": [{"label": "View", "event": "VIEW"}, {"label": "Edit", "event": "EDIT"}, {"label": "Delete", "event": "DELETE", "variant": "danger"}]}]

    - From Browsing to Creating on CREATE
      then ["render-ui", "modal", {"type": "form-section", "entity": "Task", "fields": ["title", "description", "status", "priority", "dueDate"], "submitEvent": "SAVE", "cancelEvent": "CANCEL"}]

    - From Creating to Browsing on SAVE
      then ["persist", "create", "Task", "@payload.data"]
      then ["render-ui", "modal", null]
      then ["emit", "INIT"]

    - From Creating to Browsing on CANCEL
      then ["render-ui", "modal", null]

    - From Browsing to Viewing on VIEW
      then ["render-ui", "drawer", {"type": "entity-detail", "entity": "Task", "fieldNames": ["title", "description", "status", "priority", "dueDate"], "actions": [{"label": "Edit", "event": "EDIT"}, {"label": "Delete", "event": "DELETE", "variant": "danger"}]}]

    - From Viewing to Editing on EDIT
      then ["render-ui", "drawer", null]
      then ["render-ui", "modal", {"type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL"}]

    - From Browsing to Editing on EDIT
      then ["render-ui", "modal", {"type": "form-section", "entity": "Task", "submitEvent": "SAVE", "cancelEvent": "CANCEL"}]

    - From Editing to Browsing on SAVE
      then ["persist", "update", "Task", "@payload.data"]
      then ["render-ui", "modal", null]
      then ["emit", "INIT"]

    - From Editing to Browsing on CANCEL
      then ["render-ui", "modal", null]

    - From Viewing to Browsing on CANCEL
      then ["render-ui", "drawer", null]

    - From Browsing to Deleting on DELETE
      then ["render-ui", "overlay", {"type": "confirmation", "title": "Delete Task?", "message": "This action cannot be undone."}]

    - From Viewing to Deleting on DELETE
      then ["render-ui", "drawer", null]
      then ["render-ui", "overlay", {"type": "confirmation", "title": "Delete Task?", "message": "This action cannot be undone."}]

    - From Deleting to Browsing on CONFIRM_DELETE
      then ["persist", "delete", "Task"]
      then ["render-ui", "overlay", null]
      then ["emit", "INIT"]

    - From Deleting to Browsing on CANCEL
      then ["render-ui", "overlay", null]
\`\`\`

**Key points in this example:**
- **Entity: Task** explicitly links the behavior to the Task entity (REQUIRED)
- INIT renders BOTH page-header (with "New Task" action) AND entity-table (with View/Edit/Delete itemActions)
- All effects use S-Expression format
- Modal for create/edit, drawer for view, overlay for delete confirmation
- Each open slot is closed with \`null\` when done
- SAVE emits INIT to refresh the list
`;
}

/**
 * Get the skill metadata
 */
export function getLeanOrbitalSkillMetadata() {
    return {
        name: 'kflow-lean-orbitals',
        description: 'Generate OrbitalSchema applications using Domain Language with S-Expression effects',
        category: 'orbital',
        priority: 'high',
        outputFormat: 'domain-language',
    };
}
