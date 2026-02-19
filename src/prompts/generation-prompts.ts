/**
 * Generation Prompts
 *
 * Prompts for the generateFullOrbital() function composed from reusable skill sections.
 * These are used by @almadar/agent for programmatic orbital generation.
 *
 * @packageDocumentation
 */

import { getArchitectureSection } from './skill-sections/architecture.js';
import { getDecompositionSection, getDecompositionChecklist } from './skill-sections/decomposition.js';
import { getCommonErrorsSection, getValidationHintsSection } from './skill-sections/common-errors.js';
import { getCustomTraitSection } from './skill-sections/custom-traits.js';
import { getUsesImportSection } from './skill-sections/uses-imports.js';
import {
  getMinimalTypeReference,
  getPatternTypesCompact,
  getSExprQuickRef,
  getRenderUIQuickRef,
  getFieldTypesCompact,
} from './type-references.js';

/**
 * Get prompt for decomposing a request into orbital units.
 * Used by the main agent before calling generateFullOrbital on each unit.
 */
export function getOrbitalDecompositionPrompt(): string {
  return `
## Orbital Unit Decomposition Protocol

${getArchitectureSection()}

---

${getDecompositionSection()}

---

${getDecompositionChecklist()}

---

## Pattern Selection

${getPatternTypesCompact()}

---

${getValidationHintsSection()}
`.trim();
}

/**
 * Get prompt for expanding a lightweight orbital into a full orbital.
 * This is the main prompt used by generateFullOrbital().
 */
export function getFullOrbitalPrompt(): string {
  return `
# Subagent: Expand Lightweight Orbital to Full Orbital

You receive a lightweight OrbitalDefinition and must expand it into a complete FullOrbitalUnit with traits, state machines, and UI.

---

${getArchitectureSection()}

---

${getMinimalTypeReference()}

---

${getSExprQuickRef()}

---

${getRenderUIQuickRef()}

---

${getFieldTypesCompact()}

---

${getCustomTraitSection()}

---

${getUsesImportSection()}

---

${getCommonErrorsSection()}

---

## Output Format

Return ONLY valid JSON matching the FullOrbitalUnit structure. No markdown, no explanations.

**CRITICAL: The entity field is REQUIRED at the orbital level:**

\`\`\`json
{
  "name": "Product Management",
  "entity": {          // ← REQUIRED: Must have this field
    "name": "Product",
    "collection": "products",
    "persistence": "persistent",
    "fields": [
      { "name": "name", "type": "string", "required": true },
      { "name": "price", "type": "number" }
    ]
  },
  "traits": [ ... ],
  "pages": [ ... ]
}
\`\`\`

**Validation Rules:**
- MUST include "entity" field at orbital level (NOT just linkedEntity in traits)
- entity.name must match the orbital's primary entity
- entity.collection must be plural lowercase (e.g., "products", not "Product")
- entity.fields must have at least one field

**Common Mistake:**
- ❌ WRONG: Only putting entity reference in trait.linkedEntity
- ✅ CORRECT: Full entity object in orbital.entity field
`.trim();
}

/**
 * Get prompt for requirements-aware decomposition.
 * Used when extracted requirements are available from analysis phase.
 */
export function getRequirementsDecomposePrompt(): string {
  return `
## Requirements-Aware Decomposition

When decomposing with extracted requirements, use them to improve orbital identification:

### Using Entity Requirements

For each entity in \`requirements.entities\`:
- Create one OrbitalUnit per **primary** entity
- Group related entities (e.g., Order + OrderItem in same orbital)
- Consider entity relationships when grouping

### Using State Requirements

For each state in \`requirements.states\`:
- Identify which entity lifecycle it belongs to
- Create states in that entity's trait state machine

### Using Event Requirements

For each event in \`requirements.events\`:
- Map to trait events (UPPERCASE)
- Connect to appropriate transitions

### Using Guard Requirements

For each guard in \`requirements.guards\`:
- Identify which entity the guard applies to
- Include guard description in that entity's orbital
- The subagent will convert to guard expression

### Using Effect Requirements

For each effect in \`requirements.effects\`:
- Identify the trigger (e.g., "on confirmation")
- Identify the action (e.g., "send email")
- Include in relevant orbital's effects list

${getValidationHintsSection()}
`.trim();
}

/**
 * Get prompt for generating traits from requirements.
 * Used when requirements need to be converted to trait state machines.
 */
export function getRequirementsTraitPrompt(): string {
  return `
## Generating Traits from Requirements

When generating a FullOrbitalUnit, convert requirements to schema elements:

### Guard Patterns

Common guard patterns to recognize:

| Requirement | Guard Expression |
|-------------|-----------------|
| "only managers can approve" | \`["=", "@context.user.role", "manager"]\` |
| "amount must be positive" | \`[">", "@entity.amount", 0]\` |
| "if status is pending" | \`["=", "@entity.status", "pending"]\` |
| "user is authenticated" | \`["=", "@context.user.authenticated", true]\` |

### Effect Patterns

Common effect patterns to recognize:

| Requirement | Effect Type | Template |
|-------------|------------|----------|
| "send email" | \`emit\` | \`["emit", "EMAIL_SEND", { "to": "...", "subject": "..." }]\` |
| "update status" | \`set\` | \`["set", "@entity.status", "newValue"]\` |
| "navigate to page" | \`navigate\` | \`["navigate", "/page"]\` |
| "show notification" | \`emit\` | \`["emit", "NOTIFY", { "message": "..." }]\` |

### State Machine Construction

1. Extract states from requirements.states
2. Create events for state transitions (UPPERCASE)
3. Add transitions with appropriate guards
4. Include render-ui effects for each state

${getCommonErrorsSection()}
`.trim();
}
