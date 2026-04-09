/**
 * LOLO Skill Generator
 *
 * Generates the "lolo" skill for .orb program generation using LOLO syntax.
 * Mirrors the "orb" skill exactly — same architecture, patterns, decomposition,
 * bindings, errors — but teaches LOLO surface syntax instead of JSON.
 *
 * The compiler auto-detects LOLO vs JSON in .orb files, so generated programs
 * use the .orb extension with LOLO syntax.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
    getArchitectureSection,
    getCommonErrorsSection,
    getDecompositionCompact,
    getConnectivityCompact,
    getBannedProps,
    getFlowPatternSection,
    getPortableOrbitalOutputSection,
    getContextUsageCompact,
} from '../prompts/skill-sections/index.js';
import {
    getSExprQuickRef,
} from '../orbitals-skills-generators/helpers.js';
import { getBindingsGuide } from '../prompts/skill-sections/bindings-guide.js';
import {
    getLoloLanguageSpec,
    getLoloEffectsReference,
    getLoloRenderUIGuide,
    getLoloExampleSection,
} from '../prompts/skill-sections/lolo-language-spec.js';

/**
 * Generate the "lolo" skill.
 *
 * Molecule-first pattern vocabulary (same as orb skill).
 * Output is LOLO syntax in .orb files (auto-detected by compiler).
 */
export function generateLoloSkill(): GeneratedSkill {
    const frontmatter = {
        name: 'lolo',
        description: 'Generate .orb programs using LOLO syntax with molecule-first composition. Atoms + molecules only, no organisms.',
        allowedTools: ['Read', 'Write', 'Edit', 'generate_orbital', 'generate_schema_orchestrated', 'finish_task', 'query_schema_structure', 'extract_chunk', 'apply_chunk'],
        version: '1.0.0',
    };

    const content = generateLoloSkillContent();

    return {
        name: 'lolo',
        frontmatter,
        content,
    };
}

function generateLoloSkillContent(): string {
    return `# LOLO Generation Skill (Molecule-First)

> Generate .orb programs using LOLO syntax: Orbital Units = Entity x Traits x Patterns
> Pattern vocabulary: atoms + molecules only. No organisms.
> Output format: LOLO syntax in .orb files (compiler auto-detects).

${getArchitectureSection()}

---

${getLoloLanguageSpec()}

---

${getSExprQuickRef()}

---

${getLoloEffectsReference()}

---

${getLoloRenderUIGuide()}

---

${getBannedProps()}

---

${getFlowPatternSection()}

---

${getDecompositionCompact()}

---

${getLoloOutputSection()}

---

${getConnectivityCompact()}

---

${getContextUsageCompact()}

---

${getCommonErrorsSection('top6')}

${getLoloValidationRules()}

${getLoloExampleSection()}

---

${getBindingsGuide()}

---

${getLoloOutputRequirements()}
`;
}

/**
 * LOLO-specific output format section.
 * Replaces getPortableOrbitalOutputSection() with LOLO format.
 */
function getLoloOutputSection(): string {
    return `## Output Format

Output LOLO syntax in a \`.orb\` file. The compiler auto-detects LOLO vs JSON.

### Single Orbital Output

\`\`\`lolo
orbital OrbitalName {
  entity EntityName [persistent: collection] {
    # fields...
  }

  trait TraitName -> EntityName [interaction] {
    # state machine...
  }

  page "/path" -> TraitName
}
\`\`\`

### Multi-Orbital Output

\`\`\`lolo
app AppName v1.0.0

orbital FirstOrbital {
  # ...
}

orbital SecondOrbital {
  # ...
}
\`\`\`

### File Convention

- File extension: \`.orb\` (compiler auto-detects LOLO syntax)
- Single-orbital programs: omit \`app\` header
- Multi-orbital programs: include \`app Name vX.Y.Z\` header`;
}

/**
 * LOLO-specific validation rules and common mistakes.
 */
function getLoloValidationRules(): string {
    return `---

## LOLO Structural Rules

| Element | Correct LOLO | Wrong | Error |
|---------|-------------|-------|-------|
| **Events in state** | \`INIT -> browsing\` | \`"INIT" -> browsing\` | Don't quote event keys |
| **Effects** | \`(set @status "done")\` | \`set @status "done"\` | Effects MUST be parenthesized |
| **Sigils** | \`@field\`, \`?field\` | \`@entity.field\` | Use bare \`@field\` (rewritten by lowering) |
| **Guard** | \`when (> @count 0)\` | \`if @count > 0\` | Guards use \`when\` + S-expression |
| **Category** | \`[interaction]\` | \`category: interaction\` | Use bracket syntax |
| **Persistence** | \`[persistent: tasks]\` | \`persistence: "persistent"\` | Use bracket syntax |
| **render-ui pattern** | \`{ type: "stack", ... }\` | \`{ "type": "stack" }\` | No quotes on keys in LOLO objects |
| **Emits** | \`emits { INIT internal }\` | \`emits: [{ event: "INIT" }]\` | Use LOLO emits block syntax |
| **Page** | \`page "/path" -> Trait\` | \`pages: [{ path: "/path" }]\` | Use LOLO page syntax |

### Binding Rules for render-ui Props

- Each prop value can have at most ONE binding: \`value: @price\`
- NEVER concatenate bindings: \`@price @currency\` is INVALID
- NEVER use inline expressions: \`@quantity <= 0\` is INVALID
- For conditional logic, use guards on transitions, not prop expressions

### Composition Quality Checklist

Before calling \`finish_task\`, verify:

\`\`\`
[] Single render-ui per transition
[] Root element is layout (stack/box/simple-grid)
[] Contains 2+ atoms (typography, badge, button, icon)
[] Contains 1+ data molecules (data-grid, data-list, form-section, stats)
[] NO organism patterns (entity-table, entity-list, page-header, etc.)
[] Uses theme variables for ALL visual properties
[] Passes orbital validate with zero errors and zero warnings
\`\`\``;
}

/**
 * Critical output requirements for the LOLO skill.
 */
function getLoloOutputRequirements(): string {
    return `## CRITICAL: Output Requirements

Every orbital MUST include:

### 1. Entity (REQUIRED — every orbital must have one)
\`\`\`lolo
entity EntityName [persistent: collection_name] {
  id : string!
  # ... domain fields
}
\`\`\`

### 2. Category tag on traits (REQUIRED)
\`\`\`lolo
trait TraitName -> EntityName [interaction] {
  # ...
}
\`\`\`

### 3. INIT transition (REQUIRED — without it, page renders blank)
\`\`\`lolo
state browsing {
  INIT -> browsing
    (fetch EntityName)
    (render-ui main { type: "stack", ... })
}
\`\`\`

### 4. Modal exits (REQUIRED for every modal/drawer state)
\`\`\`lolo
state creating {
  SAVE -> browsing
    (persist create Entity ?data)
    (render-ui modal null)
    (fetch Entity)
  CANCEL -> browsing
    (render-ui modal null)
  CLOSE -> browsing
    (render-ui modal null)
}
\`\`\`

### 5. Page binding (REQUIRED to expose traits)
\`\`\`lolo
page "/path" -> TraitName [view: list, entity: EntityName, initial]
\`\`\`

### 6. ONE Orbital Per Entity

### 7. Emits block for INIT (REQUIRED)
\`\`\`lolo
emits {
  INIT internal
}
\`\`\``;
}
