/**
 * Lean Orbital Skill Generator
 *
 * Generates a minimal, focused orbital skill by:
 * 1. Deriving type information directly from @almadar/core
 * 2. Using focused, minimal guidance sections
 * 3. Avoiding verbose explanations and redundancy
 *
 * Target: <1000 lines output (vs 4000+ in original)
 *
 * @packageDocumentation
 */

import {
    getMinimalTypeReference,
    getSExprQuickRef,
    getRenderUIQuickRef,
    getStdMinimalReference,
    getStdFullReference,
    getStdBehaviorsWithStateMachines,
    getKeyBehaviorsReference,
} from './helpers.js';
import {
    getArchitectureSection,
    getCommonErrorsSection,
    getDecompositionSection,
    getCustomTraitSection,
    getSchemaUpdateSection,
    // UX Enhancement sections (Phase 3)
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
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate a lean orbital skill.
 *
 * This produces a skill that is ~75% smaller than the original while
 * containing all essential information for orbital generation.
 */
export function generateLeanOrbitalSkill(options: LeanSkillOptions = {}): string {
    const {
        includeExample = true,
        includeToolWorkflow = true,
        includeStdLibrary = true,
        stdLibraryFull = false,
        includeStdStateMachines = true,
        includeSchemaUpdates = true,
    } = options;

    // Build std section based on options
    let stdSection = '';
    if (includeStdLibrary) {
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

    return `# Orbital Generation Skill

> Generate Orbital applications using Orbital Units: Entity × Traits × Patterns

${getArchitectureSection()}

---

${getMinimalTypeReference()}

---

${getSExprQuickRef()}

---

${getRenderUIQuickRef()}

${stdSection}
---

${getFlowPatternSection()}

---

${getDecompositionSection()}

---

${getPortableOrbitalOutputSection()}

---

${getOrbitalConnectivitySection()}

---

${getContextUsageCompact()}

---

${getCommonErrorsSection()}

---

${getCustomTraitSection()}

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

1. **DECOMPOSE**: Break requirements into OrbitalUnits
2. **GENERATE**: Call \`generate_orbital\` for each orbital
3. **COMBINE**: Call \`construct_combined_schema\` (FINAL STEP)

\`\`\`
generate_orbital({ orbital: {...}, orbitalIndex: 0, totalOrbitals: N })
generate_orbital({ orbital: {...}, orbitalIndex: 1, totalOrbitals: N })
...
construct_combined_schema({ name: "App", description: "..." })
# STOP HERE - job is done
\`\`\`
`;
}

/**
 * Get minimal example section.
 */
function getMinimalExample(): string {
    return `---

## Example: Task Manager

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
              ["render-ui", "main", { "type": "page-header", "title": "Tasks", "actions": [{ "label": "New Task", "event": "CREATE", "variant": "primary" }] }],
              ["render-ui", "main", { "type": "entity-table", "entity": "Task", "columns": ["title", "status"], "itemActions": [{ "label": "View", "event": "VIEW" }, { "label": "Edit", "event": "EDIT" }, { "label": "Delete", "event": "DELETE" }] }]
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

**Key points**:
- ONE page (TasksPage) not four (list/create/edit/view)
- INIT transition renders initial UI (page-header + entity-table)
- States are OBJECTS with \`isInitial\` flag
- **Actions are INSIDE patterns (use unified props)**:
  - \`page-header\` has \`actions: [{label, event, variant}]\`
  - \`entity-table\` has \`itemActions: [{label, event}]\`
  - \`form-section\` has \`submitEvent\` and \`cancelEvent\` (NOT onSubmit/onCancel!)
  - \`entity-detail\` has \`actions\` (NOT headerActions!)
  - \`confirmation\` emits action events
- **NEVER use**: \`onSubmit\`, \`onCancel\`, \`headerActions\`, \`loading\` (use \`isLoading\`)
- NO separate "form-actions" pattern - it doesn't exist!
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
    withoutStd: { lines: number; chars: number };
    withStdMinimal: { lines: number; chars: number };
    withStdFull: { lines: number; chars: number };
    withStdStateMachines: { lines: number; chars: number };
} {
    return {
        withoutStd: getLeanSkillStats({ includeStdLibrary: false }),
        withStdMinimal: getLeanSkillStats({ includeStdLibrary: true, stdLibraryFull: false, includeStdStateMachines: false }),
        withStdFull: getLeanSkillStats({ includeStdLibrary: true, stdLibraryFull: true, includeStdStateMachines: false }),
        withStdStateMachines: getLeanSkillStats({ includeStdLibrary: true, includeStdStateMachines: true }),
    };
}
