/**
 * Lean Orbital Skill Generator
 *
 * Generates a minimal, focused orbital skill by:
 * 1. Deriving type information directly from @almadar/core
 * 2. Using focused, minimal guidance sections
 * 3. Avoiding verbose explanations and redundancy
 *
 * v4: Reduced from ~49K to ~15K by:
 * - Removing std behaviors JSON dump (21K)
 * - Removing schema-updates (moved to fixing skill)
 * - Removing custom-traits (moved to fixing skill)
 * - Trimming common-errors to top 6
 * - Replacing 380-char render-ui quickref with 2.5K design guide
 * - Using compact decomposition and connectivity variants
 *
 * @packageDocumentation
 */

import {
    getSExprQuickRef,
    getStdMinimalReference,
    getStdFullReference,
    getStdBehaviorsWithStateMachines,
    getKeyBehaviorsReference,
} from './helpers.js';
import {
    getArchitectureSection,
    getCommonErrorsSection,
    getDecompositionSection,
    getDecompositionCompact,
    getCustomTraitSection,
    getSchemaUpdateSection,
    getConnectivityCompact,
    getRenderUIDesignGuide,
    // UX Enhancement sections
    getFlowPatternSection,
    getPortableOrbitalOutputSection,
    getOrbitalConnectivitySection,
    getContextUsageCompact,
} from '../prompts/skill-sections/index.js';

// ============================================================================
// Generator Options
// ============================================================================

export interface LeanSkillOptions {
    /** Include example orbital */
    includeExample?: boolean;
    /** Include tool workflow section */
    includeToolWorkflow?: boolean;
    /** Include std/* library reference (operators + behaviors) */
    includeStdLibrary?: boolean;
    /** Use full std reference (detailed) vs minimal (compact) */
    stdLibraryFull?: boolean;
    /** Include expanded non-game behaviors with state machines for copying */
    includeStdStateMachines?: boolean;
    /** Include schema update guidance section */
    includeSchemaUpdates?: boolean;
    /** Include custom trait examples section */
    includeCustomTraits?: boolean;
    /** Error detail level: 'top6' for generation, 'full' for fixing */
    errorLevel?: 'top6' | 'full';
    /** Include render-ui design guide with pattern catalog and recipes */
    includeDesignGuide?: boolean;
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate a lean orbital skill.
 *
 * Default options produce a ~15K skill focused on generation quality.
 * Set includeStdStateMachines/includeCustomTraits/errorLevel='full' for
 * the larger ~49K variant used by legacy callers.
 */
export function generateLeanOrbitalSkill(options: LeanSkillOptions = {}): string {
    const {
        includeExample = true,
        includeToolWorkflow = true,
        includeStdLibrary = false,
        stdLibraryFull = false,
        includeStdStateMachines = false,
        includeSchemaUpdates = false,
        includeCustomTraits = false,
        errorLevel = 'top6',
        includeDesignGuide = true,
    } = options;

    // Build std section based on options
    let stdSection = '';
    if (includeStdLibrary || includeStdStateMachines) {
        if (includeStdStateMachines) {
            // Include expanded behaviors with state machines (non-game only)
            stdSection = `---

${getKeyBehaviorsReference()}

---

${getStdBehaviorsWithStateMachines()}
`;
        } else if (stdLibraryFull) {
            stdSection = `---

${getStdFullReference()}
`;
        } else {
            stdSection = `---

${getStdMinimalReference()}
`;
        }
    }

    // Use compact or full decomposition/connectivity
    const decompositionSection = (includeStdStateMachines || includeCustomTraits)
        ? getDecompositionSection()
        : getDecompositionCompact();

    const connectivitySection = (includeStdStateMachines || includeCustomTraits)
        ? getOrbitalConnectivitySection()
        : getConnectivityCompact();

    return `# Orbital Generation Skill

> Generate Orbital applications using Orbital Units: Entity × Traits × Patterns

${getArchitectureSection()}

---

${getSExprQuickRef()}

---

${includeDesignGuide ? getRenderUIDesignGuide() : ''}

${stdSection}
---

${getFlowPatternSection()}

---

${decompositionSection}

---

${getPortableOrbitalOutputSection()}

---

${connectivitySection}

---

${getContextUsageCompact()}

---

${getCommonErrorsSection(errorLevel)}

${includeCustomTraits ? `---

${getCustomTraitSection()}
` : ''}
${includeToolWorkflow ? getToolWorkflowSection() : ''}

${includeSchemaUpdates ? `---

${getSchemaUpdateSection()}
` : ''}
${getCriticalOutputRequirements()}

${includeExample ? getMinimalExample() : ''}
`;
}

/**
 * Get critical output requirements section.
 * Placed near the end to reinforce requirements before generation.
 */
function getCriticalOutputRequirements(): string {
    return `---

## CRITICAL: Output Requirements

Every orbital MUST include:

### 1. domainContext (REQUIRED)
\`\`\`json
"domainContext": {
  "request": "<original user request>",
  "requestFragment": "<what part produced THIS orbital>",
  "category": "business",
  "vocabulary": { "item": "Task", "create": "Add", "delete": "Remove" }
}
\`\`\`

### 2. design (REQUIRED)
\`\`\`json
"design": {
  "style": "modern",
  "uxHints": {
    "flowPattern": "crud-cycle",
    "listPattern": "entity-table",
    "formPattern": "modal"
  }
}
\`\`\`

### 3. Business Rule Guards on SAVE (when rules exist)
If the user specifies validation constraints, add S-expression guards on transitions:
\`\`\`json
{
  "from": "Creating", "to": "Browsing", "event": "SAVE",
  "guard": ["<=", "@payload.data.score", 100],
  "effects": [["persist", "create", "Entry", "@payload.data"], ...]
}
\`\`\`

### 4. ONE Orbital Per Entity
Do NOT create multiple orbitals for the same entity. All CRUD operations belong in ONE orbital.

**Missing context fields = validation warnings. Missing guards = unenforced business rules!**`;
}

/**
 * Get minimal tool workflow section.
 */
function getToolWorkflowSection(): string {
    return `---

## Tool Workflow

### Phase 1: DECOMPOSE
Break requirements into OrbitalUnits (pure reasoning, no tools).

### Phase 2: GENERATE
Call \`generate_orbital\` for each orbital:

\`\`\`
generate_orbital({ orbital: {...}, orbitalIndex: 0, totalOrbitals: N })
generate_orbital({ orbital: {...}, orbitalIndex: 1, totalOrbitals: N })
...
\`\`\`

Each orbital is written to \`.orbitals/<name>.json\` with ALL effects (render-ui, persist, emit, set, etc.).

### Phase 3: COMBINE
Call \`finish_task\` to auto-combine and validate:

\`\`\`
finish_task({ appName: "App" })
# Reads .orbitals/*.json → schema.json → orbital validate
\`\`\`

### Phase 4: VERIFY COMPOSITION QUALITY

Before calling \`finish_task\`, verify each INIT transition:

1. **Uses a single \`render-ui\` call** with top-level \`stack\` and \`children\` — NOT flat sequential calls
2. **Has 3+ composed sections**: header (HStack: title + action), metrics (HStack/Grid of Box cards), data (entity-table/entity-cards)
3. **Uses domain-appropriate atoms**: \`badge\` for status, \`typography\` for labels/values, \`button\` for actions
4. **Props are correct**: \`submitEvent\` not \`onSubmit\`, \`actions\` not \`headerActions\`, \`fields\` not \`fieldNames\`

If any INIT transition is flat (just \`page-header\` + \`entity-table\`), redesign it as a composed VStack hierarchy before finishing.
`;
}

/**
 * Get minimal example section.
 * Enriched INIT transition: page-header + stats + searchable entity-table.
 */
function getMinimalExample(): string {
    return `---

## Example: Task Manager (Atomic Composition)

\`\`\`json
{
  "name": "Taskly",
  "orbitals": [{
    "name": "Task Management",
    "entity": {
      "name": "Task",
      "collection": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["pending", "active", "done"] }
      ]
    },
    "traits": [{
      "name": "TaskInteraction",
      "category": "interaction",
      "linkedEntity": "Task",
      "stateMachine": {
        "states": [
          { "name": "Browsing", "isInitial": true },
          { "name": "Creating" },
          { "name": "Viewing" },
          { "name": "Editing" },
          { "name": "Deleting" }
        ],
        "events": ["INIT", "CREATE", "VIEW", "EDIT", "DELETE", "SAVE", "CANCEL", "CONFIRM_DELETE"],
        "transitions": [
          {
            "from": "Browsing", "to": "Browsing", "event": "INIT",
            "effects": [
              ["render-ui", "main", {
                "type": "stack", "direction": "vertical", "gap": "lg",
                "children": [
                  { "type": "stack", "direction": "horizontal", "justify": "between", "align": "center",
                    "children": [
                      { "type": "typography", "variant": "h1", "text": "Tasks" },
                      { "type": "button", "label": "New Task", "event": "CREATE", "variant": "primary" }
                    ]
                  },
                  { "type": "stack", "direction": "horizontal", "gap": "md", "wrap": true,
                    "children": [
                      { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
                        "children": [{ "type": "typography", "variant": "caption", "text": "Total" }, { "type": "typography", "variant": "h2", "text": "@count" }] },
                      { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
                        "children": [{ "type": "typography", "variant": "caption", "text": "Active" }, { "type": "badge", "variant": "primary", "text": "@count:status=active" }] },
                      { "type": "box", "padding": "md", "bg": "card", "border": true, "rounded": "md",
                        "children": [{ "type": "typography", "variant": "caption", "text": "Done" }, { "type": "badge", "variant": "success", "text": "@count:status=done" }] }
                    ]
                  },
                  { "type": "entity-table", "entity": "Task", "columns": ["title", "status"], "searchable": true,
                    "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE" }] }
                ]
              }]
            ]
          },
          {
            "from": "Browsing", "to": "Creating", "event": "CREATE",
            "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": ["title", "status"], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]]
          },
          {
            "from": "Browsing", "to": "Viewing", "event": "VIEW",
            "effects": [["render-ui", "drawer", { "type": "entity-detail", "entity": "Task", "actions": [{ "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE", "variant": "danger" }] }]]
          },
          {
            "from": "Browsing", "to": "Editing", "event": "EDIT",
            "effects": [["render-ui", "modal", { "type": "form-section", "entity": "Task", "fields": ["title", "status"], "submitEvent": "SAVE", "cancelEvent": "CANCEL" }]]
          },
          {
            "from": "Browsing", "to": "Deleting", "event": "DELETE",
            "effects": [["render-ui", "overlay", { "type": "confirmation", "title": "Delete Task?", "message": "This action cannot be undone." }]]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "SAVE",
            "effects": [["persist", "create", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]]
          },
          {
            "from": "Creating", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Viewing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "drawer", null]]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "SAVE",
            "effects": [["persist", "update", "Task", "@payload.data"], ["render-ui", "modal", null], ["emit", "INIT"]]
          },
          {
            "from": "Editing", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "modal", null]]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CONFIRM_DELETE",
            "effects": [["persist", "delete", "Task"], ["render-ui", "overlay", null], ["emit", "INIT"]]
          },
          {
            "from": "Deleting", "to": "Browsing", "event": "CANCEL",
            "effects": [["render-ui", "overlay", null]]
          }
        ]
      }
    }],
    "pages": [{ "name": "TasksPage", "path": "/tasks", "traits": [{ "ref": "TaskInteraction" }] }]
  }]
}
\`\`\`

**Key points — Atomic Composition**:
- **INIT uses a SINGLE \`render-ui\` call** with a top-level \`stack\` containing composed \`children\`
- **3 sections composed**: header (HStack: title + button), metrics (HStack of Box stat cards), data (entity-table)
- **Atoms used**: \`typography\` (h1, h2, caption), \`badge\` (status indicators), \`button\` (actions)
- **Layout used**: \`stack\` (vertical page, horizontal rows), \`box\` (stat cards with bg/border/rounded)
- **Organism used**: \`entity-table\` with searchable + itemActions

**Prop rules** (MANDATORY):
- \`form-section\`: use \`submitEvent\` and \`cancelEvent\` — NEVER \`onSubmit\`/\`onCancel\`
- \`entity-detail\`: use \`actions\` — NEVER \`headerActions\`
- \`entity-table\`: use \`itemActions\` with \`searchable: true\`
- Events are flat strings: \`["INIT", "CREATE", ...]\` — NOT \`[{ "key": "INIT" }]\`
- ONE page per entity, not four (list/create/edit/view)
- NO separate "form-actions" pattern — it doesn't exist
`;
}

// ============================================================================
// Stat Export (for testing)
// ============================================================================

/**
 * Get skill stats for comparison.
 */
export function getLeanSkillStats(options: LeanSkillOptions = {}): { lines: number; chars: number } {
    const skill = generateLeanOrbitalSkill(options);
    return {
        lines: skill.split('\n').length,
        chars: skill.length,
    };
}

/**
 * Get comparison stats for different configurations.
 */
export function getSkillSizeComparison(): {
    minimal: { lines: number; chars: number };
    withStdMinimal: { lines: number; chars: number };
    withStdFull: { lines: number; chars: number };
    withStdStateMachines: { lines: number; chars: number };
    legacy: { lines: number; chars: number };
} {
    return {
        minimal: getLeanSkillStats({}),
        withStdMinimal: getLeanSkillStats({ includeStdLibrary: true, stdLibraryFull: false }),
        withStdFull: getLeanSkillStats({ includeStdLibrary: true, stdLibraryFull: true }),
        withStdStateMachines: getLeanSkillStats({ includeStdStateMachines: true }),
        legacy: getLeanSkillStats({
            includeStdStateMachines: true,
            includeSchemaUpdates: true,
            includeCustomTraits: true,
            errorLevel: 'full',
        }),
    };
}
