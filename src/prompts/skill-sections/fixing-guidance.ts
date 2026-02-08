/**
 * Fixing Guidance Section
 *
 * Specialized guidance for fixing validation errors in orbital schemas.
 *
 * @packageDocumentation
 */

/**
 * Get the fixing workflow section.
 */
export function getFixingWorkflowSection(): string {
    return `## Fixing Workflow

### Step 1: Validate and Analyze

\`\`\`
validate_schema()
\`\`\`

Group errors by orbital component:
- **Entity errors**: Field types, relations, collection names
- **Trait errors**: State machine, events, transitions
- **Page errors**: Missing traits, invalid references
- **Pattern errors**: Missing required fields in render-ui

### Step 2: Apply Batched Fixes

Fix ALL errors of the same type in one edit. Priority order:

1. **Entity fixes** (field types, enums, relations)
2. **State machine fixes** (initial state, orphan states)
3. **Transition fixes** (missing INIT, unreachable states)
4. **Pattern fixes** (missing props in render-ui effects)

### Step 3: Re-validate

\`\`\`
validate_schema()
\`\`\`

**STOP when "valid": true** - do not add more tasks or re-verify.`;
}

/**
 * Get common fix patterns section.
 */
export function getCommonFixPatternsSection(): string {
    return `## Common Fix Patterns

### Entity Fixes

| Error | Before | After |
|-------|--------|-------|
| Wrong enum syntax | \`"enumValues": [...]\` | \`"values": [...]\` |
| Wrong relation | \`"type": "many-to-one"\` | \`"relationType": "many-to-one"\` |
| Missing collection | (none) | \`"collection": "tasks"\` |

### State Machine Fixes

| Error | Before | After |
|-------|--------|-------|
| No initial state | \`{ "name": "Idle" }\` | \`{ "name": "Idle", "isInitial": true }\` |
| String states | \`"states": ["Idle"]\` | \`"states": [{ "name": "Idle", "isInitial": true }]\` |
| Missing event | (not in events) | Add to \`"events": [...]\` |

### Transition Fixes

| Error | Fix |
|-------|-----|
| No INIT transition | Add self-loop: \`{ "from": "Browsing", "to": "Browsing", "event": "INIT", "effects": [...] }\` |
| Orphan state | Add transition TO the state from initial |
| No exit from state | Add transition FROM the state back to browsing |

### Pattern Fixes (in render-ui effects)

| Pattern | Missing | Add |
|---------|---------|-----|
| \`entity-table\` | columns | \`"columns": ["field1", "field2"]\` |
| \`entity-table\` | itemActions | \`"itemActions": [{ "label": "Edit", "event": "EDIT" }]\` |
| \`form-section\` | onSubmit | \`"onSubmit": "SAVE"\` |
| \`form-section\` | fields | \`"fields": ["field1", "field2"]\` |
| \`entity-detail\` | fieldNames | \`"fieldNames": ["field1", "field2"]\` |
| \`page-header\` | actions | \`"actions": [{ "label": "New", "event": "CREATE" }]\` |`;
}

/**
 * Get over-generation detection section.
 */
export function getOverGenerationSection(): string {
    return `## Over-Generation Detection

**Signs of over-generation:**
- TaskListPage + TaskCreatePage + TaskEditPage + TaskViewPage (4 pages for 1 entity!)
- Multiple pages for the same entity CRUD

**Fix:** Consolidate to ONE page with trait-driven UI:

\`\`\`json
// KEEP only:
{
  "pages": [{
    "name": "TasksPage",
    "path": "/tasks",
    "viewType": "list",
    "traits": [{ "ref": "TaskInteraction" }]
  }]
}

// DELETE separate create/edit/view pages
\`\`\`

The trait's render-ui effects handle all UI (modals for create/edit, drawers for view).`;
}

/**
 * Get efficiency guidelines section.
 */
export function getEfficiencySection(): string {
    return `## Efficiency Guidelines

Target: **30-50 tool calls** for most fixes.

**DO:**
- Batch related changes (read once, edit all, write once)
- Fix all same-type errors together
- Run validation once after all changes

**DON'T:**
- Read schema multiple times without changes
- Make one small change per tool call
- Re-verify after validation passes
- Create documentation files`;
}

/**
 * Get completion rules section.
 */
export function getCompletionRulesSection(): string {
    return `## Completion Rules

**STOP IMMEDIATELY when:**
- \`validate_schema()\` returns \`"valid": true\`

**After validation passes:**
1. Mark todos complete
2. STOP - do not add more tasks
3. Do NOT create documentation
4. Do NOT "verify" or "confirm"
5. Do NOT validate again

The validated schema.json IS your only deliverable.`;
}
