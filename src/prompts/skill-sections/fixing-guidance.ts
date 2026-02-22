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

### Step 0: Read the Existing Schema

**BEFORE anything else, read schema.orb:**

\`\`\`
Read("schema.orb")
\`\`\`

You are FIXING an existing schema, NOT creating a new one.

**Rules:**
- The schema already exists at \`schema.orb\` — READ it first
- Understand the current entities, traits, and pages before making changes
- NEVER generate new orbitals or entities — only fix validation errors in what exists
- NEVER overwrite schema.orb with a new schema — only apply targeted edits
- If schema.orb does not exist, STOP and report the issue (do not create a new schema)

### Understanding Validation Errors

Validation output format:
\`\`\`
❌ [ERROR_CODE] path.to.error: Description
   💡 Fix hint
\`\`\`

**The path tells you exactly where to edit.**

| Error Path | What to Edit |
|------------|--------------|
| \`orbitals[0].entity.fields\` | Add/modify entity fields |
| \`orbitals[0].traits[0].stateMachine.transitions[1]\` | Add/modify transition |
| \`orbitals[0].traits[0].stateMachine.states\` | Add state or mark isTerminal |
| \`...effects[0][2].children[1].children[0].children[1].text\` | Fix binding in render-ui |

### Step 1: Validate and Analyze

\`\`\`
validate_schema()
\`\`\`

**CRITICAL: Before fixing, you MUST understand the full scope of errors.**

Parse and categorize all errors:
- **Entity errors**: Field types, relations, collection names
- **Trait errors**: State machine, events, transitions
- **Page errors**: Missing traits, invalid references
- **Pattern errors**: Missing required fields in render-ui

**Count errors by orbital and severity.**

### Step 2: Create Fix Plan

**BEFORE making any edits, write out your fix plan:**

\`\`\`
## Fix Plan

### Summary
- Total errors: X (Y critical, Z warnings)
- Affected orbitals: [list]
- Estimated complexity: simple|medium|complex

### Execution Order
1. **Fix [ID]**: [Description] -> [Target location]
2. **Fix [ID]**: [Description] -> [Target location]
3. ...

### Dependencies
- Fix X must happen before Fix Y
- Group A fixes can be batched
\`\`\`

**Planning Rules:**
- Group related fixes (same orbital, same component)
- Identify dependencies (entity fields before bindings)
- Prioritize critical errors first
- Estimate if fix is simple (1 edit) or needs multiple steps

### Step 3: Execute Fixes

**Execute your plan systematically:**

For each fix in your plan:
1. **Apply the fix** using Edit tool
2. **Verify the fix** - check the specific error is resolved
3. **Track progress** - note which fixes are done

**Execution Order (Priority):**
1. **Entity structure fixes** (add missing entity, fields, persistence)
2. **Event/state fixes** (add missing events, states, transitions)
3. **Effect fixes** (render-ui effects, bindings)
4. **Pattern property fixes** (missing columns, fields, actions)
5. **Minor syntax fixes** (enum values, type corrections)

**Batching Strategy:**
- Fix ALL errors of the same type in one orbital per edit
- If errors span multiple orbitals, create separate edits
- Document what each edit fixes

### Step 4: Re-validate and Verify

\`\`\`
validate_schema()
\`\`\`

**After each batch of fixes, re-validate to confirm progress.**

Compare results with your plan:
- Expected errors resolved
- New errors appeared (unintended side effects)
- Errors still present (fix did not work)

**If new errors appear:**
1. Analyze the new error
2. Update your fix plan
3. Continue execution

### Step 5: Final Summary

**Call finish_task with:**
- Summary of what was fixed
- Number of edits made
- Any warnings or notes
`;
}

/**

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
| \`detail-panel\` | fields | \`"fields": ["field1", "field2"]\` |
| \`page-header\` | actions | \`"actions": [{ "label": "New", "event": "CREATE" }]\` |

### Binding Format Fixes (CRITICAL)

Validator error: \`ORB_BINDING_INVALID_FORMAT\` - "Invalid binding format: '@count:status=pending'"
Suggestion: "Use @root.field.nested format" means \`@entity.fieldName\`, NOT literal "root".

**Common Invalid Patterns from Validator:**
| Invalid Binding | Validator Message | Fix |
|-----------------|-------------------|-----|
| \`@count\` | Invalid binding format | Remove OR use \`@entity.count\` with computed field |
| \`@count:status=pending\` | Invalid binding format | \`@entity.pendingCount\` + add computed field |
| \`@count:status=active\` | Invalid binding format | \`@entity.activeCount\` + add computed field |
| \`@count:status=done\` | Invalid binding format | \`@entity.doneCount\` + add computed field |

**Step-by-Step Fix Process:**

Given error: \`ORB_BINDING_INVALID_FORMAT\` at path \`orbitals[0].traits[0]...children[1].text\`

1. **Extract orbital index** from path (e.g., \`orbitals[0]\` -> index 0)
2. **Find the invalid binding** (e.g., \`"@count:status=pending"\`)
3. **Add computed fields** to orbital's entity:
\`\`\`json
// In orbitals[0].entity.fields array, ADD:
{ "name": "pendingCount", "type": "number", "default": 0 },
{ "name": "activeCount", "type": "number", "default": 0 },
{ "name": "doneCount", "type": "number", "default": 0 }
\`\`\`
4. **Replace ALL invalid bindings** in render-ui:
\`\`\`json
// BEFORE:
{ "type": "badge", "text": "@count:status=pending", "variant": "warning" }
// AFTER:
{ "type": "badge", "text": "@entity.pendingCount", "variant": "warning" }
\`\`\`

**Validator Error Code Reference:**
| Code | Meaning | Action |
|------|---------|--------|
| \`ORB_BINDING_INVALID_FORMAT\` | Binding syntax wrong | Use \`@entity.field\` format |
| \`ORB_BINDING_UNKNOWN_ROOT\` | Wrong root prefix | Use \`@entity\`, \`@payload\`, \`@state\`, \`@now\` |
| \`ORB_BINDING_INVALID_PATH\` | Field doesn't exist | Add field to entity OR correct name |
| \`ORB_BINDING_STATE_NO_PATH\` | \`@state\` needs no path | Use \`@state\` alone, not \`@state.field\` |`;
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

Target: **3-5 tool calls** for most fixes.

### For Small Schemas (< 15KB)

\`\`\`
Step 1: Read schema.orb (1 call)
Step 2: Edit to fix ALL errors at once (1 call)
Step 3: Validate if needed (1 call)
Total: 3 tool calls
\`\`\`

### For Large Schemas (> 15KB) - MANDATORY CHUNKING

**⚠️ WARNING: For schemas larger than 15KB, you MUST use chunking tools.**

Direct edit_file on large schemas will fail or consume excessive tokens. ALWAYS use this workflow:

\`\`\`
MANDATORY Step 1: query_schema_structure("schema.orb")
                   → Check totalSize field

MANDATORY Step 2: extract_chunk({
                     file: "schema.orb",
                     type: "orbital", 
                     name: "TargetOrbitalName"
                   })
                   → Returns: { chunkId: "abc123", chunkFile: ".chunks/chunk-abc123.json" }

MANDATORY Step 3: edit_file({
                     path: ".chunks/chunk-abc123.json",
                     old_string: ...,
                     new_string: ...
                   })

MANDATORY Step 4: apply_chunk({ chunkId: "abc123" })
                   → Merges back to schema.orb
\`\`\`

**NEVER** use Read/Edit directly on schema files > 15KB. **ALWAYS** use chunking.

**DO:**
- **Target 3 tool calls** for simple fixes (read → edit → done)
- Fix ONLY what the user asked for (don't over-fix)
- Batch related changes in ONE edit
- Use chunking for schemas > 15KB

**DON'T:**
- Fix errors the user didn't ask about
- Add missing transitions/states unless explicitly requested
- Read schema multiple times without changes
- Make multiple small edits - do ONE comprehensive edit
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

The validated schema.orb IS your only deliverable.`;
}
